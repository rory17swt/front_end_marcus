import { useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { UserContext } from "../../contexts/UserContext"
import { createMedia } from "../../services/media"


export default function MediaCreate() {
    const { user } = useContext(UserContext)

    const [formData, setFormData] = useState({
        images: [],
        youtube_url: ''
    })

    const [previewImages, setPreviewImages] = useState([])
    const [error, setError] = useState({})
    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate()

    function handleChange({ target: { name, value, type, files } }) {
        if (type === 'file') {
            const fileArray = Array.from(files)
            const previews = fileArray.map(file => URL.createObjectURL(file))
            setPreviewImages(previews)
            setFormData({ ...formData, images: fileArray })
        } else {
            setFormData({ ...formData, [name]: value })
        }
    }

    useEffect(() => {
        return () => {
            previewImages.forEach(preview => URL.revokeObjectURL(preview))
        }
    }, [previewImages])

    async function handleSubmit(event) {
        event.preventDefault()
        setIsLoading(true)
        setError({})

        try {
            const promises = []

            // Upload images
            if (formData.images.length > 0) {
                for (const img of formData.images) {
                    const imgData = new FormData()
                    imgData.append("image", img)
                    promises.push(createMedia(imgData))
                }
            }

            // Upload YouTube URL
            if (formData.youtube_url.trim()) {
                const ytData = new FormData()
                ytData.append("youtube_url", formData.youtube_url.trim())
                promises.push(createMedia(ytData))
            }

            if (promises.length === 0) {
                setError({ non_field_errors: "You must provide at least one image or YouTube URL." })
                setIsLoading(false)
                return
            }

            await Promise.all(promises)

            navigate("/media")
        } catch (err) {
            setError(err.response?.data || { non_field_errors: "Failed to upload media" })
            console.error(err)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#E8DCC8] flex justify-center px-4 py-10">
            <section className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-8 md:p-10">

                <h1 className="text-3xl md:text-4xl font-serif text-gray-800 text-center mb-10">
                    Upload Media
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6 font-body">

                    {/* Image Upload */}
                    <div>
                        <label
                            htmlFor="images"
                            className="block mb-2 text-gray-700 font-medium"
                        >
                            Images (you may select multiple)
                        </label>

                        {/* Preview grid */}
                        {previewImages.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                                {previewImages.map((src, idx) => (
                                    <img
                                        key={idx}
                                        src={src}
                                        alt={`Preview ${idx + 1}`}
                                        className="w-full h-32 object-cover rounded-lg border border-gray-300 shadow-sm"
                                    />
                                ))}
                            </div>
                        )}

                        <input
                            type="file"
                            id="images"
                            name="images"
                            accept="image/*"
                            multiple
                            onChange={handleChange}
                            className="w-full"
                        />

                        {error.image && (
                            <p className="text-red-600 text-sm mt-1">{error.image}</p>
                        )}
                    </div>

                    {/* YouTube URL */}
                    <div>
                        <label
                            htmlFor="youtube_url"
                            className="block mb-1 text-gray-700 font-medium"
                        >
                            YouTube URL (optional)
                        </label>
                        <input
                            type="url"
                            id="youtube_url"
                            name="youtube_url"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={formData.youtube_url}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md px-4 py-2 
                         focus:outline-none focus:border-[#C4A77D] transition-colors"
                        />

                        {error.youtube_url && (
                            <p className="text-red-600 text-sm mt-1">{error.youtube_url}</p>
                        )}
                    </div>

                    {/* General Error */}
                    {error.non_field_errors && (
                        <p className="text-red-600 text-sm">{error.non_field_errors}</p>
                    )}

                    {/* Submit Button */}
                    <button
                        disabled={isLoading}
                        className="w-full bg-[#C4A77D] text-white py-2 rounded-md 
           hover:bg-[#B59770] transition disabled:opacity-60 flex justify-center"
                    >
                        {isLoading ? "Adding Media..." : "Upload Media"}
                    </button>
                </form>
            </section>
        </div>
    )
}
