function renderMovies(allMovies) {
  let moviesContainerDOMEl = document.createElement("ul");
  moviesContainerDOMEl.setAttribute("id", "allmovies");
  document.body.appendChild(moviesContainerDOMEl);

  allMovies.mainYearMovies.forEach(movie => {
    let moviesDOMEl = document.createElement("li");
    moviesDOMEl.className = "movie";

    moviesDOMEl.innerHTML = `${movie.title} - ${movie.year}`;
    document.querySelector("#allmovies").appendChild(moviesDOMEl);
  });
}

// old skool: document.querySelector("input[type=submit]").onclick = function(e) {
document.querySelector("input[type=submit]").onclick = e => {
  e.preventDefault();
  let year = document.querySelector("input[name=year]").value;
  let genres = document.querySelector("input[name=genres]").value;

  // /consecutiveYearsMovies/:year/:genres?
  // uncomment this if you want to navigate to the JSON with you query
  // location.href = `/consecutiveYearsMovies/${year}/${genres}`;

  fetch(`/consecutiveYearsMovies/${year}/${genres}`)
    .then(movies => movies.json())
    .then(movies => renderMovies(movies));
};
