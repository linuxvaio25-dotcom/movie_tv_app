import React, { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Search from './components/Search'
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import HoverPreview from './components/HoverPreview';
import { useHoverPreview } from './hooks/useHoverPreview';
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCount } from './appwrite';

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
}

const App = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [errorMessage, setErrorMessage] = useState('');
    const [movieList, setMovieList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState();
    const [trendingMovies, setTrendingMovies] = useState([]);

    const { scrollY } = useScroll();
    const titleY = useTransform(scrollY, [0, 220], [0, -140]);
    const subtitleY = useTransform(scrollY, [0, 220], [0, -130]);
    const titleOpacity = useTransform(scrollY, [0, 220], [1, 0.92]);

    const {
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
    } = useHoverPreview();

    // Debounce the search term to avoid making API calls on every keystroke

    useDebounce(() => {
        setDebouncedSearchTerm(searchTerm);
    }, 500, [searchTerm]
    );

    const fetchMovies = async (query = '') => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const endpoint = query
                ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
                : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

            const response = await fetch(endpoint, API_OPTIONS);

            if (!response.ok) {
                throw new Error('Failed to fetch movies');
            }

            const data = await response.json();

            if (data.response === 'False') {
                setErrorMessage(data.error || 'No movies found');
                setMovieList([]);
                return;
            }

            setMovieList(data.results || []);

            if (query && data.results.length > 0) {
                await updateSearchCount(query, data.results[0]);
            }

        } catch (error) {
            console.error(`Error fetching movies: ${error}`);
            setErrorMessage('Error fetching movies. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    }

    const loadTrendingMovies = async () => {
        try {
            const movies = await getTrendingMovies();

            setTrendingMovies(movies);
        } catch (error) {
            console.error(`Error loading trending movies: ${error}`);
            // setErrorMessage('Error loading trending movies. Please try again later.');
        }
    }

    // useEffect(() => {
    //     const fetchData = async () => {
    //         try {
    //             const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${import.meta.env.VITE_TMDB_API_KEY}&query=${searchTerm}`)
    //             const data = await response.json()
    //             console.log(data)
    //         } catch (error) {
    //             console.error('Error fetching data:', error)
    //         }
    //     }

    //     if (searchTerm) {
    //         fetchData()
    //     }
    // }, [searchTerm])

    useEffect(() => {
        fetchMovies(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        loadTrendingMovies();
    }, []);

    return (
        <main>
            <div className='pattern' />

            <div className="wrapper">
                <header className='relative'>
                    <div className='relative mx-auto max-w-lg'>
                        <img
                            src="./film_reel-clipart-1.png"
                            alt="Film Reel Banner"
                            className='hero relative z-0 w-full h-auto object-contain mx-auto drop-shadow-md'
                        />

                        <motion.h1
                            style={{ y: titleY, opacity: titleOpacity }}
                            className='hero-title relative z-10 mt-4 mx-auto w-fit bg-transparent text-center text-5xl font-bold leading-tight tracking-[-1%] text-white sm:text-[84px] sm:leading-[76px]'
                        >
                            <img src="./MOVIE_SEARCH_goldLogo.png" alt="Movie Search" className='w-[18rem] sm:w-[24rem] h-auto object-contain' />
                            {/* <span className='text-gradient movie-stroke'>MOVIE SEARCH</span> */}
                        </motion.h1>
                    </div>

                    <motion.h2
                        style={{ y: subtitleY, opacity: titleOpacity }}
                        className='text-center mt-6 text-xl text-white sm:text-2xl'
                    >
                        Find Movies and Shows currently Streaming on Netflix, Hulu, Prime Video and more.
                    </motion.h2>

                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </header>

                {trendingMovies.length > 0 && (
                    <section className="trending">
                        <h2>Trending</h2>

                        <ul>
                            {trendingMovies.map((movie, index) => (
                                <li key={movie.$id}>
                                    <p>{index + 1}</p>
                                    <img src={movie.poster_url} alt={movie.title} />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* <h1 className='text-white'>{searchTerm}</h1> */}
                <section className="all-movies mt-16">
                    {/* <h2 className="mt-[40px]">All Movies</h2> */}
                    <h2 >Movies</h2>

                    {/* {errorMessage && <p className='text-red-500'>{errorMessage}</p>} */}
                    {isLoading ? (
                        <Spinner />
                    ) : errorMessage ? (
                        <p className='text-red-500'>{errorMessage}</p>
                    ) : (
                        <ul>
                            {movieList.map((movie) => (
                                // <p key={movie.id} className = "text-white">{movie.title}</p>
                                <MovieCard
                                    key={movie.id}
                                    movie={movie}
                                    onHoverStart={handleHoverStart}
                                    onHoverEnd={handleHoverEnd}
                                    onHoverMove={handleHoverMove}
                                />
                            ))}
                        </ul>
                    )}
                </section>

                <HoverPreview
                    hoveredVideoCoords={hoveredVideoCoords}
                    hoveredVideoTitle={hoveredVideoTitle}
                    hoveredVideoOverview={hoveredVideoOverview}
                    hoveredVideoProviders={hoveredVideoProviders}
                    hoveredVideoProvidersLoading={hoveredVideoProvidersLoading}
                    hoveredVideoLoading={hoveredVideoLoading}
                    hoveredVideoKey={hoveredVideoKey}
                    hoveredVideoSite={hoveredVideoSite}
                    previewOpen={previewOpen}
                />
            </div>
        </main>
    )
}

export default App