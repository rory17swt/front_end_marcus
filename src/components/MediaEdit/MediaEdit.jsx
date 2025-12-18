import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getSingleMedia, updateMedia, getAllProductions } from '../../services/media'
import Spinner from '../Spinner/Spinner'

export default function MediaEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [media, setMedia] = useState(null)
  const [productions, setProductions] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedProduction, setSelectedProduction] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [mediaRes, productionsRes] = await Promise.all([
          getSingleMedia(id),
          getAllProductions()
        ])
        setMedia(mediaRes.data)
        setProductions(productionsRes.data)
        setSelectedCategory(mediaRes.data.category || 'production')
        setSelectedProduction(mediaRes.data.production || '')
      } catch (err) {
        setError('Failed to load media')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  function handleCategoryChange(value) {
    setSelectedCategory(value)
    if (value === 'personality') {
      setSelectedProduction('')
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      await updateMedia(id, {
        category: selectedCategory,
        production: selectedCategory === 'production' ? (selectedProduction || null) : null
      })
      navigate('/media')
    } catch (err) {
      setError('Failed to update media')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner />
  if (error) return <p className="text-red-600 p-10">{error}</p>
  if (!media) return <p className="p-10">Media not found</p>

  return (
    <div className="min-h-screen bg-[#E8DCC8] p-10">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-6">Edit Media</h1>

        <img
          src={media.image}
          alt="Preview"
          className="w-full h-64 object-cover rounded mb-6"
        />

        {/* Category Selection */}
        <label className="block mb-2 font-medium">Category</label>
        <div className="flex gap-4 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="category"
              value="production"
              checked={selectedCategory === 'production'}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-4 h-4"
            />
            <span>Production</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="category"
              value="personality"
              checked={selectedCategory === 'personality'}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-4 h-4"
            />
            <span>Personality</span>
          </label>
        </div>

        {/* Production Tag (only show when category is production) */}
        {selectedCategory === 'production' && (
          <>
            <label className="block mb-2 font-medium">Production Tag</label>
            <select
              value={selectedProduction}
              onChange={(e) => setSelectedProduction(e.target.value)}
              className="w-full p-2 border rounded mb-6"
            >
              <option value="">No production</option>
              {productions.map(prod => (
                <option key={prod.id} value={prod.id}>
                  {prod.name} {prod.year && `(${prod.year})`}
                </option>
              ))}
            </select>
          </>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => navigate('/media')}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-[#C4A77D] text-white rounded hover:bg-[#B59770] disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}