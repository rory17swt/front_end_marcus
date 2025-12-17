import { useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { UserContext } from "../../contexts/UserContext"
import imageCompression from 'browser-image-compression'
import { createMedia, getAllProductions, createProduction, deleteProduction } from "../../services/media"

export default function MediaCreate() {
    const { user } = useContext(UserContext)

    const [formData, setFormData] = useState({
        images: [],
        youtube_url: '',
        production: ''
    })

    const [productions, setProductions] = useState([])
    const [newProduction, setNewProduction] = useState({ name: '', year: '' })
    const [previewImages, setPreviewImages] = useState([])
    const [error, setError] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [productionLoading, setProductionLoading] = useState(false)

    const navigate = useNavigate()

    useEffect(() => {
        fetchProductions()
    }, [])

    async function fetchProductions() {
        try {
            const res = await getAllProductions()
            setProductions(res.data)
        } catch (err) {
            console.error('Failed to load productions', err)
        }
    }

    async function handleChange({ target: { name, value, type, files } }) {
        if (type === 'file') {
            const fileArray = Array.from(files)

            const options = {
                maxSizeMB: 9,
                maxWidthOrHeight: 4096,
                useWebWorker: true
            }

            try {
                const compressed = await Promise.all(
                    fileArray.map(file => imageCompression(file, options))
                )
                const previews = compressed.map(file => URL.createObjectURL(file))
                setPreviewImages(previews)
                setFormData({ ...formData, images: compressed })
            } catch (err) {
                console.error('Compression failed', err)
                setError({ image: 'Failed to process images' })
            }
        } else {
            setFormData({ ...formData, [name]: value })
        }
    }

    function handleProductionInputChange({ target: { name, value } }) {
        setNewProduction({ ...newProduction, [name]: value })
    }

    async function handleCreateProduction(e) {
        e.preventDefault()
        if (!newProduction.name.trim()) return

        setProductionLoading(true)
        try {
            const data = { name: newProduction.name.trim() }
            if (newProduction.year) data.year = parseInt(newProduction.year)

            await createProduction(data)
            await fetchProductions()
            setNewProduction({ name: '', year: '' })
        } catch (err) {
            console.error('Failed to create production', err)
            alert('Failed to create production')
        } finally {
            setProductionLoading(false)
        }
    }

    async function handleDeleteProduction(slug) {
        if (!confirm('Delete this production? Images will be untagged but not deleted.')) return

        try {
            await deleteProduction(slug)
            await fetchProductions()
            // Clear selection if deleted production was selected
            if (formData.production) {
                const deleted = productions.find(p => p.slug === slug)
                if (deleted && formData.production === String(deleted.id)) {
                    setFormData({ ...formData, production: '' })
                }
            }
        } catch (err) {
            console.error('Failed to delete production', err)
            alert('Failed to delete production')
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
                    if (formData.production) {
                        imgData.append("production", formData.production)
                    }
                    promises.push(createMedia(imgData))
                }
            }

            // Upload YouTube URL (no production tag)
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

                {/* ============ PRODUCTION MANAGEMENT ============ */}
                <div className="mb-10 p-4 bg-gray-50 rounded-lg">
                    <h2 className="text-xl font-serif text-gray-800 mb-4">Manage Productions</h2>

                    {/* Create new production */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <input
                            type="text"
                            name="name"
                            placeholder="Production name"
                            value={newProduction.name}
                            onChange={handleProductionInputChange}
                            className="flex-1 min-w-[150px] border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#C4A77D]"
                        />
                        <input
                            type="number"
                            name="year"
                            placeholder="Year"
                            value={newProduction.year}
                            onChange={handleProductionInputChange}
                            className="w-24 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-[#C4A77D]"
                        />
                        <button
                            onClick={handleCreateProduction}
                            disabled={productionLoading || !newProduction.name.trim()}
                            className="bg-[#C4A77D] text-white px-4 py-2 rounded-md hover:bg-[#B59770] disabled:opacity-50 transition-colors"
                        >
                            {productionLoading ? 'Adding...' : 'Add'}
                        </button>
                    </div>

                    {/* List existing productions */}
                    {productions.length > 0 ? (
                        <ul className="space-y-2">
                            {productions.map(prod => (
                                <li key={prod.id} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200">
                                    <span className="text-gray-700">
                                        {prod.name} {prod.year && `(${prod.year})`}
                                        <span className="text-gray-400 text-sm ml-2">
                                            — {prod.media_count} image{prod.media_count !== 1 && 's'}
                                        </span>
                                    </span>
                                    <button
                                        onClick={() => handleDeleteProduction(prod.slug)}
                                        className="text-red-500 hover:text-red-700 text-sm"
                                    >
                                        Delete
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-sm">No productions yet. Create one above.</p>
                    )}
                </div>

                {/* ============ MEDIA UPLOAD FORM ============ */}
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
                            <div className="flex flex-wrap gap-4 mb-4">
                                {previewImages.map((src, idx) => (
                                    <img
                                        key={idx}
                                        src={src}
                                        alt={`Preview ${idx + 1}`}
                                        className="max-h-48 rounded-lg border border-gray-300 shadow-sm"
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

                    {/* Production Dropdown (for images) */}
                    {formData.images.length > 0 && (
                        <div>
                            <label
                                htmlFor="production"
                                className="block mb-1 text-gray-700 font-medium"
                            >
                                Tag with Production (optional)
                            </label>
                            <select
                                id="production"
                                name="production"
                                value={formData.production}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-[#C4A77D] transition-colors"
                            >
                                <option value="">No production</option>
                                {productions.map(prod => (
                                    <option key={prod.id} value={prod.id}>
                                        {prod.name} {prod.year && `(${prod.year})`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

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