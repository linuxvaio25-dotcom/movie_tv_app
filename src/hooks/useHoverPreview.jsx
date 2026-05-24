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
  const [hoveredVideoLoading, setHoveredVideoLoading] = useState(false)
  const [hoveredVideoCoords, setHoveredVideoCoords] = useState({ x: 0, y: 0 })
  const [previewOpen, setPreviewOpen] = useState(false)
  const videoCache = useRef({})

  const handleHoverStart = async (movie) => {
    if (!movie?.id) return

    const id = movie.id
    setHoveredVideoTitle(movie.title || null)
    setHoveredVideoOverview(movie.overview || 'No description available')

    if (videoCache.current[id]) {
      const { key, site } = videoCache.current[id]
      setHoveredVideoKey(key)
      setHoveredVideoSite(site)
      setHoveredVideoLoading(false)
      return
    }

    setHoveredVideoLoading(true)

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
        videoCache.current[id] = { key, site }
        setHoveredVideoKey(key)
        setHoveredVideoSite(site)
      } else {
        setHoveredVideoKey(null)
        setHoveredVideoSite(null)
      }
    } catch (error) {
      console.error('Error fetching movie videos:', error)
      setHoveredVideoKey(null)
      setHoveredVideoSite(null)
    } finally {
      setHoveredVideoLoading(false)
    }
  }

  const handleHoverEnd = () => {
    setHoveredVideoKey(null)
    setHoveredVideoSite(null)
    setHoveredVideoTitle(null)
    setHoveredVideoOverview('')
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
    hoveredVideoLoading,
    hoveredVideoCoords,
    previewOpen,
    handleHoverStart,
    handleHoverEnd,
    handleHoverMove
  }
}
