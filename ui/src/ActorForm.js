import {useState} from "react";

export default function ActorForm(props) {
    const [actorName, setActorName] = useState('');

    function handleAddActor(event) {
        event.preventDefault();
        if (actorName.trim().length === 0) {
            return alert('Actor name cannot be empty');
        }
        props.onActorSubmit(actorName);
        setActorName('');
    }

    return <form onSubmit={handleAddActor} style={{marginTop: '10px'}}>
        <div>
            <label>Actor name</label>
            <input 
                type="text" 
                value={actorName} 
                onChange={(event) => setActorName(event.target.value)}
                placeholder="Enter actor name"
            />
        </div>
        <button type="submit">{props.buttonLabel || 'Add Actor'}</button>
    </form>;
}
