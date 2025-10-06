import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { getAllEvents } from '../../services/events'
import { getPublicBio } from '../../services/bio'
import Spinner from '../Spinner/Spinner'


export default function Home() {
  const [bio, setBio] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [bioRes, eventsRes] = await Promise.all([
          getPublicBio(),
          getAllEvents()
        ])
        setBio(bioRes.data)
        setEvents(eventsRes.data)
      } catch (err) {
        setError('Something went wrong loading content')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <Spinner />
  if (error) return <p className="error">{error}</p>

  return (
    <div className="home-page">
      <section className="bio-section">
        <h1>Welcome</h1>
        {bio?.bio && (
          <div
            className="bio-content"
            dangerouslySetInnerHTML={{ __html: bio.bio }}
          />
        )}
        {bio?.cv && (
          <a href={bio.cv} target="_blank" rel="noopener noreferrer" className="download-cv-btn">
            Download CV
          </a>
        )}
      </section>

      <section className="events-carousel-section">
        <h2>Upcoming Events</h2>
        {events.length === 0 ? (
          <p>No upcoming events.</p>
        ) : (
          <div className="events-carousel">
            {events.map(event => (
              <Link to={`/events/${event.id}`} key={event.id} className="carousel-card">
                <img src={event.image} alt={event.title} style={{ width: '150px', height: 'auto', borderRadius: '8px', objectFit: 'cover' }} />
                <div className="carousel-card-info">
                  <h3>{event.title}</h3>
                  <p>{new Date(event.datetime).toLocaleDateString()}</p>
                  <p>{event.location}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
