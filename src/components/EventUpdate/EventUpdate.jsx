import { useContext, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { updateEvent, getSingleEvent } from "../../services/events"
import { UserContext } from "../../contexts/UserContext"

export default function EventUpdate() {
    const { user } = useContext(UserContext)
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '',
        location: '',
        event_url: '',
        image: ''
    })
    const [error, setError] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [previewImage, setPreviewImage] = useState(null)
    const { eventId } = useParams()
    const navigate = useNavigate()

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
            const submitData = {
                ...formData,
                datetime: `${formData.date}T${formData.time}`
            }
            delete submitData.date
            delete submitData.time
            await updateEvent(eventId, submitData)
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
                const dateObj = new Date(data.datetime)
                const date = dateObj.toISOString().slice(0, 10)
                const hours = dateObj.getHours().toString().padStart(2, '0')
                const minutes = dateObj.getMinutes().toString().padStart(2, '0')

                setFormData({
                    title: data.title,
                    date: date,
                    time: `${hours}:${minutes}`,
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

                    {/* Date */}
                    <div>
                        <label htmlFor="date" className="block text-gray-700 font-medium mb-1">Date</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-gold focus:outline-none"
                        />
                        {error.date && <p className="text-red-500 text-sm mt-1">{error.date}</p>}
                    </div>

                    {/* Time */}
                    <div>
                        <label htmlFor="time" className="block text-gray-700 font-medium mb-1">Time</label>
                        <select
                            id="time"
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-gold focus:outline-none"
                        >
                            <option value="">Select time</option>
                            {Array.from({ length: 24 * 4 }, (_, i) => {
                                const hours = Math.floor(i / 4).toString().padStart(2, '0')
                                const minutes = ((i % 4) * 15).toString().padStart(2, '0')
                                return (
                                    <option key={i} value={`${hours}:${minutes}`}>
                                        {hours}:{minutes}
                                    </option>
                                )
                            })}
                        </select>
                        {error.time && <p className="text-red-500 text-sm mt-1">{error.time}</p>}
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
                        {isLoading ? 'Updating Event...' : 'Update Event'}
                    </button>
                </form>
            </div>
        </div>
    )
}