from fastapi import FastAPI, Body, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any
import sqlite3

# https://fracz.github.io/dydaktyka/issi/movies-fullstack/06_deletion/index.html
class Movie(BaseModel):
    title: str
    year: str
    director: str
    description: str

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="../ui/build/static", check_dir=False), name="static")


@app.get("/")
def serve_react_app():
   return FileResponse("../ui/build/index.html")

@app.get('/movies')
def get_movies():  # put application's code here
    db = sqlite3.connect('movies.db')
    db.execute('PRAGMA foreign_keys = ON')
    cursor = db.cursor()
    movies = cursor.execute('SELECT * FROM movies')

    output = []
    for movie in movies:
         movie = {'id': movie[0], 'title': movie[1], 'year': movie[2], 'director': movie[3], 'description': movie[4]}
         output.append(movie)
    return output

@app.get('/actors')
def get_all_actors():
    db = sqlite3.connect('movies.db')
    db.execute('PRAGMA foreign_keys = ON')
    cursor = db.cursor()
    cursor.execute('SELECT id, name FROM actors ORDER BY name')
    actors = [{'id': row[0], 'name': row[1]} for row in cursor.fetchall()]
    db.close()
    return actors

@app.get('/movies/{movie_id}/actors')
def get_movie_actors(movie_id: int):
    db = sqlite3.connect('movies.db')
    db.execute('PRAGMA foreign_keys = ON')
    cursor = db.cursor()
    cursor.execute('''
        SELECT a.id, a.name FROM actors a
        JOIN starring s ON a.id = s.actor_id
        WHERE s.movie_id = ?
    ''', (movie_id,))
    actors = [{'id': row[0], 'name': row[1]} for row in cursor.fetchall()]
    db.close()
    print(f"DEBUG: Fetched {len(actors)} actors for movie {movie_id}: {actors}")
    return actors

@app.post('/movies/{movie_id}/actors')
def add_actor_to_movie(movie_id: int, actor_name: str = Query(...)):
    db = sqlite3.connect('movies.db')
    db.execute('PRAGMA foreign_keys = ON')
    cursor = db.cursor()
    
    cursor.execute('SELECT id FROM actors WHERE name = ?', (actor_name,))
    result = cursor.fetchone()
    
    if result:
        actor_id = result[0]
    else:
        cursor.execute('INSERT INTO actors (name) VALUES (?)', (actor_name,))
        actor_id = cursor.lastrowid
    
    cursor.execute('INSERT INTO starring (movie_id, actor_id) VALUES (?, ?)', 
                   (movie_id, actor_id))
    db.commit()
    db.close()
    
    return {'id': actor_id, 'name': actor_name}

@app.delete('/movies/{movie_id}/actors/{actor_id}')
def delete_actor_from_movie(movie_id: int, actor_id: int):
    db = sqlite3.connect('movies.db')
    db.execute('PRAGMA foreign_keys = ON')
    cursor = db.cursor()
    cursor.execute('DELETE FROM starring WHERE movie_id = ? AND actor_id = ?',
                   (movie_id, actor_id))
    db.commit()
    db.close()
    
    return {'message': 'Actor removed from movie'}

@app.get('/movies/{movie_id}')
def get_single_movie(movie_id:int):  # put application's code here
    db = sqlite3.connect('movies.db')
    db.execute('PRAGMA foreign_keys = ON')
    cursor = db.cursor()
    movie = cursor.execute(f"SELECT * FROM movies WHERE id={movie_id}").fetchone()
    if movie is None:
        return {'message': "Movie not found"}
    return {'id': movie[0], 'title': movie[1], 'year': movie[2], 'director': movie[3], 'description': movie[4]}

@app.post("/movies")
def add_movie(movie: Movie):
    db = sqlite3.connect('movies.db')
    db.execute('PRAGMA foreign_keys = ON')
    cursor = db.cursor()
    cursor.execute(f"INSERT INTO movies (title, year, director, description) VALUES (?, ?, ?, ?)", 
                   (movie.title, movie.year, movie.director, movie.description))
    db.commit()
    return {
        "message": f"Movie with id = {cursor.lastrowid} added successfully",
        "id": cursor.lastrowid
        }


@app.put("/movies/{movie_id}")
def update_movie(movie_id:int, params: dict[str, Any]):
    db = sqlite3.connect('movies.db')
    db.execute('PRAGMA foreign_keys = ON')
    cursor = db.cursor()
    cursor.execute(
    "UPDATE movies SET title = ?, year = ?, director = ?, description = ? WHERE id = ?",
    (params['title'], params['year'], params['director'], params.get('description', ''), movie_id)
    )
    db.commit()
    if cursor.rowcount == 0:
        return {"message": f"Movie with id = {movie_id} not found"}
    return {"message": f"Movie with id = {movie_id} updated successfully"}

@app.delete("/movies/{movie_id}")
def delete_movie(movie_id:int):
    db = sqlite3.connect('movies.db')
    db.execute('PRAGMA foreign_keys = ON')
    cursor = db.cursor()
    cursor.execute("DELETE FROM movies WHERE id = ?", (movie_id,))
    db.commit()
    if cursor.rowcount == 0:
        return {"message": f"Movie with id = {movie_id} not found"}
    return {"message": f"Movie with id = {movie_id} deleted successfully"}

@app.delete("/movies")
def delete_movies(movie_id:int):
    db = sqlite3.connect('movies.db')
    db.execute('PRAGMA foreign_keys = ON')
    cursor = db.cursor()
    cursor.execute("DELETE FROM movies")
    db.commit()
    return {"message": f"Deleted {cursor.rowcount} movies"}


# if __name__ == '__main__':
#     app.run()
