import { Helmet } from 'react-helmet-async'

const BASE_URL = 'https://tenor.swietlicki.eu'
const DEFAULT_IMAGE = `${BASE_URL}/Home%20page.jpg`

export default function SEO({ title, description, path = '/', ogImage, type = 'website', breadcrumbs, children }) {
  const canonical = `${BASE_URL}${path}`
  const image = ogImage || DEFAULT_IMAGE

  const breadcrumbSchema = breadcrumbs ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbs.map((item, i) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'name': item.name,
      'item': `${BASE_URL}${item.path}`
    }))
  } : null

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

      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
      {children}
    </Helmet>
  )
}
