import { useContext, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { updateEvent, getSingleEvent } from "../../services/events"
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
        return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16)
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
            await updateEvent(eventId, formData)
            navigate('/')
        } catch (error) {
            setError(error.response?.data || {})
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
        <div className="w-full min-h-screen bg-[#E8DCC8] flex justify-center items-start py-12 px-4">
            <div className="w-full max-w-3xl bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-3xl font-bold mb-6 text-gray-900 text-center">Update Your Event</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-gray-700 font-medium mb-1">Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-gold focus:outline-none"
                        />
                        {error.title && <p className="text-red-500 text-sm mt-1">{error.title}</p>}
                    </div>

                    {/* Date & Time */}
                    <div>
                        <label htmlFor="datetime" className="block text-gray-700 font-medium mb-1">Date & Time</label>
                        <input
                            type="datetime-local"
                            id="datetime"
                            name="datetime"
                            value={formData.datetime}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-gold focus:outline-none"
                        />
                        {error.datetime && <p className="text-red-500 text-sm mt-1">{error.datetime}</p>}
                    </div>

                    {/* Location */}
                    <div>
                        <label htmlFor="location" className="block text-gray-700 font-medium mb-1">Location</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-gold focus:outline-none"
                        />
                        {error.location && <p className="text-red-500 text-sm mt-1">{error.location}</p>}
                    </div>

                    {/* Event URL */}
                    <div>
                        <label htmlFor="event_url" className="block text-gray-700 font-medium mb-1">Event URL</label>
                        <input
                            type="url"
                            id="event_url"
                            name="event_url"
                            value={formData.event_url}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-gold focus:outline-none"
                        />
                        {error.event_url && <p className="text-red-500 text-sm mt-1">{error.event_url}</p>}
                    </div>

                    {/* Image */}
                    <div>
                        <label htmlFor="image" className="block text-gray-700 font-medium mb-1">Event Image</label>
                        {(previewImage || formData.image) && (
                            <img
                                src={previewImage || formData.image}
                                alt="Event Preview"
                                className="w-full h-48 object-cover rounded-md mb-2 border border-gray-200"
                            />
                        )}
                        <input
                            type="file"
                            id="image"
                            name="image"
                            onChange={handleChange}
                            className="w-full text-gray-700"
                        />
                        {error.image && <p className="text-red-500 text-sm mt-1">{error.image}</p>}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#C4A77D] text-white py-2 rounded-md hover:bg-[#B59770] transition-colors font-medium flex justify-center items-center"
                    >
                        {isLoading ? <Spinner loading={isLoading} /> : 'Update Event'}
                    </button>
                </form>
            </div>
        </div>
    )
}
