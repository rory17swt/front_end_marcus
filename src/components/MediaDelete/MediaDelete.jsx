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
      <button className="delete-button" onClick={handleDelete} disabled={isLoading}>
        {isLoading ? <Spinner /> : 'Delete'}
      </button>
    </div>
  )
}