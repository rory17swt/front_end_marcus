import { useEffect, useState } from 'react'
import { getAllEvents } from '../../services/events'
import { getPublicBio } from '../../services/bio'
import Spinner from '../Spinner/Spinner'

export default function Home() {
  const [bio, setBio] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [startIndex, setStartIndex] = useState(0)

  const EVENTS_PER_PAGE = 4

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [bioRes, eventsRes] = await Promise.all([
          getPublicBio(),
          getAllEvents()
        ])
        const sortedEvents = eventsRes.data.sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
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

  const visibleEvents = events.slice(startIndex, startIndex + EVENTS_PER_PAGE)

  if (loading) return <Spinner />
  if (error) return <p>{error}</p>

  return (
    <div>
      <section>
        {bio.bio && (
          <div dangerouslySetInnerHTML={{ __html: bio.bio }} />
        )}
        {bio.cv && (
          <a href={bio.cv} target="_blank" rel="noopener noreferrer">Download CV</a>
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
                <a
                  href={event.event_url}
                  key={event.id}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    margin: '10px',
                    textDecoration: 'none',
                    color: 'inherit',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '10px',
                    width: '160px',
                    textAlign: 'center',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={event.image}
                    alt={event.title}
                    style={{
                      width: '150px',
                      height: 'auto',
                      borderRadius: '8px',
                      objectFit: 'cover'
                    }}
                  />
                  <div>
                    <h3>{event.title}</h3>
                    <p>{new Date(event.datetime).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}</p>
                    <p>{event.location}</p>
                  </div>
                </a>
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
