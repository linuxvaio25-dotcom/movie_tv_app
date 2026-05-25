import React from 'react'

const HoverPreview = ({
  hoveredVideoCoords,
  hoveredVideoTitle,
  hoveredVideoOverview,
  hoveredVideoLoading,
  hoveredVideoKey,
  hoveredVideoSite,
  previewOpen
}) => {
  if (!hoveredVideoTitle && !hoveredVideoLoading) {
    return null
  }

  return (
    <div
      className='fixed z-50 flex items-start justify-center px-4 pointer-events-none'
      style={{
        left: typeof window !== 'undefined' ? Math.min(hoveredVideoCoords.x + 24, window.innerWidth - 560) : 24,
        top: typeof window !== 'undefined' ? Math.max(hoveredVideoCoords.y - 420, 12) : 12,
        transform: 'translateX(0)',
        width: 'min(520px, calc(100% - 32px))'
      }}
    >
      <div className='w-full rounded-[32px] overflow-hidden border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.65),0_20px_60px_-30px_rgba(0,0,0,0.5)] bg-slate-950/95 backdrop-blur-xl'>
        <div className='flex items-center justify-between gap-4 border-b border-white/10 bg-slate-950/90 px-5 py-3'>
          <div>
            <p className='text-sm text-gray-300'>Preview</p>
            <p className='text-lg font-semibold text-white line-clamp-1'>{hoveredVideoTitle || 'Loading clip...'}</p>
          </div>
        </div>
        <div className='relative h-[320px] bg-slate-950 flex items-center justify-center overflow-hidden'>
          {hoveredVideoLoading ? (
            <p className='text-sm text-gray-300'>Loading preview...</p>
          ) : hoveredVideoKey && hoveredVideoSite === 'YouTube' ? (
            <iframe
              src={`https://www.youtube.com/embed/${hoveredVideoKey}?autoplay=1&mute=1&controls=0&rel=0&modestbranding=1&loop=1&playlist=${hoveredVideoKey}&fs=0&disablekb=1`}
              title='Movie clip'
              allow='autoplay; encrypted-media'
              frameBorder='0'
              className='absolute inset-0 h-full w-full object-cover'
            />
          ) : (
            <p className='text-sm text-gray-300'>No clip available for this movie.</p>
          )}
          <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-black/0 px-5 py-4 transition-transform duration-500 ease-out ${previewOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className='absolute inset-0 bg-gradient-to-t from-black/95 via-black/80 to-black/0 pointer-events-none' />
            <div className='relative'>
              <p className='text-sm text-gray-300'>Description</p>
              <p className='mt-2 text-sm leading-6 text-white'>{hoveredVideoOverview}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HoverPreview
