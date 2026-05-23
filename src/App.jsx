import React, { useEffect, useState, useRef } from 'react'
import Search from './components/Search'
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
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
    const [hoveredVideoKey, setHoveredVideoKey] = useState(null);
    const [hoveredVideoSite, setHoveredVideoSite] = useState(null);
    const [hoveredVideoTitle, setHoveredVideoTitle] = useState(null);
    const [hoveredVideoOverview, setHoveredVideoOverview] = useState('');
    const [hoveredVideoLoading, setHoveredVideoLoading] = useState(false);
    const [hoveredVideoCoords, setHoveredVideoCoords] = useState({ x: 0, y: 0 });
    const [previewOpen, setPreviewOpen] = useState(false);
    const videoCache = useRef({});

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

    const handleHoverStart = async (movie) => {
        if (!movie || !movie.id) return;

        const id = movie.id;
        setHoveredVideoTitle(movie.title || null);
        setHoveredVideoOverview(movie.overview || 'No description available');

        // if cached, use it
        if (videoCache.current[id]) {
            const { key, site } = videoCache.current[id];
            setHoveredVideoKey(key);
            setHoveredVideoSite(site);
            setHoveredVideoLoading(false);
            return;
        }

        setHoveredVideoLoading(true);

        try {
            const resp = await fetch(`${API_BASE_URL}/movie/${id}/videos?language=en-US`, API_OPTIONS);
            if (!resp.ok) {
                throw new Error('Failed to fetch videos');
            }

            const data = await resp.json();
            const results = data.results || [];

            // Prefer clips, then trailers, then teasers
            const preferred = results.find(v => v.type === 'Clip') || results.find(v => v.type === 'Trailer') || results.find(v => v.type === 'Teaser') || results[0];

            if (preferred) {
                const { key, site } = preferred;
                videoCache.current[id] = { key, site };
                setHoveredVideoKey(key);
                setHoveredVideoSite(site);
            } else {
                setHoveredVideoKey(null);
                setHoveredVideoSite(null);
            }

        } catch (error) {
            console.error('Error fetching movie videos:', error);
            setHoveredVideoKey(null);
            setHoveredVideoSite(null);
        } finally {
            setHoveredVideoLoading(false);
        }
    };

    const handleHoverEnd = () => {
        setHoveredVideoKey(null);
        setHoveredVideoSite(null);
        setHoveredVideoTitle(null);
        setHoveredVideoOverview('');
    };

    useEffect(() => {
        if (hoveredVideoTitle || hoveredVideoLoading) {
            requestAnimationFrame(() => {
                setPreviewOpen(true);
            });
        } else {
            setPreviewOpen(false);
        }
    }, [hoveredVideoTitle, hoveredVideoLoading]);

    const handleHoverMove = (event) => {
        setHoveredVideoCoords({ x: event.clientX, y: event.clientY });
    };

    return (
        <main>
            <div className='pattern' />

            <div className="wrapper">
                <header className='relative'>
                    <img src="./hero.png" alt="Hero Banner" className='hero' />
                    <h1>Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassle</h1>

                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </header>

                {trendingMovies.length > 0 && (
                    <section className="trending">
                        <h2>Trending Movies</h2>

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
                    <h2 >All Movies</h2>

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

                {(hoveredVideoTitle || hoveredVideoLoading) && (
                    <div
                        className='fixed z-50 flex items-start justify-center px-4 pointer-events-none'
                        style={{
                            left: typeof window !== 'undefined' ? Math.min(hoveredVideoCoords.x + 24, window.innerWidth - 560) : 24,
                            top: typeof window !== 'undefined' ? Math.max(hoveredVideoCoords.y - 420, 12) : 12,
                            transform: 'translateX(0)',
                            width: 'min(520px, calc(100% - 32px))'
                        }}
                    >
                        <div className='w-full rounded-[32px] overflow-hidden border border-white/15 shadow-2xl bg-slate-950/95 backdrop-blur-xl'>
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
                )}
            </div>
        </main>
    )
}

export default App