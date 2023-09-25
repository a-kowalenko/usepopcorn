import { useEffect, useState } from "react";
import StarRating from "./StarRating";

const tempMovieData = [
    {
        imdbID: "tt1375666",
        Title: "Inception",
        Year: "2010",
        Poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    },
    {
        imdbID: "tt0133093",
        Title: "The Matrix",
        Year: "1999",
        Poster: "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
    },
    {
        imdbID: "tt6751668",
        Title: "Parasite",
        Year: "2019",
        Poster: "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
    },
];

const tempWatchedData = [
    {
        imdbID: "tt1375666",
        Title: "Inception",
        Year: "2010",
        Poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
        runtime: 148,
        imdbRating: 8.8,
        userRating: 10,
    },
    {
        imdbID: "tt0088763",
        Title: "Back to the Future",
        Year: "1985",
        Poster: "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
        runtime: 116,
        imdbRating: 8.5,
        userRating: 9,
    },
];

const average = (arr) =>
    arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "c61312b4";

export default function App() {
    const [query, setQuery] = useState("");
    const [movies, setMovies] = useState([]);
    const [watched, setWatched] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedId, setSelectedId] = useState(null);

    function handleSelectMovie(id) {
        setSelectedId(id === selectedId ? null : id);
    }

    function handleCloseMovie() {
        setSelectedId(null);
    }

    function handleAddWatch(movie) {
        setWatched((watched) => [...watched, movie]);
    }

    function handleDeleteWatched(id) {
        setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
    }

    useEffect(
        function () {
            const controller = new AbortController();

            async function fetchMovies() {
                try {
                    setError("");
                    setIsLoading(true);
                    const res = await fetch(
                        `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
                        { signal: controller.signal }
                    );

                    if (!res.ok) {
                        throw new Error(
                            "Something went wrong with fetching movies"
                        );
                    }

                    const data = await res.json();

                    if (data.Response === "False") {
                        throw new Error(data.Error);
                    }

                    setMovies(data.Search);
                    setError("");
                } catch (err) {
                    if (err.name !== "AbortError") {
                        setError(err.message);
                    }
                } finally {
                    setIsLoading(false);
                }
            }

            if (query.length < 3) {
                setMovies([]);
                setError("");
                return;
            }

            handleCloseMovie();
            fetchMovies();

            return function () {
                controller.abort();
            };
        },
        [query]
    );

    return (
        <>
            <Navbar>
                <Search query={query} setQuery={setQuery} />
                <NumResults numMovies={movies.length} />
            </Navbar>
            <Main>
                <Box>
                    {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
                    {!isLoading && !error && (
                        <MovieList
                            movies={movies}
                            onSelectMovie={handleSelectMovie}
                        />
                    )}
                    {isLoading && !error && <Loader />}
                    {error && <ErrorMessage message={error} />}
                </Box>
                <Box>
                    {selectedId ? (
                        <MovieDetails
                            selectedId={selectedId}
                            onCloseMovie={handleCloseMovie}
                            onAddWatched={handleAddWatch}
                            watched={watched}
                        />
                    ) : (
                        <>
                            <Summary watched={watched} />
                            <WatchedMoviesList
                                watched={watched}
                                onDeleteWatched={handleDeleteWatched}
                            />
                        </>
                    )}
                </Box>
            </Main>
        </>
    );
}

function Loader() {
    return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
    return (
        <p className="error">
            <span>⛔</span> {message}
        </p>
    );
}

function Navbar({ children }) {
    return (
        <nav className="nav-bar">
            <Logo />
            {children}
        </nav>
    );
}

function Logo() {
    return (
        <div className="logo">
            <span role="img">🍿</span>
            <h1>usePopcorn</h1>
        </div>
    );
}

function Search({ query, setQuery }) {
    return (
        <input
            className="search"
            type="text"
            placeholder="Search movies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
        />
    );
}

function NumResults({ numMovies }) {
    return (
        <p className="num-results">
            Found <strong>{numMovies}</strong> results
        </p>
    );
}

function Main({ children }) {
    return <main className="main">{children}</main>;
}

function Box({ children }) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="box">
            <button
                className="btn-toggle"
                onClick={() => setIsOpen((open) => !open)}
            >
                {isOpen ? "–" : "+"}
            </button>
            {isOpen && children}
        </div>
    );
}

function MovieList({ movies, onSelectMovie }) {
    return (
        <ul className="list list-movies">
            {movies?.map((movie) => (
                <Movie
                    movie={movie}
                    key={movie.imdbID}
                    onSelectMovie={onSelectMovie}
                >
                    <p>
                        <span>🗓</span>
                        <span>{movie.Year}</span>
                    </p>
                </Movie>
            ))}
        </ul>
    );
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
    const [isLoading, setIsLoading] = useState(false);
    const [movie, setMovie] = useState({});
    const [errorMessage, setErrorMessage] = useState("");
    const [userRating, setUserRating] = useState("");

    const isWatched = watched.some((el) => el.imdbID === selectedId);
    const watchedUserRating = watched.find(
        (movie) => movie.imdbID === selectedId
    )?.userRating;

    const {
        Title,
        Year,
        Poster,
        Runtime: runtime,
        imdbRating,
        Plot,
        Released,
        Actors,
        Director,
        Genre,
    } = movie;

    function handleAdd() {
        const newWatchedMovie = {
            imdbID: selectedId,
            Title,
            Year,
            Poster,
            imdbRating: Number(imdbRating),
            runtime: runtime.split(" ").at(0),
            userRating,
        };

        onAddWatched(newWatchedMovie);
        onCloseMovie();
    }

    useEffect(
        function () {
            const controller = new AbortController();

            async function getMovieDetails() {
                try {
                    setErrorMessage("");
                    setIsLoading(true);
                    const res = await fetch(
                        `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`,
                        { signal: controller.signal }
                    );

                    if (!res.ok) {
                        throw new Error("Error getting movie details");
                    }

                    const data = await res.json();

                    if (data.Response === "Error") {
                        throw new Error(data.Message);
                    }

                    setMovie(data);
                    setErrorMessage("");
                } catch (err) {
                    if (err.name !== "AbortError") {
                        setErrorMessage(err.message);
                    }
                } finally {
                    setIsLoading(false);
                }
            }

            getMovieDetails();

            return function () {
                controller.abort();
            };
        },
        [selectedId]
    );

    useEffect(
        function () {
            if (!Title) {
                return;
            }
            document.title = `Movie : ${Title}`;

            return function () {
                document.title = "usePopcorn";
            };
        },
        [Title]
    );

    useEffect(
        function () {
            function callback(e) {
                if (e.code === "Escape") {
                    onCloseMovie();
                }
            }

            document.addEventListener("keydown", callback);

            return function () {
                document.removeEventListener("keydown", callback);
            };
        },
        [onCloseMovie]
    );

    return (
        <>
            {errorMessage && <ErrorMessage message={errorMessage} />}
            {isLoading && !errorMessage && <Loader />}
            {!isLoading && !errorMessage && (
                <div className="details">
                    <header>
                        <img src={Poster} alt={`Poster of ${movie} movie`} />
                        <div className="details-overview">
                            <h2>{Title}</h2>
                            <p>
                                {Released} &bull; {runtime}
                            </p>
                            <p>{Genre}</p>
                            <p>
                                <span>⭐</span>
                            </p>{" "}
                            {imdbRating} IMDb rating
                        </div>
                    </header>

                    <section>
                        <div className="rating">
                            {!isWatched ? (
                                <>
                                    <StarRating
                                        maxRating={10}
                                        size={24}
                                        setMovieRating={setUserRating}
                                    />
                                    {userRating > 0 && (
                                        <button
                                            className="btn-add"
                                            onClick={handleAdd}
                                        >
                                            + Add to list
                                        </button>
                                    )}
                                </>
                            ) : (
                                <p>
                                    You have rated this movie{" "}
                                    {watchedUserRating}
                                    <span>⭐</span>
                                </p>
                            )}
                        </div>
                        <p>
                            <em>{Plot}</em>
                        </p>
                        <p>Starring {Actors}</p>
                        <p>Directed by {Director}</p>
                    </section>

                    <button className="btn-back" onClick={onCloseMovie}>
                        &larr;
                    </button>
                </div>
            )}
        </>
    );
}

function WatchedMoviesList({ watched, onDeleteWatched }) {
    return (
        <ul className="list">
            {watched.map((movie) => (
                <WatchedMovie
                    movie={movie}
                    key={movie.imdbID}
                    onDeleteWatched={onDeleteWatched}
                >
                    <MovieStats
                        imdbRating={movie.imdbRating}
                        userRating={movie.userRating}
                        runtime={movie.runtime}
                    />
                </WatchedMovie>
            ))}
        </ul>
    );
}

function Movie({ movie, children, onSelectMovie, onDeleteWatched }) {
    return (
        <li onClick={() => onSelectMovie(movie.imdbID)}>
            <img src={movie.Poster} alt={`${movie.Title} poster`} />
            <h3>{movie.Title}</h3>
            <div>{children}</div>
            {onDeleteWatched && (
                <button className="btn-delete" onClick={onDeleteWatched}>
                    X
                </button>
            )}
        </li>
    );
}

function WatchedMovie({ movie, children, onDeleteWatched }) {
    return (
        <li>
            <img src={movie.Poster} alt={`${movie.Title} poster`} />
            <h3>{movie.Title}</h3>
            <div>{children}</div>

            <button
                className="btn-delete"
                onClick={() => onDeleteWatched(movie.imdbID)}
            >
                X
            </button>
        </li>
    );
}

function Summary({ watched }) {
    const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
    const avgUserRating = average(watched.map((movie) => movie.userRating));
    const avgRuntime = average(watched.map((movie) => movie.runtime));

    return (
        <div className="summary">
            <h2>Movies you watched</h2>
            <div>
                <p>
                    <span>#️⃣</span>
                    <span>{watched.length} movies</span>
                </p>
                <MovieStats
                    imdbRating={avgImdbRating.toFixed(1)}
                    userRating={avgUserRating.toFixed(1)}
                    runtime={avgRuntime.toFixed(1)}
                />
            </div>
        </div>
    );
}

function MovieStats({ imdbRating, userRating, runtime }) {
    return (
        <>
            <p>
                <span>⭐️</span>
                <span>{imdbRating}</span>
            </p>
            <p>
                <span>🌟</span>
                <span>{userRating}</span>
            </p>
            <p>
                <span>⏳</span>
                <span>{runtime} min</span>
            </p>
        </>
    );
}
