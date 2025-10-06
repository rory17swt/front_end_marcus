import { useContext, useEffect, useState } from "react"
import { Navigate, useNavigate, useParams} from "react-router"
import { updateEvent, getSingleEvent} from "../../services/events"
import { UserContext } from "../../contexts/UserContext"
import Spinner from "../Spinner/Spinner"


export default function EventUpdate() {
    const { user } = useContext(UserContext)

    const [formData, setFormData] = useState({
        title: '',
        datetime: '',
        location: '',
        event_url: '',
        image: ''
    })
    const [error, setError] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [previewImage, setPreviewImage] = useState(null)

    const { eventId } = useParams()
    const navigate = useNavigate()

    function formatForDatetimeLocal(datetimeStr) {
        const date = new Date(datetimeStr)
        const timezoneOffsetMs = date.getTimezoneOffset() * 60000
        const localISOTTime = new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16)
        return localISOTTime
    }

    function handleChange({ target: { name, value, type, files } }) {
        if (type === 'file') {
            const file = files[0]
            if (file) {
                setPreviewImage(URL.createObjectURL(file))
                setFormData(prev => ({ ...prev, [name]: file }))
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }))
        }
    }

    async function handleSubmit(event) {
        event.preventDefault()
        setIsLoading(true)
        try {
            const { data } = await updateEvent(eventId, formData)
            navigate('/')
        } catch (error) {
            setError(error.response.data || {})
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        async function getEventData() {
            setIsLoading(true)
            try {
                const { data } = await getSingleEvent(eventId)
                setFormData({
                    title: data.title,
                    datetime: formatForDatetimeLocal(data.datetime),
                    location: data.location,
                    event_url: data.event_url,
                    image: data.image
                })
            } finally {
                setIsLoading(false)
            }
        }
        getEventData()
    }, [eventId])

    useEffect(() => {
        return () => {
            if (previewImage) URL.revokeObjectURL(previewImage)
        }
    }, [previewImage])

    
    return (
        <div>
            <section>
                <form onSubmit={handleSubmit}>
                    <h1>Update your Event</h1>

                    {/* Title */}
                    <div>
                        <label htmlFor="title">Title: </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                        {error.title && <p>{error.title}</p>}
                    </div>

                    {/* Date & Time */}
                    <div>
                        <label htmlFor="datetime">Date & Time: </label>
                        <input
                            type="datetime-local"
                            id="datetime"
                            name="datetime"
                            value={formData.datetime}
                            onChange={handleChange}
                            required
                        />
                        {error.datetime && <p>{error.datetime}</p>}
                    </div>

                    {/* Location */}
                    <div>
                        <label htmlFor="location">Location: </label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                        />
                        {error.location && <p>{error.location}</p>}
                    </div>
                    
                    {/* Event URL */}
                    <div>
                        <label htmlFor="event_url">Event URL: </label>
                        <input
                            type="url"
                            id="event_url"
                            name="event_url"
                            value={formData.event_url}
                            onChange={handleChange}
                            required
                        />
                        {error.event_url && <p>{error.event_url}</p>}
                    </div>

                    {/* Image */}
                    <div>
                        <label htmlFor="image">Image: </label>
                        {(previewImage || formData.image) && (
                            <img src={previewImage || formData.image} alt="Event Image" />
                        )}
                        <input
                            type="file"
                            id="image"
                            name="image"
                            onChange={handleChange}
                        />
                        {error.image && <p>{error.image}</p>}
                    </div>

                    {/* Submit Button */}
                    <button>
                        {isLoading ? <Spinner /> : 'Update Event!'}
                    </button>
                </form>
            </section>
        </div>
    )



}