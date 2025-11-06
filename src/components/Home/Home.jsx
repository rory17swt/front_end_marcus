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
  const [scrollY, setScrollY] = useState(0)

  const EVENTS_PER_PAGE = 4
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [bioRes, eventsRes] = await Promise.all([getPublicBio(), getAllEvents()])
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

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    <div className="min-h-screen bg-[#E8DCC8] px-0">
      {/* ✅ Full-width Cover Photo */}
      <section className="relative w-full h-[110vh] overflow-hidden bg-black">
        <img
          src="/Home page.jpg"
          alt="Marcus Swietlicki"
          className="absolute inset-0 w-full h-full object-cover object-center block"
          style={{
            transform: `translateY(${scrollY * 0.2}px)`, // moves slower than scroll
            transition: 'transform 0.1s linear',          // smooth movement
          }}
        />

        {/* Top Overlay */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-start p-6 md:p-10">
          {/* Name on Top Left */}
          <div className="text-white drop-shadow-[2px_2px_6px_rgba(0,0,0,0.7)] leading-tight">
            <h1 className="text-5xl md:text-6xl font-signature leading-none">
              Marcus <span className="relative inline-block">
                Swietlicki
                <span className="absolute -bottom-8 left-20 text-2xl md:text-3xl font-serif tracking-[0.15em] uppercase">
                  Tenor
                </span>
              </span>
            </h1>
          </div>

          {/* Social Icons on Top Right */}
          <div className="flex gap-6">
            <a
              href="https://www.instagram.com/marcusswietlicki_tenor/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white text-3xl hover:opacity-80 transition-opacity drop-shadow-[2px_2px_6px_rgba(0,0,0,0.7)]"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://www.youtube.com/@marcusmacleodswietlicki959/featured"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white text-3xl hover:opacity-80 transition-opacity drop-shadow-[2px_2px_6px_rgba(0,0,0,0.7)]"
              aria-label="YouTube"
            >
              <FaYoutube />
            </a>
          </div>
        </div>
        {/* Subtle Wave Transition */}
        <div className="absolute bottom-0 w-full overflow-hidden leading-none">
          <svg
            className="w-full h-6 md:h-8"
            viewBox="0 0 1440 80"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,0 C360,40 1080,40 1440,0 L1440,80 L0,80 Z"
              fill="#E8DCC8"
            />
          </svg>
        </div>
      </section>

      {/* ✅ Main White Content Box */}
      <div className="w-full max-w-[calc(100%-6rem)] mx-auto bg-white shadow-lg pb-0">
        {/* Biography Section */}
        <section className="px-4 md:px-10 mb-10 font-body">
          {bio?.bio && (
            <>
              <div
                className="prose prose-lg max-w-none mb-4 text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: showFullBio ? bio.bio : getBioPreview()
                }}
              />
              {bio.bio.includes('selected recordings, and latest press quotes below.') && (
                <button
                  onClick={() => setShowFullBio(!showFullBio)}
                  className="mt-2 mb-6 px-6 py-2 bg-[#C4A77D] text-white rounded hover:bg-[#B59770] transition-colors font-body"
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
              className="inline-block mt-4 ml-8 text-[#C4A77D] hover:text-[#B59770] hover:underline font-body"
            >
              View CV
            </a>
          ) : (
            <p className="mt-4 ml-8 text-gray-600">CV not available.</p>
          )}
        </section>

        {/* Upcoming Events */}
        <section className="px-4 md:px-10 pb-10">
          <h2 className="text-2xl font-bold mb-6 text-center font-serif text-gray-800">Upcoming Events</h2>
          {events.length === 0 ? (
            <p className="text-gray-600 text-center">No upcoming events.</p>
          ) : (
            <div className="flex items-center gap-2 max-w-5xl mx-auto">
              {/* Prev Button */}
              <button
                onClick={handlePrev}
                disabled={startIndex === 0}
                className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                ←
              </button>

              {/* Carousel Events */}
              <div className="flex overflow-hidden flex-1 justify-between gap-3">
                {visibleEvents.map(event => (
                  <div
                    key={event.id}
                    className="border border-gray-300 rounded-lg overflow-hidden text-center flex-1 relative"
                  >
                    <a
                      href={event.event_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="no-underline block relative"
                    >
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-48 object-cover"
                      />
                      {/* Text Overlay on Image */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-3">
                        <h3 className="text-sm font-serif font-semibold">{event.title}</h3>
                        <p className="text-xs font-body">
                          {new Date(event.datetime).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </p>
                        <p className="text-xs font-body">{event.location}</p>
                      </div>
                    </a>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(event.id)}
                      disabled={deletingId === event.id}
                      className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 disabled:opacity-50 transition-colors z-10"
                      aria-label={`Delete ${event.title}`}
                    >
                      {deletingId === event.id ? 'Deleting...' : 'Delete'}
                    </button>

                    {/* Update Button */}
                    <button
                      onClick={() => handleUpdate(event.id)}
                      className="absolute top-11 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors z-10"
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
                className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
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
