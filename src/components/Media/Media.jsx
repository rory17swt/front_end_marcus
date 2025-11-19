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
  const [nextIndex, setNextIndex] = useState(null)
  const [fade, setFade] = useState(false)

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
    const newIndex = Math.max(imageStartIndex - IMAGES_PER_PAGE, 0)
    setNextIndex(newIndex)
    setFade(true)
  }

  function handleImageNext() {
    const newIndex = Math.min(imageStartIndex + IMAGES_PER_PAGE, images.length - IMAGES_PER_PAGE)
    setNextIndex(newIndex)
    setFade(true)
  }

  // Switch images after fade completes
  useEffect(() => {
    if (fade && nextIndex !== null) {
      const timeout = setTimeout(() => {
        setImageStartIndex(nextIndex)
        setNextIndex(null)
        setFade(false)
      }, 700) // match transition duration
      return () => clearTimeout(timeout)
    }
  }, [fade, nextIndex])

  function handleDeleteSuccess(mediaId) {
    setMedia(prev => prev.filter(item => item.id !== mediaId))
  }

  const images = media.filter(item => item.image && !item.youtube_url)
  const videos = media.filter(item => item.youtube_url)
  const visibleImages = images.slice(imageStartIndex, imageStartIndex + IMAGES_PER_PAGE)
  const nextImages = nextIndex !== null ? images.slice(nextIndex, nextIndex + IMAGES_PER_PAGE) : []

  if (loading) return <Spinner />
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div className="min-h-screen bg-[#E8DCC8] pt-0 pb-20">

      {/* COVER PHOTO */}
      <section className="relative w-full overflow-hidden mb-12">
        <img
          src="/Media Front Photo.jpg"
          alt="Media"
          className="w-full h-auto block object-contain"
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
            className="text-6xl md:text-9xl font-serif tracking-[1em] uppercase text-white drop-shadow-[4px_4px_15px_rgba(0,0,0,0.8)]"
            style={{ letterSpacing: "1em" }}
          >
            MEDIA
          </h1>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <div className="w-full max-w-[calc(100%-6rem)] mx-auto bg-white shadow-lg rounded-md p-6 md:p-12">

        {/* ---------------- IMAGES ---------------- */}
        <section>
          {images.length === 0 ? (
            <p className="text-gray-600">No images available.</p>
          ) : (
            <div className="space-y-6">
              {/* Carousel controls */}
              <div className="flex gap-4">
                <button
                  onClick={handleImagePrev}
                  disabled={imageStartIndex === 0}
                  className="px-4 py-2 bg-[#C4A77D] text-white rounded-lg hover:bg-[#B59770] disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  ← Previous
                </button>
                <button
                  onClick={handleImageNext}
                  disabled={imageStartIndex + IMAGES_PER_PAGE >= images.length}
                  className="px-4 py-2 bg-[#C4A77D] text-white rounded-lg hover:bg-[#B59770] disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next →
                </button>
              </div>

              {/* Image grid with crossfade */}
              <div className="relative">
                {/* Current images */}
                <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 transition-opacity duration-700 ${fade ? 'opacity-0' : 'opacity-100'}`}>
                  {visibleImages.map(item => (
                    <div key={item.id} className="relative group">
                      <img
                        src={item.image}
                        alt="Media"
                        className="w-full h-48 object-cover rounded-md shadow-sm transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                      {user && (
                        <div className="absolute top-2 right-2">
                          <MediaDelete mediaId={item.id} onDeleteSuccess={handleDeleteSuccess} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Next images overlay */}
                {fade && nextImages.length > 0 && (
                  <div className="absolute top-0 left-0 w-full grid grid-cols-2 md:grid-cols-4 gap-6 transition-opacity duration-700 opacity-0 animate-fade-in">
                    {nextImages.map(item => (
                      <div key={item.id} className="relative group">
                        <img
                          src={item.image}
                          alt="Media"
                          className="w-full h-48 object-cover rounded-md shadow-sm transition-transform duration-700 group-hover:scale-[1.03]"
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
              </div>
            </div>
          )}
        </section>

        {/* ---------------- VIDEOS ---------------- */}
        <section className="mt-14">
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
    </div>
  )
}
