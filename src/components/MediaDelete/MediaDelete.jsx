import { useState } from "react"
import { deleteMedia } from "../../services/media"
import Spinner from '../Spinner/Spinner'

export default function MediaDelete({ mediaId, onDeleteSuccess }) {
  // State
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Functions
  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this media?')) return

    setIsLoading(true)
    try {
      await deleteMedia(mediaId)
      if (onDeleteSuccess) {
        onDeleteSuccess(mediaId)
      }
    } catch (error) {
      setError('Failed to delete media')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {error && <p style={{ fontSize: '12px', color: 'red' }}>{error}</p>}
      <button
        className="px-3 py-1 bg-red-600 text-white font-semibold rounded shadow hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleDelete}
        disabled={isLoading}
      >
        {isLoading ? <Spinner /> : 'Delete'}
      </button>

    </div>
  )
}