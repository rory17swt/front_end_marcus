import { useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { UserContext } from "../../contexts/UserContext"
import { createEvent } from "../../services/events"

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
            await createEvent(formData)
            navigate('/')
        } catch (error) {
            setError(error.response?.data || {})
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#E8DCC8] flex justify-center px-4 py-10">
            <section className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-8 md:p-10">

                <h1 className="text-3xl md:text-4xl font-serif text-center text-gray-800 mb-10">
                    Add an Upcoming Event
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6 font-body">

                    {/* Title */}
                    <div>
                        <label
                            htmlFor="title"
                            className="block mb-1 text-gray-700 font-medium"
                        >
                            Event Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md px-4 py-2 
                         focus:outline-none focus:border-[#C4A77D] transition-colors"
                        />
                        {error.title && <p className="text-red-600 text-sm">{error.title}</p>}
                    </div>

                    {/* Date & Time */}
                    <div>
                        <label
                            htmlFor="datetime"
                            className="block mb-1 text-gray-700 font-medium"
                        >
                            Date & Time
                        </label>
                        <input
                            type="datetime-local"
                            id="datetime"
                            name="datetime"
                            value={formData.datetime}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md px-4 py-2 
                         focus:outline-none focus:border-[#C4A77D] transition-colors"
                        />
                        {error.datetime && <p className="text-red-600 text-sm">{error.datetime}</p>}
                    </div>

                    {/* Location */}
                    <div>
                        <label
                            htmlFor="location"
                            className="block mb-1 text-gray-700 font-medium"
                        >
                            Location
                        </label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md px-4 py-2 
                         focus:outline-none focus:border-[#C4A77D] transition-colors"
                        />
                        {error.location && <p className="text-red-600 text-sm">{error.location}</p>}
                    </div>

                    {/* Event URL */}
                    <div>
                        <label
                            htmlFor="event_url"
                            className="block mb-1 text-gray-700 font-medium"
                        >
                            Event URL
                        </label>
                        <input
                            type="url"
                            id="event_url"
                            name="event_url"
                            value={formData.event_url}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md px-4 py-2 
                         focus:outline-none focus:border-[#C4A77D] transition-colors"
                        />
                        {error.event_url && <p className="text-red-600 text-sm">{error.event_url}</p>}
                    </div>

                    {/* Image */}
                    <div>
                        <label
                            htmlFor="image"
                            className="block mb-2 text-gray-700 font-medium"
                        >
                            Event Image
                        </label>

                        {/* Preview */}
                        {(previewImage || formData.image) && (
                            <img
                                src={previewImage || formData.image}
                                alt="Event Preview"
                                className="w-full h-64 object-cover rounded-lg border border-gray-300 mb-3 shadow-sm"
                            />
                        )}

                        <input
                            type="file"
                            id="image"
                            name="image"
                            onChange={handleChange}
                            required
                            className="w-full"
                        />
                        {error.image && <p className="text-red-600 text-sm">{error.image}</p>}
                    </div>

                    {/* Submit Button */}
                    <button
                        disabled={isLoading}
                        className="w-full bg-[#C4A77D] text-white py-2 rounded-md 
             hover:bg-[#B59770] transition disabled:opacity-60 flex justify-center items-center"
                    >
                        {isLoading ? "Adding Event..." : "Add Event!"}
                    </button>
                </form>
            </section>
        </div>
    )
}
