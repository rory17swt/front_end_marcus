import { useContext, useState, useEffect } from "react"
import { useNavigate} from "react-router"
import { UserContext } from "../../contexts/UserContext"
import { createEvent } from "../../services/events"
import Spinner from "../Spinner/Spinner"


export default function EventCreate() {
    const { user } = useContext(UserContext)

    const [formData, setFormData] = useState({
        title: '',
        datetime: '',
        location: '',
        event_url: '',
        image: ''
    })

    const [previewImage, setPreviewImage] = useState(null)
    const [error, setError] = useState({})
    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate()

    function handleChange({ target: { name, value, type, files } }) {
        if (type === 'file') {
            const file = files[0]
            if (file) {
                setPreviewImage(URL.createObjectURL(file))
                setFormData({ ...formData, [name]: file })
            }
        } else {
            setFormData({ ...formData, [name]: value })
        }
    }

    useEffect(() => {
        return () => {
            if (previewImage) URL.revokeObjectURL(previewImage)
        }
    }, [previewImage])

    async function handleSubmit(event) {
        event.preventDefault()
        setIsLoading(true)
        try {
            const { data } = await createEvent(formData)
            navigate('/')
        } catch (error) {
            setError(error.response.data)
        } finally {
            setIsLoading(false)
        }
    }


    return (
        <div>
            <section>
                <form onSubmit={handleSubmit}>
                    <h1>Add an Upcoming Event!</h1>

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
                            required
                        />
                        {error.image && <p>{error.image}</p>}
                    </div>

                    {/* Submit Button */}
                    <button>
                        {isLoading ? <Spinner /> : 'Add Event!'}
                    </button>
                </form>
            </section>
        </div>
    )
}