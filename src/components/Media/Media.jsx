import { useEffect, useState } from 'react'
import { getAllMedia } from '../../services/media'
import Spinner from '../Spinner/Spinner'
import MediaDelete from '../MediaDelete/MediaDelete'

export default function MediaList() {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [imageStartIndex, setImageStartIndex] = useState(0)

  const IMAGES_PER_PAGE = 8 // 4x2 grid
  const VIDEOS_PER_ROW = 3

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
    setImageStartIndex(prev => Math.max(prev - IMAGES_PER_PAGE, 0))
  }

  function handleImageNext() {
    setImageStartIndex(prev => Math.min(prev + IMAGES_PER_PAGE, images.length - IMAGES_PER_PAGE))
  }

  function handleDeleteSuccess(mediaId) {
    setMedia(prevMedia => prevMedia.filter(item => item.id !== mediaId))
  }

  // Separate images and videos
  const images = media.filter(item => item.image && !item.youtube_url)
  const videos = media.filter(item => item.youtube_url)

  const visibleImages = images.slice(imageStartIndex, imageStartIndex + IMAGES_PER_PAGE)

  if (loading) return <Spinner />
  if (error) return <p>{error}</p>

  return (
    <div>
      {/* Cover Photo */}
      <section style={{ marginBottom: '40px' }}>
        <img 
          src="/Media Front Photo.jpg" 
          alt="Media" 
          style={{ 
            width: '100%', 
            height: 'auto',
            display: 'block'
          }} 
        />
      </section>

      {/* Images Section */}
      <section>
        <h2>Images</h2>
        {images.length === 0 ? (
          <p>No images available.</p>
        ) : (
          <div>
            {/* Carousel Controls */}
            <div>
              <button onClick={handleImagePrev} disabled={imageStartIndex === 0}>
                ← Previous
              </button>
              <button 
                onClick={handleImageNext} 
                disabled={imageStartIndex + IMAGES_PER_PAGE >= images.length}
              >
                Next →
              </button>
            </div>

            {/* 4x2 Grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(4, 1fr)', 
              gap: '20px',
              marginTop: '20px'
            }}>
              {visibleImages.map(item => (
                <div key={item.id} style={{ position: 'relative' }}>
                  <img 
                    src={item.image} 
                    alt="Media" 
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  />
                  <p style={{ fontSize: '12px', marginTop: '5px' }}>
                    {new Date(item.created_at).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                  
                  {/* Delete Button */}
                  <div style={{
                    position: 'absolute',
                    top: 5,
                    right: 5,
                  }}>
                    <MediaDelete mediaId={item.id} onDeleteSuccess={handleDeleteSuccess} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Videos Section */}
      <section style={{ marginTop: '40px' }}>
        <h2>Videos</h2>
        {videos.length === 0 ? (
          <p>No videos available.</p>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '20px'
          }}>
            {videos.map(item => (
              <div key={item.id} style={{ position: 'relative' }}>
                <iframe
                  width="100%"
                  height="200"
                  src={getYoutubeEmbedUrl(item.youtube_url)}
                  title="YouTube video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <p style={{ fontSize: '12px', marginTop: '5px' }}>
                  {new Date(item.created_at).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
                
                {/* Delete Button */}
                <div style={{
                  position: 'absolute',
                  top: 5,
                  right: 5,
                }}>
                  <MediaDelete mediaId={item.id} onDeleteSuccess={handleDeleteSuccess} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}