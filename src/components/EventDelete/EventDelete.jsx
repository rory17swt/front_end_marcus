import { useState } from "react"
import { deleteEvent } from "../../services/events"
import { useNavigate, useParams } from "react-router"
import Spinner from '../Spinner/Spinner'

export default function EventDelete() {
  // State
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Variables
  const { eventId } = useParams()
  const navigate = useNavigate()

  // Functions
  async function handleDelete() {
    setIsLoading(true)
    try {
      await deleteEvent(eventId)
      navigate('/')
    } catch (error) {
      setError('Failed to delete event')
    } finally {
      setIsLoading(false)
    }
  }

  
  return (
    <div>
      {error && <p>{error}</p>}
      <button className="delete-button" onClick={handleDelete}>
        {isLoading ? <Spinner /> : 'Delete'}
      </button>
    </div>
  )
}
