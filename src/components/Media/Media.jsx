import { useEffect, useState, useContext } from 'react'
import { getAllMedia } from '../../services/media'
import Spinner from '../Spinner/Spinner'
import MediaDelete from '../MediaDelete/MediaDelete'
import { UserContext } from '../../contexts/UserContext'

export default function MediaList() {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imageStartIndex, setImageStartIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [selectedImage, setSelectedImage] = useState(null)

  const IMAGES_PER_PAGE = 8
  const { user } = useContext(UserContext)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const mediaRes = await getAllMedia()
        const sortedMedia = mediaRes.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        )
        setMedia(sortedMedia)
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

  function handleImagePrev() {
    if (isTransitioning || imageStartIndex === 0) return
    setIsTransitioning(true)

    setTimeout(() => {
      setImageStartIndex(prev => Math.max(prev - IMAGES_PER_PAGE, 0))
      setTimeout(() => setIsTransitioning(false), 50)
    }, 400)
  }

  function handleImageNext() {
    if (isTransitioning || imageStartIndex + IMAGES_PER_PAGE >= images.length) return
    setIsTransitioning(true)

    setTimeout(() => {
      setImageStartIndex(prev => Math.min(prev + IMAGES_PER_PAGE, images.length - IMAGES_PER_PAGE))
      setTimeout(() => setIsTransitioning(false), 50)
    }, 400)
  }

  function handleDeleteSuccess(mediaId) {
    setMedia(prev => prev.filter(item => item.id !== mediaId))
  }

  const images = media.filter(item => item.image && !item.youtube_url)
  const videos = media.filter(item => item.youtube_url)
  const visibleImages = images.slice(imageStartIndex, imageStartIndex + IMAGES_PER_PAGE)

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

        {/* MEDIA Title Overlay */}
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

        {/* SVG Wave at bottom */}
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

        {/* ---------------- IMAGES ---------------- */}
        <section className="pt-10 px-4 md:px-10 pb-10">
          {images.length === 0 ? (
            <p className="text-gray-600">No images available.</p>
          ) : (
            <div className="space-y-6">
              {/* Carousel controls */}
              <div className="flex gap-4">
                <button
                  onClick={handleImagePrev}
                  disabled={imageStartIndex === 0 || isTransitioning}
                  className="px-4 py-2 bg-[#C4A77D] text-white rounded-lg hover:bg-[#B59770] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>
                <button
                  onClick={handleImageNext}
                  disabled={imageStartIndex + IMAGES_PER_PAGE >= images.length || isTransitioning}
                  className="px-4 py-2 bg-[#C4A77D] text-white rounded-lg hover:bg-[#B59770] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>

              {/* Image grid with fade transition */}
              <div
                className={`grid grid-cols-2 md:grid-cols-4 gap-6 transition-opacity duration-400 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'
                  }`}
              >
                {visibleImages.map(item => (
                  <div key={item.id} className="relative group">
                    <img
                      src={item.image}
                      alt="Media"
                      className="w-full h-48 object-cover rounded-md shadow-sm transition-transform duration-300 group-hover:scale-[1.03] cursor-pointer"
                      onClick={() => setSelectedImage(item.image)}
                    />
                    {user && (
                      <div className="absolute top-2 right-2 z-10">
                        <MediaDelete mediaId={item.id} onDeleteSuccess={handleDeleteSuccess} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ---------------- VIDEOS ---------------- */}
        <section className="px-4 md:px-10 pb-10">
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
                    <div className="absolute top-2 right-2">
                      <MediaDelete mediaId={item.id} onDeleteSuccess={handleDeleteSuccess} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* ✅ IMAGE MODAL/LIGHTBOX */}
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