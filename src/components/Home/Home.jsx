import { useEffect, useState, useRef, useContext } from 'react'
import { useNavigate } from 'react-router'
import { getAllEvents, deleteEvent } from '../../services/events'
import { getPublicBio } from '../../services/bio'
import { UserContext } from '../../contexts/UserContext'
import Spinner from '../Spinner/Spinner'
import { FaInstagram, FaYoutube } from 'react-icons/fa'

export default function Home() {
  const [bio, setBio] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [startIndex, setStartIndex] = useState(0)
  const [deletingId, setDeletingId] = useState(null)
  const [showFullBio, setShowFullBio] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [bioHeight, setBioHeight] = useState(0)
  const [slideDirection, setSlideDirection] = useState(null)
  const [showDeletePopup, setShowDeletePopup] = useState(false)
  const [eventToDelete, setEventToDelete] = useState(null)

  const EVENTS_PER_PAGE = 4
  const navigate = useNavigate()
  const bioRef = useRef(null)
  const { user } = useContext(UserContext)

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
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (bioRef.current) {
      setBioHeight(bioRef.current.scrollHeight)
    }
  }, [bio, showFullBio])

  useEffect(() => {
    if (slideDirection) {
      const timeout = setTimeout(() => setSlideDirection(null), 500)
      return () => clearTimeout(timeout)
    }
  }, [slideDirection])

  function handlePrev() {
    if (startIndex === 0) return
    setSlideDirection('prev')
    setStartIndex(prev => Math.max(prev - EVENTS_PER_PAGE, 0))
  }

  function handleNext() {
    if (startIndex + EVENTS_PER_PAGE >= events.length) return
    setSlideDirection('next')
    setStartIndex(prev => Math.min(prev + EVENTS_PER_PAGE, events.length - EVENTS_PER_PAGE))
  }

  function handleDeleteClick(eventId) {
    setEventToDelete(eventId)
    setShowDeletePopup(true)
  }

  async function confirmDelete() {
    setDeletingId(eventToDelete)
    setShowDeletePopup(false)
    try {
      await deleteEvent(eventToDelete)
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventToDelete))
    } catch (err) {
      alert('Failed to delete event')
      console.error(err)
    } finally {
      setDeletingId(null)
      setEventToDelete(null)
    }
  }

  function cancelDelete() {
    setShowDeletePopup(false)
    setEventToDelete(null)
  }

  function handleUpdate(eventId) {
    navigate(`/events/${eventId}/update`)
  }

  if (loading) return <Spinner />
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div className="min-h-screen bg-[#E8DCC8] px-0">
      {/* Full-width Cover Photo */}
      <section className="relative w-full h-[110vh] overflow-hidden bg-black">
        <img
          src="/Home page.jpg"
          alt="Marcus Swietlicki"
          className="absolute inset-0 w-full h-full object-cover object-center block"
          style={{
            transform: `translateY(${scrollY * 0.2}px)`,
            transition: 'transform 0.1s linear',
          }}
        />

        {/* Top Overlay */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-start p-6 md:p-10">
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

        <div className="absolute bottom-0 w-full overflow-hidden leading-none">
          <svg
            className="w-full h-6 md:h-10"
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

      {/* Main White Content Box */}
      <div className="w-full max-w-[calc(100%-6rem)] mx-auto bg-white shadow-lg pb-0">

        {/* Biography Section */}
        <section className="pt-12 px-6 md:px-16 lg:px-24 mb-12">
          {bio?.bio && (
            <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
              <div
                ref={bioRef}
                className="font-source-serif text-[17px] leading-[1.65] text-[#1f1f1f] overflow-hidden transition-all duration-500 ease-in-out
                           [&>h1]:font-serif [&>h1]:text-4xl [&>h1]:font-semibold [&>h1]:tracking-wide [&>h1]:mb-4 [&>h1]:text-[#2c2c2c]
                           [&>h2]:font-serif [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:tracking-wide [&>h2]:mb-3 [&>h2]:mt-6 [&>h2]:text-[#2c2c2c]
                           [&>p]:mb-5 [&>p]:max-w-[70ch]
                           [&_em]:italic [&_strong]:font-medium"
                style={{ maxHeight: showFullBio ? `${bioHeight}px` : '180px' }}
                dangerouslySetInnerHTML={{ __html: bio.bio }}
              />

              <div className="flex items-center gap-6 mt-8">
                {bio.bio.includes('selected recordings, and latest press quotes below.') && (
                  <button
                    onClick={() => setShowFullBio(prev => !prev)}
                    className="px-8 py-3 bg-[#C4A77D] text-white font-source-serif text-sm tracking-wide rounded-sm hover:bg-[#B59770] transition-colors"
                  >
                    {showFullBio ? 'Read Less' : 'Read More'}
                  </button>
                )}

                {bio?.cv && (
                  <a
                    href={bio.cv}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-source-serif text-[#C4A77D] hover:text-[#B59770] underline underline-offset-4 decoration-1 transition-colors"
                  >
                    View CV
                  </a>
                )}
              </div>
            </div>
          )}

          {!bio?.bio && (
            <p className="max-w-4xl mx-auto text-gray-500 font-source-serif">Bio not available.</p>
          )}
        </section>

        {/* Upcoming Events */}
        <section className="px-4 md:px-10 pb-10">
          {events.length === 0 ? (
            <p className="text-gray-600 text-center">No upcoming events</p>
          ) : (
            <div className="flex items-center gap-2 max-w-full mx-auto overflow-visible">
              {events.length > EVENTS_PER_PAGE && (
                <button
                  onClick={handlePrev}
                  disabled={startIndex === 0}
                  className="px-4 py-2 bg-[#C4A77D] text-white rounded hover:bg-[#B59770] disabled:opacity-40 transition-colors flex-shrink-0 text-xl shadow-md"
                >
                  ←
                </button>
              )}

              <div className="relative overflow-hidden flex-1">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{
                    transform: `translateX(-${startIndex * (100 / EVENTS_PER_PAGE)}%)`,
                  }}
                >
                  {events.map(event => (
                    <div
                      key={event.id}
                      className="flex-shrink-0 w-[calc((100%-3*1rem)/4)] px-2"
                    >
                      <div className="relative">
                        <div className="transform transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-xl rounded-lg">
                          <div className="border border-gray-300 rounded-lg bg-white relative overflow-visible">
                            <a
                              href={event.event_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block relative no-underline"
                            >
                              <img
                                src={event.image}
                                alt={event.title}
                                className="w-full h-72 md:h-80 object-cover rounded-t-lg"
                              />
                              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4 rounded-b-lg">
                                <h3 className="text-base md:text-lg font-serif font-semibold">{event.title}</h3>
                                <p className="text-sm md:text-base font-body">
                                  {new Date(event.datetime).toLocaleString(undefined, {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                  })}
                                </p>
                                <p className="text-sm md:text-base font-body">{event.location}</p>
                              </div>
                            </a>

                            {user && (
                              <>
                                <button
                                  onClick={() => handleDeleteClick(event.id)}
                                  disabled={deletingId === event.id}
                                  className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 disabled:opacity-50 transition-colors z-10"
                                  aria-label={`Delete ${event.title}`}
                                >
                                  {deletingId === event.id ? 'Deleting...' : 'Delete'}
                                </button>

                                <button
                                  onClick={() => handleUpdate(event.id)}
                                  className="absolute top-11 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors z-10"
                                  aria-label={`Update ${event.title}`}
                                >
                                  Update
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {events.length > EVENTS_PER_PAGE && (
                <button
                  onClick={handleNext}
                  disabled={startIndex + EVENTS_PER_PAGE >= events.length}
                  className="px-4 py-2 bg-[#C4A77D] text-white rounded hover:bg-[#B59770] disabled:opacity-40 transition-colors flex-shrink-0 text-xl shadow-md"
                >
                  →
                </button>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#F5EFE7] border border-[#C4A77D] p-6 rounded-lg shadow-lg z-50 max-w-xl text-center">
          <p className="text-gray-800 font-semibold mb-4">
            Are you sure you want to delete this event?
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