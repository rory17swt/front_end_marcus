import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { getAllEvents, deleteEvent } from '../../services/events'
import { getPublicBio } from '../../services/bio'
import { FaInstagram, FaYoutube } from 'react-icons/fa'
import Spinner from '../Spinner/Spinner'

export default function Home() {
  const [bio, setBio] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [startIndex, setStartIndex] = useState(0)
  const [deletingId, setDeletingId] = useState(null)
  const [showFullBio, setShowFullBio] = useState(false)

  const EVENTS_PER_PAGE = 4
  const navigate = useNavigate()

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

  function handleUpdate(eventId) {
    navigate(`/events/${eventId}/update`)
  }

  function getBioPreview() {
    if (!bio?.bio) return ''
    
    const splitText = 'selected recordings, and latest press quotes below.'
    const bioHTML = bio.bio
    
    const splitIndex = bioHTML.indexOf(splitText)
    
    if (splitIndex === -1) {
      const firstParagraphEnd = bioHTML.indexOf('</p>')
      return firstParagraphEnd !== -1 ? bioHTML.substring(0, firstParagraphEnd + 4) : bioHTML
    }
    
    return bioHTML.substring(0, splitIndex + splitText.length)
  }

  const visibleEvents = events.slice(startIndex, startIndex + EVENTS_PER_PAGE)

  if (loading) return <Spinner />
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <div className="max-w-6xl mx-auto bg-white shadow-lg">
        {/* Cover Photo with Overlay */}
        <section className="relative mb-10">
        <img 
          src="/Home page.jpg" 
          alt="Marcus Swietlicki" 
          className="w-full h-[400px] object-cover block"
        />
        
        {/* Overlay Content */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-start p-5 md:px-10">
          {/* Name on Left */}
          <h1 className="m-0 text-white text-2xl md:text-3xl font-bold" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
            MARCUS SWIETLICKI
          </h1>
          
          {/* Social Icons on Right */}
          <div className="flex gap-4">
            <a
              href="https://www.instagram.com/marcusswietlicki_tenor/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white text-3xl hover:opacity-80 transition-opacity"
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://www.youtube.com/@marcusmacleodswietlicki959/featured"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white text-3xl hover:opacity-80 transition-opacity"
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}
              aria-label="YouTube"
            >
              <FaYoutube />
            </a>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-10 mb-10">
        <h1 className="text-3xl font-bold mb-4">Biography</h1>
        {bio?.bio && (
          <>
            <div 
              className="prose max-w-none mb-4"
              dangerouslySetInnerHTML={{ 
                __html: showFullBio ? bio.bio : getBioPreview() 
              }} 
            />
            
            {bio.bio.includes('selected recordings, and latest press quotes below.') && (
              <button 
                onClick={() => setShowFullBio(!showFullBio)}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                {showFullBio ? 'Read Less' : 'Read More'}
              </button>
            )}
          </>
        )}
        {bio?.cv ? (
          <a
            href={bio.cv}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-blue-500 hover:underline"
          >
            View CV
          </a>
        ) : (
          <p className="mt-4 text-gray-600">CV not available.</p>
        )}
      </section>

      <section className="px-4 md:px-10 mb-10">
        <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
        {events.length === 0 ? (
          <p className="text-gray-600">No upcoming events.</p>
        ) : (
          <div className="flex items-center gap-2">
            {/* Prev Button */}
            <button 
              onClick={handlePrev} 
              disabled={startIndex === 0}
              className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ←
            </button>

            {/* Carousel Events */}
            <div className="flex overflow-hidden flex-1">
              {visibleEvents.map(event => (
                <div
                  key={event.id}
                  className="inline-block m-2 border border-gray-300 rounded-lg p-2 w-40 text-center flex-shrink-0 relative bg-white"
                >
                  <a
                    href={event.event_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="no-underline text-black block"
                  >
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-24 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="text-sm font-semibold mt-2">{event.title}</h3>
                      <p className="text-xs text-gray-600">
                        {new Date(event.datetime).toLocaleString(undefined, {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                      <p className="text-xs text-gray-600">{event.location}</p>
                    </div>
                  </a>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(event.id)}
                    disabled={deletingId === event.id}
                    className="absolute top-1 right-1 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 disabled:opacity-50 transition-colors z-10"
                    aria-label={`Delete ${event.title}`}
                  >
                    {deletingId === event.id ? 'Deleting...' : 'Delete'}
                  </button>

                  {/* Update Button */}
                  <button
                    onClick={() => handleUpdate(event.id)}
                    className="absolute top-10 right-1 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors z-10"
                    aria-label={`Update ${event.title}`}
                  >
                    Update
                  </button>
                </div>
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={startIndex + EVENTS_PER_PAGE >= events.length}
              className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              →
            </button>
          </div>
        )}
      </section>
      </div>
    </div>
  )
}