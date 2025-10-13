import { useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { UserContext } from "../../contexts/UserContext"
import { createMedia } from "../../services/media"
import Spinner from "../Spinner/Spinner"


export default function MediaCreate() {
    const { user } = useContext(UserContext)

    const [formData, setFormData] = useState({
        image: '',
        youtube_url: ''
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
            const { data } = await createMedia(formData)
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
                    <h1>Upload Media</h1>

                    {/* Image */}
                    <div>
                        <label htmlFor="image">Image: </label>
                        {(previewImage || formData.image) && (
                            <img 
                                src={previewImage || formData.image} 
                                alt="Media Image" 
                                style={{ maxWidth: '300px', height: 'auto' }}
                            />
                        )}
                        <input
                            type="file"
                            id="image"
                            name="image"
                            accept="image/*"
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
                    <button>
                        {isLoading ? <Spinner /> : 'Upload Media'}
                    </button>
                </form>
            </section>
        </div>
    )
}