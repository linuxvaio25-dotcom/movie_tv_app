import React from 'react'

const MovieCard = ({ movie, onHoverStart, onHoverEnd, onHoverMove }) => {
  const { title, vote_average, poster_path, release_date, original_language, overview } = movie;
  const year = release_date ? release_date.split('-')[0] : 'N/A';
  const rating = vote_average ? vote_average.toFixed(1) : 'N/A';

  return (
    <div
      className='movie-card group'
      onMouseEnter={(e) => {
        onHoverStart && onHoverStart(movie)
        onHoverMove && onHoverMove(e)
      }}
      onMouseMove={(e) => onHoverMove && onHoverMove(e)}
      onMouseLeave={() => onHoverEnd && onHoverEnd()}
    >
      <div className='relative overflow-hidden rounded-2xl'>
        <img
          src={poster_path ? `https://image.tmdb.org/t/p/w500${poster_path}` : '/no-movie.png'}
          alt={title}
          className='movie-poster transition duration-300 ease-out group-hover:scale-105'
        />
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