const express = require("express");
const app = express();
const hbs = require("hbs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Movies = require("./models/Movies");

app.set("views", __dirname + "/views");
// ey javi! static resources here :) :)
app.set("view engine", "hbs");
// app.use(hbs);
app.use(express.static("public"));
// you have to import and use this middleware if you want express to understand
// data sent via POST
app.use(bodyParser.urlencoded({ extended: true }));

// mongoose has to connect to the DB where your data is stored.
// Here the DB name is "movies" (found in "mongodb://localhost/movies")
mongoose
  .connect("mongodb://localhost/movies", { useNewUrlParser: true })
  .then(x => console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`))
  .catch(err => console.error("Error connecting to mongo", err));

// querystring / queryparams experiment
app.get("/getMovieByYear", (req, res) => {
  res.render("getMovieByYear", { master: "Manuel" });
});

// movie creation -> this renders the movie creation form
app.get("/createMovie", (req, res) => {
  // this renders the movie creation form
  res.render("createMovie", { master: "Molleda" });
});

// this gets all the new movie data sent via the /createMovie endpoint's form and
// passes it forward to mongoose and the db
app.post("/createMovieViaForm", (req, res) => {
  // naive data validation
  if (req.body.title.length === 0) {
    res.status(500).json({ error: true });
    return;
  }

  // here we use the object req.body which contains all the information
  // passed from the form via POST in order to create the movie
  // using the Movies mongoose model
  Movies.create(req.body).then(movieCreated => {
    // Once the movie has been created and added to the DB
    // we output to the client the movie details
    res.json({
      movieCreated: true,
      timestamp: new Date(),
      movieCreated
    });
  });
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
        manu: true,
        mainYearMovies,
        nextYearPayload
      });
    })
    .catch(error => res.json(error));
});

app.listen(3000);
