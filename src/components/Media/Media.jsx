import { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllMedia, getAllProductions } from '../../services/media'
import Spinner from '../Spinner/Spinner'
import { deleteMedia } from '../../services/media'
import { UserContext } from '../../contexts/UserContext'

export default function MediaList() {
  const [media, setMedia] = useState([])
  const [productions, setProductions] = useState([])
  const [activeFilter, setActiveFilter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [selectedImage, setSelectedImage] = useState(null)
  const [showDeletePopup, setShowDeletePopup] = useState(false)
  const [mediaToDelete, setMediaToDelete] = useState(null)

  const { user } = useContext(UserContext)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [mediaRes, productionsRes] = await Promise.all([
          getAllMedia(),
          getAllProductions()
        ])
        const sortedMedia = mediaRes.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        )
        setMedia(sortedMedia)
        setProductions(productionsRes.data)
      } catch (error) {
        setError('Something went wrong loading media')
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
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedImage(null)
    }
    if (selectedImage) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [selectedImage])

  function getYoutubeEmbedUrl(url) {
    if (!url) return null
    if (url.includes('watch?v=')) {
      const videoId = url.split('watch?v=')[1].split('&')[0]
      return `https://www.youtube.com/embed/${videoId}`
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0]
      return `https://www.youtube.com/embed/${videoId}`
    }
    return null
  }

  function handleFilterChange(slug) {
    setIsTransitioning(true)
    setTimeout(() => {
      setActiveFilter(slug)
      setTimeout(() => setIsTransitioning(false), 50)
    }, 400)
  }

  function handleDeleteClick(mediaId) {
    setMediaToDelete(mediaId)
    setShowDeletePopup(true)
  }

  async function confirmDelete() {
    setShowDeletePopup(false)
    try {
      await deleteMedia(mediaToDelete)
      setMedia(prev => prev.filter(item => item.id !== mediaToDelete))
    } catch (err) {
      alert('Failed to delete media')
      console.error(err)
    } finally {
      setMediaToDelete(null)
    }
  }

  function cancelDelete() {
    setShowDeletePopup(false)
    setMediaToDelete(null)
  }

  // Split images by category
  const productionImages = media.filter(item => item.image && !item.youtube_url && item.category === 'production')
  const personalityImages = media.filter(item => item.image && !item.youtube_url && item.category === 'personality')
  const videos = media.filter(item => item.youtube_url)

  // Filter production images by production tag
  const filteredProductionImages = activeFilter
    ? productionImages.filter(item => item.production_slug === activeFilter)
    : productionImages

  if (loading) return <Spinner />
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div className="min-h-screen bg-[#E8DCC8] px-0">

      {/* COVER PHOTO */}
      <section className="relative w-full h-[110vh] overflow-hidden bg-black">
        <img
          src="/Media Front Photo.jpg"
          alt="Media"
          className="absolute inset-0 w-full h-full object-cover object-top block"
          style={{
            transform: `translateY(${scrollY * 0.2}px)`,
            transition: 'transform 0.1s linear',
          }}
        />

        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-full text-center">
          <div
            className="absolute inset-0 mx-auto w-full h-full"
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)",
              filter: "blur(80px)",
              zIndex: -1
            }}
          />
          <h1
            className="text-6xl md:text-9xl font-serif uppercase text-white drop-shadow-[4px_4px_15px_rgba(0,0,0,0.8)]"
            style={{
              letterSpacing: "1em",
              paddingLeft: "1em"
            }}
          >
            MEDIA
          </h1>
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

      {/* MAIN CONTAINER */}
      <div className="w-full max-w-[calc(100%-6rem)] mx-auto bg-white shadow-lg pb-0">

        {/* ---------------- PRODUCTION PHOTOS ---------------- */}
        <section className="pt-10 px-4 md:px-10 pb-10">
          <h2 className="text-3xl font-serif text-gray-800 mb-6">Productions</h2>

          {productionImages.length === 0 ? (
            <p className="text-gray-600">No production photos available.</p>
          ) : (
            <div className="space-y-6">

              {/* Production Filter Dropdown */}
              {productions.length > 0 && (
                <div>
                  <select
                    value={activeFilter || ''}
                    onChange={(e) => handleFilterChange(e.target.value || null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-0 hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <option value="">All Productions</option>
                    {productions.map(prod => (
                      <option key={prod.id} value={prod.slug}>
                        {prod.name} {prod.year && `(${prod.year})`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Image masonry */}
              <div className={`columns-2 md:columns-4 gap-4 transition-opacity duration-400 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                {filteredProductionImages.map(item => (
                  <div key={item.id} className="relative group mb-4 break-inside-avoid">
                    <img
                      src={item.image}
                      alt="Media"
                      className="w-full rounded-md cursor-pointer transition-transform duration-300 group-hover:scale-[1.03]"
                      onClick={() => setSelectedImage(item.image)}
                    />
                    {user && (
                      <div className="absolute top-2 right-2 flex gap-2 z-10">
                        <button
                          onClick={() => navigate(`/media/${item.id}/edit`)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredProductionImages.length === 0 && activeFilter && (
                <p className="text-gray-600">No images in this production.</p>
              )}
            </div>
          )}
        </section>

        {/* ---------------- PERSONALITY PHOTOS ---------------- */}
        <section className="px-4 md:px-10 pb-10">
          <h2 className="text-3xl font-serif text-gray-800 mb-6">Personality</h2>

          {personalityImages.length === 0 ? (
            <p className="text-gray-600">No personality photos available.</p>
          ) : (
            <div className="columns-2 md:columns-4 gap-4">
              {personalityImages.map(item => (
                <div key={item.id} className="relative group mb-4 break-inside-avoid">
                  <img
                    src={item.image}
                    alt="Media"
                    className="w-full rounded-md cursor-pointer transition-transform duration-300 group-hover:scale-[1.03]"
                    onClick={() => setSelectedImage(item.image)}
                  />
                  {user && (
                    <div className="absolute top-2 right-2 flex gap-2 z-10">
                      <button
                        onClick={() => navigate(`/media/${item.id}/edit`)}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ---------------- VIDEOS ---------------- */}
        <section className="px-4 md:px-10 pb-10">
          <h2 className="text-3xl font-serif text-gray-800 mb-6">Videos</h2>

          {videos.length === 0 ? (
            <p className="text-gray-600">No videos available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {videos.map(item => (
                <div key={item.id} className="relative">
                  <iframe
                    className="w-full h-56 rounded-md shadow-md"
                    src={getYoutubeEmbedUrl(item.youtube_url)}
                    title="YouTube video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  {user && (
                    <button
                      onClick={() => handleDeleteClick(item.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition-colors z-10"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Delete Confirmation Popup */}
      {showDeletePopup && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#F5EFE7] border border-[#C4A77D] p-6 rounded-lg shadow-lg z-50 max-w-xl text-center">
          <p className="text-gray-800 font-semibold mb-4">
            Are you sure you want to delete this media?
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

      {/* IMAGE MODAL/LIGHTBOX */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition-colors"
            onClick={() => setSelectedImage(null)}
            aria-label="Close"
          >
            ×
          </button>
          <img
            src={selectedImage}
            alt="Enlarged view"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}