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
  const [selectedVideo, setSelectedVideo] = useState(null)
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
      if (e.key === 'Escape') {
        setSelectedImage(null)
        setSelectedVideo(null)
      }
    }
    if (selectedImage || selectedVideo) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [selectedImage, selectedVideo])

  function getYoutubeEmbedUrl(url, autoplay = false) {
    if (!url) return null
    let videoId = null
    if (url.includes('watch?v=')) {
      videoId = url.split('watch?v=')[1].split('&')[0]
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0]
    }
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}${autoplay ? '?autoplay=1' : ''}`
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
      <section className="relative w-full h-[70vh] md:h-[110vh] overflow-hidden bg-black">
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
            className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-serif uppercase text-white drop-shadow-[4px_4px_15px_rgba(0,0,0,0.8)] tracking-[0.2em] md:tracking-[0.3em] lg:tracking-[0.5em] xl:tracking-[1em] xl:pl-[1em]"
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
      <div className="w-full max-w-[calc(100%-1rem)] md:max-w-[calc(100%-6rem)] mx-auto bg-white shadow-lg pb-0">

        {/* ---------------- PRODUCTION PHOTOS ---------------- */}
        <section className="pt-6 md:pt-10 px-3 md:px-10 pb-6 md:pb-10">
          <h2 className="text-2xl md:text-3xl font-serif text-gray-800 mb-4 md:mb-6">Productions</h2>

          {productionImages.length === 0 ? (
            <p className="text-gray-600">No production photos available.</p>
          ) : (
            <div className="space-y-4 md:space-y-6">

              {/* Production Filter Dropdown */}
              {productions.length > 0 && (
                <div>
                  <select
                    value={activeFilter || ''}
                    onChange={(e) => handleFilterChange(e.target.value || null)}
                    className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-0 hover:bg-gray-100 transition-colors cursor-pointer"
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
              <div className={`columns-2 md:columns-4 gap-2 md:gap-4 transition-opacity duration-400 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                {filteredProductionImages.map(item => (
                  <div key={item.id} className="relative group mb-2 md:mb-4 break-inside-avoid">
                    <img
                      src={item.image}
                      alt="Media"
                      className="w-full rounded-md cursor-pointer transition-transform duration-300 group-hover:scale-[1.03]"
                      onClick={() => setSelectedImage(item.image)}
                    />
                    {user && (
                      <div className="absolute top-1 right-1 md:top-2 md:right-2 flex gap-1 md:gap-2 z-10">
                        <button
                          onClick={() => navigate(`/media/${item.id}/edit`)}
                          className="bg-blue-500 text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded text-[10px] md:text-xs hover:bg-blue-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item.id)}
                          className="bg-red-500 text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded text-[10px] md:text-xs hover:bg-red-600 transition-colors"
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
        <section className="px-3 md:px-10 pb-6 md:pb-10">
          <h2 className="text-2xl md:text-3xl font-serif text-gray-800 mb-4 md:mb-6">Personality</h2>

          {personalityImages.length === 0 ? (
            <p className="text-gray-600">No personality photos available.</p>
          ) : (
            <div className="columns-2 md:columns-4 gap-2 md:gap-4">
              {personalityImages.map(item => (
                <div key={item.id} className="relative group mb-2 md:mb-4 break-inside-avoid">
                  <img
                    src={item.image}
                    alt="Media"
                    className="w-full rounded-md cursor-pointer transition-transform duration-300 group-hover:scale-[1.03]"
                    onClick={() => setSelectedImage(item.image)}
                  />
                  {user && (
                    <div className="absolute top-1 right-1 md:top-2 md:right-2 flex gap-1 md:gap-2 z-10">
                      <button
                        onClick={() => navigate(`/media/${item.id}/edit`)}
                        className="bg-blue-500 text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded text-[10px] md:text-xs hover:bg-blue-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item.id)}
                        className="bg-red-500 text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded text-[10px] md:text-xs hover:bg-red-600 transition-colors"
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
        <section className="px-3 md:px-10 pb-6 md:pb-10">
          <h2 className="text-2xl md:text-3xl font-serif text-gray-800 mb-4 md:mb-6">Videos</h2>

          {videos.length === 0 ? (
            <p className="text-gray-600">No videos available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
              {videos.map(item => (
                <div key={item.id} className="relative group">
                  <div
                    className="relative cursor-pointer"
                    onClick={() => setSelectedVideo(item.youtube_url)}
                  >
                    <iframe
                      className="w-full h-48 md:h-56 rounded-md shadow-md pointer-events-none"
                      src={getYoutubeEmbedUrl(item.youtube_url)}
                      title="YouTube video"
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-20 transition-all rounded-md">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white bg-opacity-90 rounded-full p-3">
                          <svg className="w-8 h-8 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  {user && (
                    <button
                      onClick={() => handleDeleteClick(item.id)}
                      className="absolute top-1 right-1 md:top-2 md:right-2 bg-red-500 text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded text-[10px] md:text-xs hover:bg-red-600 transition-colors z-10"
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
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#F5EFE7] border border-[#C4A77D] p-4 md:p-6 rounded-lg shadow-lg z-50 max-w-[90%] md:max-w-xl text-center">
          <p className="text-gray-800 font-semibold mb-4 text-sm md:text-base">
            Are you sure you want to delete this media?
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={cancelDelete}
              className="bg-gray-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-md hover:bg-gray-600 text-sm md:text-base"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="bg-red-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-md hover:bg-red-600 text-sm md:text-base"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* IMAGE MODAL/LIGHTBOX */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-2 md:p-4"
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

      {/* VIDEO MODAL/LIGHTBOX */}
      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-2 md:p-4"
          onClick={() => setSelectedVideo(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition-colors z-10"
            onClick={() => setSelectedVideo(null)}
            aria-label="Close"
          >
            ×
          </button>
          <div
            className="w-full max-w-4xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              className="w-full h-full rounded-lg"
              src={getYoutubeEmbedUrl(selectedVideo, true)}
              title="YouTube video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  )
}