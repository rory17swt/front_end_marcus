import { useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { UserContext } from "../../contexts/UserContext"
import { createMedia } from "../../services/media"
import Spinner from "../Spinner/Spinner"


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

            // Create a Media object for each image
            if (formData.images.length > 0) {
                for (const image of formData.images) {
                    const imageFormData = new FormData()
                    imageFormData.append('image', image)
                    promises.push(createMedia(imageFormData))
                }
            }

            // Create a separate Media object for YouTube URL if provided
            if (formData.youtube_url.trim()) {
                const youtubeFormData = new FormData()
                youtubeFormData.append('youtube_url', formData.youtube_url.trim())
                promises.push(createMedia(youtubeFormData))
            }

            // Check if at least one media type is provided
            if (promises.length === 0) {
                setError({ non_field_errors: 'You must provide at least one image or YouTube URL.' })
                setIsLoading(false)
                return
            }

            // Execute all uploads
            await Promise.all(promises)
            
            navigate('/media')
        } catch (error) {
            setError(error.response?.data || { non_field_errors: 'Failed to upload media' })
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }


    return (
        <div>
            <section>
                <form onSubmit={handleSubmit}>
                    <h1>Upload Media</h1>

                    {/* Images */}
                    <div>
                        <label htmlFor="images">Images (multiple allowed): </label>
                        {previewImages.length > 0 && (
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                                {previewImages.map((preview, index) => (
                                    <img 
                                        key={index}
                                        src={preview} 
                                        alt={`Preview ${index + 1}`} 
                                        style={{ maxWidth: '150px', height: 'auto' }}
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
                        />
                        {error.image && <p>{error.image}</p>}
                    </div>

                    {/* YouTube URL */}
                    <div>
                        <label htmlFor="youtube_url">YouTube URL (optional): </label>
                        <input
                            type="url"
                            id="youtube_url"
                            name="youtube_url"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={formData.youtube_url}
                            onChange={handleChange}
                        />
                        {error.youtube_url && <p>{error.youtube_url}</p>}
                    </div>

                    {/* General Error */}
                    {error.non_field_errors && <p>{error.non_field_errors}</p>}

                    {/* Submit Button */}
                    <button disabled={isLoading}>
                        {isLoading ? <Spinner /> : 'Upload Media'}
                    </button>
                </form>
            </section>
        </div>
    )
}