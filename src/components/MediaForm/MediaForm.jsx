import { useContext, useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { UserContext } from "../../contexts/UserContext"
import imageCompression from 'browser-image-compression'
import { createMedia, getAllProductions, createProduction, updateProduction, deleteProduction } from "../../services/media"

export default function MediaCreate() {
    const { user } = useContext(UserContext)

    const [formData, setFormData] = useState({
        images: [],
        youtube_url: '',
        category: '',
        production: ''
    })

    const [productions, setProductions] = useState([])
    const [newProduction, setNewProduction] = useState({ name: '', year: '' })
    const [editingProduction, setEditingProduction] = useState(null)
    const [editValues, setEditValues] = useState({ name: '', year: '' })
    const [previewImages, setPreviewImages] = useState([])
    const [error, setError] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [productionLoading, setProductionLoading] = useState(false)
    const [showDeletePopup, setShowDeletePopup] = useState(false)
    const [productionToDelete, setProductionToDelete] = useState(null)

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
            if (name === 'category' && value === 'personality') {
                setFormData({ ...formData, category: value, production: '' })
            } else {
                setFormData({ ...formData, [name]: value })
            }
        }
    }

    function handleProductionInputChange({ target: { name, value } }) {
        setNewProduction({ ...newProduction, [name]: value })
    }

    function handleEditInputChange({ target: { name, value } }) {
        setEditValues({ ...editValues, [name]: value })
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

    function startEditing(prod) {
        setEditingProduction(prod.slug)
        setEditValues({ name: prod.name, year: prod.year || '' })
    }

    function cancelEditing() {
        setEditingProduction(null)
        setEditValues({ name: '', year: '' })
    }

    async function handleUpdateProduction(slug) {
        if (!editValues.name.trim()) return

        setProductionLoading(true)
        try {
            const data = { name: editValues.name.trim() }
            if (editValues.year) {
                data.year = parseInt(editValues.year)
            } else {
                data.year = null
            }

            await updateProduction(slug, data)
            await fetchProductions()
            setEditingProduction(null)
            setEditValues({ name: '', year: '' })
        } catch (err) {
            console.error('Failed to update production', err)
            alert('Failed to update production')
        } finally {
            setProductionLoading(false)
        }
    }

    function handleDeleteClick(slug) {
        setProductionToDelete(slug)
        setShowDeletePopup(true)
    }

    async function confirmDelete() {
        setShowDeletePopup(false)
        try {
            await deleteProduction(productionToDelete)
            await fetchProductions()
            if (formData.production) {
                const deleted = productions.find(p => p.slug === productionToDelete)
                if (deleted && formData.production === String(deleted.id)) {
                    setFormData({ ...formData, production: '' })
                }
            }
        } catch (err) {
            console.error('Failed to delete production', err)
            alert('Failed to delete production')
        } finally {
            setProductionToDelete(null)
        }
    }

    function cancelDelete() {
        setShowDeletePopup(false)
        setProductionToDelete(null)
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

        if (formData.images.length > 0 && !formData.category) {
            setError({ category: "Please select a category for your images." })
            setIsLoading(false)
            return
        }

        try {
            const promises = []

            if (formData.images.length > 0) {
                for (const img of formData.images) {
                    const imgData = new FormData()
                    imgData.append("image", img)
                    imgData.append("category", formData.category)
                    if (formData.category === 'production' && formData.production) {
                        imgData.append("production", formData.production)
                    }
                    promises.push(createMedia(imgData))
                }
            }

            if (formData.youtube_url.trim()) {
                const ytData = new FormData()
                ytData.append("youtube_url", formData.youtube_url.trim())
                ytData.append("category", "production")
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

                    {productions.length > 0 ? (
                        <ul className="space-y-2">
                            {productions.map(prod => (
                                <li key={prod.id} className="bg-white p-2 rounded border border-gray-200">
                                    {editingProduction === prod.slug ? (
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <input
                                                type="text"
                                                name="name"
                                                value={editValues.name}
                                                onChange={handleEditInputChange}
                                                className="flex-1 min-w-[120px] border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-[#C4A77D]"
                                            />
                                            <input
                                                type="number"
                                                name="year"
                                                value={editValues.year}
                                                onChange={handleEditInputChange}
                                                placeholder="Year"
                                                className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:border-[#C4A77D]"
                                            />
                                            <button
                                                onClick={() => handleUpdateProduction(prod.slug)}
                                                disabled={productionLoading || !editValues.name.trim()}
                                                className="text-green-600 hover:text-green-800 text-sm disabled:opacity-50"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={cancelEditing}
                                                className="text-gray-500 hover:text-gray-700 text-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-700">
                                                {prod.name} {prod.year && `(${prod.year})`}
                                                <span className="text-gray-400 text-sm ml-2">
                                                    — {prod.media_count} image{prod.media_count !== 1 && 's'}
                                                </span>
                                            </span>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => startEditing(prod)}
                                                    className="text-blue-500 hover:text-blue-700 text-sm"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(prod.slug)}
                                                    className="text-red-500 hover:text-red-700 text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}
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

                    {/* Category Selection (show when images are selected) */}
                    {formData.images.length > 0 && (
                        <div>
                            <label className="block mb-2 text-gray-700 font-medium">
                                Category
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="category"
                                        value="production"
                                        checked={formData.category === 'production'}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-[#C4A77D]"
                                    />
                                    <span className="text-gray-700">Production</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="category"
                                        value="personality"
                                        checked={formData.category === 'personality'}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-[#C4A77D]"
                                    />
                                    <span className="text-gray-700">Personality</span>
                                </label>
                            </div>
                            {error.category && (
                                <p className="text-red-600 text-sm mt-1">{error.category}</p>
                            )}
                        </div>
                    )}

                    {/* Production Dropdown (only show when category is 'production') */}
                    {formData.images.length > 0 && formData.category === 'production' && (
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

                    {error.non_field_errors && (
                        <p className="text-red-600 text-sm">{error.non_field_errors}</p>
                    )}

                    <button
                        disabled={isLoading}
                        className="w-full bg-[#C4A77D] text-white py-2 rounded-md 
           hover:bg-[#B59770] transition disabled:opacity-60 flex justify-center"
                    >
                        {isLoading ? "Adding Media..." : "Upload Media"}
                    </button>
                </form>
            </section>

            {/* Delete Confirmation Popup */}
            {showDeletePopup && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#F5EFE7] border border-[#C4A77D] p-6 rounded-lg shadow-lg z-50 max-w-xl text-center">
                    <p className="text-gray-800 font-semibold mb-2">
                        Are you sure you want to delete this production?
                    </p>
                    <p className="text-gray-600 text-sm mb-4">
                        Images will be untagged but not deleted.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={cancelDelete}
                            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmDelete}
                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}