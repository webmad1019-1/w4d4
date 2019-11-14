const express = require("express");
const app = express();
const hbs = require("hbs");
const mongoose = require("mongoose");
const Movies = require("./models/Movies");

app.set("views", __dirname + "/views");
app.set("view engine", "hbs");
// app.use(hbs);
app.use(express.static("public"));

mongoose
  .connect("mongodb://localhost/movies", { useNewUrlParser: true })
  .then(x => console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`))
  .catch(err => console.error("Error connecting to mongo", err));

app.get("/getMovieByYear", (req, res) => {
  res.render("getMovieByYear", { master: "Manuel" });
});

// http://localhost:3000/consecutiveYearsMoviesQueryParams?year=2000&genres=Drama,Action
// http://localhost:3000/consecutiveYearsMoviesQueryParams?genres=Drama,Action&year=2000
// where the query string is ?year=2000&genres=Drama,Action
// req.query contains {year: 2000, genres: "Drama,Action"}
app.get("/consecutiveYearsMoviesQueryParams", (req, res) => {
  let { year: mainYear, genres } = req.query;
  let genresAsArray = genres.split(",");
  let projectionParams = { title: 1, year: 1, genre: 1 };
  let params = { $and: [{ year: mainYear }, { genre: { $in: genresAsArray } }] };

  Movies.find(params)
    .select(projectionParams)
    .then(mainYearPayload => res.json(mainYearPayload));
});

// remember, here genres is optional given the ?
// example URL : http://localhost:3000/consecutiveYearsMovies/1996/Action,Drama
app.get("/consecutiveYearsMovies/:year/:genres?", (req, res) => {
  // here we need to cast the year to Number given that all req.params will be assumed as strings
  let mainYear = +req.params.year;
  // here we infer the next year
  let nextYear = mainYear + 1;
  // we will use this variable to hold the payload in this scope, so it can be accessed from any inner scope
  let mainYearMovies;
  //  common projection params for each promise
  let projectionParams = { title: 1, year: 1, genre: 1 };
  // here we create an array with all the params sent as genres
  let genresAsArray = req.params.genres.split(",");
  // here we create a common filter object for both promises
  let params = { $and: [{ year: mainYear }, { genre: { $in: genresAsArray } }] };

  // here we find the main year
  Movies.find(params)
    .select(projectionParams)
    // asynchronously we receive all the main year movies
    .then(mainYearPayload => {
      // here we copy the payload into the variable available in the outer scope
      mainYearMovies = mainYearPayload;

      // here we reuse the params completely, only changing the mainYear with the nextYear
      params.$and[0].year = nextYear;

      // here we prepare the next promise and return it so we can chain the next then() statement
      return Movies.find(params).select(projectionParams);
    })
    .then(nextYearPayload => {
      // here we return to the client the resulting arrays of movies for both years
      res.json({
        mainYearMovies,
        nextYearPayload
      });
    })
    .catch(error => res.json(error));
});

app.listen(3000);
