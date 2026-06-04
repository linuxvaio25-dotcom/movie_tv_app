import { useEffect, useRef, useState } from 'react'

const API_BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = import.meta.env.VITE_TMDB_API_KEY

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

export function useHoverPreview() {
  const [hoveredVideoKey, setHoveredVideoKey] = useState(null)
  const [hoveredVideoSite, setHoveredVideoSite] = useState(null)
  const [hoveredVideoTitle, setHoveredVideoTitle] = useState(null)
  const [hoveredVideoOverview, setHoveredVideoOverview] = useState('')
  const [hoveredVideoProviders, setHoveredVideoProviders] = useState([])
  const [hoveredVideoLoading, setHoveredVideoLoading] = useState(false)
  const [hoveredVideoProvidersLoading, setHoveredVideoProvidersLoading] = useState(false)
  const [hoveredVideoCoords, setHoveredVideoCoords] = useState({ x: 0, y: 0 })
  const [previewOpen, setPreviewOpen] = useState(false)
  const videoCache = useRef({})

  const handleHoverStart = async (movie) => {
    if (!movie?.id) return

    const id = movie.id
    setHoveredVideoTitle(movie.title || null)
    setHoveredVideoOverview(movie.overview || 'No description available')

    if (videoCache.current[id]) {
      const { key, site, providers } = videoCache.current[id]
      setHoveredVideoKey(key)
      setHoveredVideoSite(site)
      setHoveredVideoProviders(providers || [])
      setHoveredVideoLoading(false)
      setHoveredVideoProvidersLoading(false)
      return
    }

    setHoveredVideoLoading(true)
    setHoveredVideoProvidersLoading(true)

    try {
      const resp = await fetch(`${API_BASE_URL}/movie/${id}/videos?language=en-US`, API_OPTIONS)
      if (!resp.ok) {
        throw new Error('Failed to fetch videos')
      }

      const data = await resp.json()
      const results = data.results || []
      const preferred =
        results.find(v => v.type === 'Clip') ||
        results.find(v => v.type === 'Trailer') ||
        results.find(v => v.type === 'Teaser') ||
        results[0]

      if (preferred) {
        const { key, site } = preferred
        setHoveredVideoKey(key)
        setHoveredVideoSite(site)
        videoCache.current[id] = { key, site, providers: [] }
      } else {
        setHoveredVideoKey(null)
        setHoveredVideoSite(null)
        videoCache.current[id] = { key: null, site: null, providers: [] }
      }
    } catch (error) {
      console.error('Error fetching movie videos:', error)
      setHoveredVideoKey(null)
      setHoveredVideoSite(null)
      videoCache.current[id] = { key: null, site: null, providers: [] }
    }

    try {
      const providerResp = await fetch(`${API_BASE_URL}/movie/${id}/watch/providers`, API_OPTIONS)
      if (!providerResp.ok) {
        throw new Error('Failed to fetch watch providers')
      }

      const providerData = await providerResp.json()
      const country = providerData.results?.US || {}
      const providerEntries = [
        ...(country.flatrate || []),
        ...(country.ads || []),
        ...(country.buy || []),
        ...(country.rent || [])
      ]
      const providers = Array.from(new Set(providerEntries.map(p => p.provider_name)))

      setHoveredVideoProviders(providers)
      videoCache.current[id] = {
        ...(videoCache.current[id] || {}),
        providers
      }
    } catch (error) {
      console.error('Error fetching watch providers:', error)
      setHoveredVideoProviders([])
      videoCache.current[id] = {
        ...(videoCache.current[id] || {}),
        providers: []
      }
    } finally {
      setHoveredVideoLoading(false)
      setHoveredVideoProvidersLoading(false)
    }
  }

  const handleHoverEnd = () => {
    setHoveredVideoKey(null)
    setHoveredVideoSite(null)
    setHoveredVideoTitle(null)
    setHoveredVideoOverview('')
    setHoveredVideoProviders([])
    setHoveredVideoProvidersLoading(false)
  }

  const handleHoverMove = (event) => {
    setHoveredVideoCoords({ x: event.clientX, y: event.clientY })
  }

  useEffect(() => {
    if (hoveredVideoTitle || hoveredVideoLoading) {
      requestAnimationFrame(() => {
        setPreviewOpen(true)
      })
    } else {
      setPreviewOpen(false)
    }
  }, [hoveredVideoTitle, hoveredVideoLoading])

  return {
    hoveredVideoKey,
    hoveredVideoSite,
    hoveredVideoTitle,
    hoveredVideoOverview,
    hoveredVideoProviders,
    hoveredVideoProvidersLoading,
    hoveredVideoLoading,
    hoveredVideoCoords,
    previewOpen,
    handleHoverStart,
    handleHoverEnd,
    handleHoverMove
  }
}
