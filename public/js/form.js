// old skool: document.querySelector("input[type=submit]").onclick = function(e) {
document.querySelector("input[type=submit]").onclick = e => {
  e.preventDefault();
  let year = document.querySelector("input[name=year]").value;
  let genres = document.querySelector("input[name=genres]").value;

  // /consecutiveYearsMovies/:year/:genres?
  location.href = `/consecutiveYearsMovies/${year}/${genres}`;
};
