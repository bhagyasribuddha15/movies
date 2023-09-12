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
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
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

module.exports = app;
