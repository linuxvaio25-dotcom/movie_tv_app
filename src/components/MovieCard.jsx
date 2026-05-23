import React from 'react'

const MovieCard = ({ movie: { title, vote_average, poster_path, release_date, original_language, overview } }) => {
  const year = release_date ? release_date.split('-')[0] : 'N/A';
  const rating = vote_average ? vote_average.toFixed(1) : 'N/A';

  return (
    <div className='movie-card group'>
      <div className='relative overflow-hidden rounded-2xl'>
        <img
          src={poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : '/no-movie.png'}
          alt={title}
          className='movie-poster transition duration-300 ease-out group-hover:scale-105'
        />

        <div className='movie-hover-info absolute inset-x-0 bottom-0 bg-black/80 p-4 text-left text-sm text-gray-100 backdrop-blur-sm transform translate-y-full transition-transform duration-300 ease-out group-hover:translate-y-0'>
          <p className='font-semibold text-white mb-2'>{title}</p>
          <p className='text-xs text-gray-300 line-clamp-4'>{overview || 'No overview available'}</p>
        </div>
      </div>

      <div className='movie-info mt-4'>
        <h3>{title}</h3>

        <div className='content'>
          <div className='rating'>
            <img src='star.svg' alt='Star Icon' />
            <p>{rating}</p>
          </div>

          <span>•</span>
          <p className='lang'>{original_language}</p>

          <span>•</span>
          <p className='year'>{year}</p>
        </div>
      </div>
    </div>
  )
}

export default MovieCard