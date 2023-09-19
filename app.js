const express = require("express");
const app = express();

app.use(express.json());
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server running at http://localhost:3001/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertDirectorObjToResponseObj = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//Get list of all movie names

const convertDbObjToRespObj = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMoviesArray = `SELECT * FROM movie`;
  const movieNames = await db.all(getMoviesArray);
  response.send(
    movieNames.map((eachMovie) => convertDbObjToRespObj(eachMovie))
  );
});

//create new movie in movie table

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieIntoMovieTable = `
    INSERT
        into 
            movie
    (director_id,movie_name,lead_actor) VALUES ('${directorId}',
    '${movieName}','${leadActor}');
            
    `;
  const dbResponse = await db.run(addMovieIntoMovieTable);
  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

//return movie based on specific id

const convertDbObjToRespObject = (dbObject) => {
  return {
    movieId: dbObject.movieId,
    directorId: dbObject.directorId,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovie = `SELECT * FROM movie 
  WHERE 
  movie_id = ${movieId};`;
  const movieReturn = await db.get(getMovie);
  response.send(convertDbObjToRespObject(movieReturn));
});

//update details of movie based on movieId

app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieDetails = `
  UPDATE movie
   SET 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'

    WHERE movie_id = ${movieId};


    `;
  await db.run(updateMovieDetails);
  response.send("Movie Details Updated");
});

//Delete a movie from movie table based on movie id
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//list of all directors in the director table

app.get("/directors/", async (request, response) => {
  const getDirectorsList = `SELECT * FROM director`;
  const directors = await db.all(getDirectorsList);
  response.send(
    directors.map((eachDirector) =>
      convertDirectorObjToResponseObj(eachDirector)
    )
  );
});

//return list of all movies by specific director
app.get("/directors/:directorId/movies", async (request, response) => {
  const getDirectorsList = `SELECT movie_name FROM movie
  where director_id = '${directorId}'`;
  const directors = await db.all(getDirectorsList);
  response.send(directors.map((eachDirector) => (movieName = "${movie_name}")));
});

module.exports = app;
