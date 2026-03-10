import { Helmet } from 'react-helmet-async'

const BASE_URL = 'https://swietlicki.eu'
const DEFAULT_IMAGE = `${BASE_URL}/home-page.jpg`

export default function SEO({ title, description, path = '/', ogImage, type = 'website', children }) {
  const canonical = `${BASE_URL}${path}`
  const image = ogImage || DEFAULT_IMAGE

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {children}
    </Helmet>
  )
}
