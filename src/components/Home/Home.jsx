import { useEffect, useState } from 'react'
import { getAllEvents, deleteEvent } from '../../services/events'
import { getPublicBio } from '../../services/bio'
import Spinner from '../Spinner/Spinner'

export default function Home() {
  const [bio, setBio] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [startIndex, setStartIndex] = useState(0)
  const [deletingId, setDeletingId] = useState(null)

  const EVENTS_PER_PAGE = 4

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [bioRes, eventsRes] = await Promise.all([
          getPublicBio(),
          getAllEvents()
        ])
        const sortedEvents = eventsRes.data.sort(
          (a, b) => new Date(a.datetime) - new Date(b.datetime)
        )
        setBio(bioRes.data)
        setEvents(sortedEvents)
      } catch (error) {
        setError('Something went wrong loading content')
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  function handlePrev() {
    setStartIndex(prev => Math.max(prev - 1, 0))
  }

  function handleNext() {
    setStartIndex(prev => Math.min(prev + 1, events.length - EVENTS_PER_PAGE))
  }

  async function handleDelete(eventId) {
    if (!window.confirm('Are you sure you want to delete this event?')) return
    setDeletingId(eventId)
    try {
      await deleteEvent(eventId)
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId))
    } catch (err) {
      alert('Failed to delete event')
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  const visibleEvents = events.slice(startIndex, startIndex + EVENTS_PER_PAGE)

  if (loading) return <Spinner />
  if (error) return <p>{error}</p>

  return (
    <div>
      <section>
        {bio?.bio && (
          <div dangerouslySetInnerHTML={{ __html: bio.bio }} />
        )}
        {bio?.cv ? (
          <a
            href={bio.cv}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginRight: '15px' }}
          >
            View CV
          </a>
        ) : (
          <p>CV not available.</p>
        )}
      </section>

      <section>
        <h2>Upcoming Events</h2>
        {events.length === 0 ? (
          <p>No upcoming events.</p>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Prev Button */}
            <button onClick={handlePrev} disabled={startIndex === 0}>
              ←
            </button>

            {/* Carousel Events */}
            <div style={{ display: 'flex', overflow: 'hidden' }}>
              {visibleEvents.map(event => (
                <div
                  key={event.id}
                  style={{
                    display: 'inline-block',
                    margin: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '10px',
                    width: '160px',
                    textAlign: 'center',
                    flexShrink: 0,
                    position: 'relative',
                    backgroundColor: '#fff',
                    color: '#000',  // force text black
                  }}
                >
                  <a
                    href={event.event_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                  >
                    <img
                      src={event.image}
                      alt={event.title}
                      style={{
                        width: '150px',
                        height: '100px', // fixed height to avoid layout breaking
                        borderRadius: '8px',
                        objectFit: 'cover',
                      }}
                    />
                    <div>
                      <h3>{event.title}</h3>
                      <p>
                        {new Date(event.datetime).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                      <p>{event.location}</p>
                    </div>
                  </a>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(event.id)}
                    disabled={deletingId === event.id}
                    style={{
                      position: 'absolute',
                      top: 5,
                      right: 5,
                      backgroundColor: '#ff4d4f',
                      border: 'none',
                      color: 'white',
                      padding: '5px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      zIndex: 10,
                    }}
                    aria-label={`Delete ${event.title}`}
                  >
                    {deletingId === event.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={startIndex + EVENTS_PER_PAGE >= events.length}
            >
              →
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
