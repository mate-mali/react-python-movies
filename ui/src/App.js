import './App.css';
import {useState, useEffect} from "react";
import "milligram";
import MovieForm from "./MovieForm";
import MoviesList from "./MoviesList";

function App() {
    /* https://dashboard.render.com/web/srv-d5mbk8d6ubrc73a4r2v0/deploys/dep-d5mbk956ubrc73a4r38g */
    const [movies, setMovies] = useState([]);
    const [addingMovie, setAddingMovie] = useState(false);

    /* Fetch movies and their actors on component mount */ 
    useEffect(() => {
        const fetchMovies = async () => {
            const response = await fetch(`/movies`);
            if (response.ok) {
                const moviesData = await response.json();
                console.log("Fetched movies:", moviesData);
                
                // Fetch actors for each movie
                const moviesWithActors = await Promise.all(
                    moviesData.map(async (movie) => {
                        console.log(`Fetching actors for movie ${movie.id}...`);
                        const actorsResponse = await fetch(`/movies/${movie.id}/actors`);
                        console.log(`Response status for movie ${movie.id}:`, actorsResponse.status);
                        if (actorsResponse.ok) {
                            const actors = await actorsResponse.json();
                            console.log(`Fetched actors for movie ${movie.id}:`, actors);
                            return {...movie, actors: actors};
                        }
                        console.log(`Failed to fetch actors for movie ${movie.id}`);
                        return {...movie, actors: []};
                    })
                );
                
                console.log("Final movies with actors:", moviesWithActors);
                setMovies(moviesWithActors);
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
        console.log("Adding movie:", movie);
        const response = await fetch('/movies', {
            method: 'POST',
            body: JSON.stringify(movie),
            headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
            const movieWithId = await response.json();
            console.log("Response from API:", movieWithId);
            movie.id = movieWithId.id;
            movie.actors = [];  // New movies start with no actors
            console.log("Final movie to add to state:", movie);
            setMovies([...movies, movie]);
            setAddingMovie(false);
        } 
    }

    async function handleAddActor(movieId, actorName) {
        // Find the movie
        const movie = movies.find(m => m.id === movieId);
        
        // Check if actor already exists in this movie
        if (movie.actors.some(a => a.name.toLowerCase() === actorName.toLowerCase())) {
            return alert(`${actorName} is already starring in this movie`);
        }
        
        console.log(`Adding ${actorName} to movie ${movieId}`);
        const response = await fetch(`/movies/${movieId}/actors?actor_name=${encodeURIComponent(actorName)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        console.log(`Response status: ${response.status}`);
        
        if (response.ok) {
            const newActor = await response.json();
            console.log(`Successfully added actor:`, newActor);
            
            // Update the movie's actors list
            setMovies(movies.map(movie => 
                movie.id === movieId 
                    ? {...movie, actors: [...movie.actors, newActor]}
                    : movie
            ));
        } else {
            const errorText = await response.text();
            console.error(`Failed to add actor. Status: ${response.status}, Body:`, errorText);
        }
    }

    async function handleDeleteActor(movieId, actorId) {
        const response = await fetch(`/movies/${movieId}/actors/${actorId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            // Remove the actor from the movie's actors list
            setMovies(movies.map(movie =>
                movie.id === movieId
                    ? {...movie, actors: movie.actors.filter(a => a.id !== actorId)}
                    : movie
            ));
        }
    }

    return (
        <div className="container">
            <h1>My favourite movies to watch</h1>
            <p>For additional API endpoint and documentation please check <a href="/docs" target="_blank" rel="noopener noreferrer">Swagger Documentation</a></p>
            {movies.length === 0
                ? <p>No movies yet. Maybe add something?</p>
                : <MoviesList movies={movies}
                              onDeleteMovie={handleDeleteMovie}
                              onAddActor={handleAddActor}
                              onDeleteActor={handleDeleteActor}
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
