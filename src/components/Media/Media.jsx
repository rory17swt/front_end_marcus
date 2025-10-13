import { useEffect, useState } from 'react'
import { getAllMedia } from '../../services/media'
import Spinner from '../Spinner/Spinner'

export default function MediaList() {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  if (loading) return <Spinner />
  if (error) return <p>{error}</p>

  return (
    <div>
      <section>
        <h2>Media Gallery</h2>
        {media.length === 0 ? (
          <p>No media available.</p>
        ) : (
          <div>
            {media.map(item => (
              <div key={item.id}>
                {/* Image */}
                {item.image && (
                  <img 
                    src={item.image} 
                    alt="Media" 
                    style={{ maxWidth: '300px', height: 'auto' }}
                  />
                )}

                {/* YouTube Video */}
                {item.youtube_url && (
                  <iframe
                    width="560"
                    height="315"
                    src={getYoutubeEmbedUrl(item.youtube_url)}
                    title="YouTube video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}

                {/* Created Date */}
                <p>
                  {new Date(item.created_at).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}