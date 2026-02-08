import {useState} from "react";
import ActorForm from "./ActorForm";

export default function MovieListItem(props) {
    const [showActorForm, setShowActorForm] = useState(false);

    return (
        <div style={{marginBottom: '20px', padding: '10px', border: '1px solid #ccc'}}>
            <div>
                <strong>{props.movie.title}</strong>
                {' '}
                <span>({props.movie.year})</span>
                {' '}
                directed by {props.movie.director}
                {' '}
                <a onClick={props.onDelete} style={{cursor: 'pointer', color: 'red'}}>Delete</a>
            </div>
            <p>{props.movie.description}</p>
            
            <div style={{marginTop: '10px'}}>
                <strong>Actors:</strong>
                {props.movie.actors && props.movie.actors.length > 0 ? (
                    <ul>
                        {props.movie.actors.map((actor) => (
                            <li key={actor.id}>
                                {actor.name}
                                {' '}
                                <a 
                                    onClick={() => props.onDeleteActor(actor.id)} 
                                    style={{cursor: 'pointer', color: 'red', fontSize: '0.9em'}}
                                >
                                    (remove)
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={{fontSize: '0.9em', color: '#666'}}>No actors yet</p>
                )}
            </div>

            {showActorForm ? (
                <>
                    <ActorForm onActorSubmit={props.onAddActor} buttonLabel="Add Actor" />
                    <button onClick={() => setShowActorForm(false)} style={{marginTop: '5px'}}>Cancel</button>
                </>
            ) : (
                <button onClick={() => setShowActorForm(true)}>Add Actor</button>
            )}
        </div>
    );
}
