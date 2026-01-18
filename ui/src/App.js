import './App.css';
import {useState, useEffect} from "react";
import "milligram";
import MovieForm from "./MovieForm";
import MoviesList from "./MoviesList";

function App() {
    /* https://dashboard.render.com/web/srv-d5mbk8d6ubrc73a4r2v0/deploys/dep-d5mbk956ubrc73a4r38g */
    const [movies, setMovies] = useState([]);
    const [addingMovie, setAddingMovie] = useState(false);

    /* without useeffect query would run a many times as app would br refreshed (which is very change) - so use effect prevents query from being executed unless specified otherwise  */ 
    useEffect(() => {
    const fetchMovies = async () => {
        const response = await fetch(`/movies`);
        if (response.ok) {
            const movies = await response.json();
            setMovies(movies);
        }
    };

    fetchMovies();

}, []);

    async function handleDeleteMovie(movie) {
        const response = await fetch(`/movies/${movie.id}`, {
            method: 'DELETE',
    });
    if (response.ok) {
        const nextMovies = movies.filter(m => m !== movie);
        setMovies(nextMovies);
    }

}

    async function handleAddMovie(movie) {
        movie.actors = ''; /*placeholder entry to mitigate misalignment between accepting enpoint and sending frontend*/ 
        
        /** await fetch assum es we dont know execution time fro http request and when the response is back some time then the jaascript should come back here and continue  */
        
        const response = await fetch('/movies', {
            method: 'POST',
            body: JSON.stringify(movie),
            headers: { 'Content-Type': 'application/json' }
    });
        if (response.ok) {
            const movieWithId = await response.json();
            movie.id = movieWithId.id; 
            setMovies([...movies, movie]);
            setAddingMovie(false);
        } 
        /* for iD retrieveal or add dependency to useEffect like the list at the end  */
    }


    return (
        <div className="container">
            <h1>My favourite movies to watch</h1>
            {movies.length === 0
                ? <p>No movies yet. Maybe add something?</p>
                : <MoviesList movies={movies}
                              onDeleteMovie={handleDeleteMovie}
                />}
            {addingMovie
                ? <MovieForm onMovieSubmit={handleAddMovie}
                             buttonLabel="Add a movie"
                />
                : <button onClick={() => setAddingMovie(true)}>Add a movie</button>}
        </div>
    );
}

export default App;
