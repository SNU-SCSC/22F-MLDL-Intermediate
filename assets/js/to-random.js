var searchIndexData = [];
// fetch on page load from the search index
let json_path = '{{ .Site.BaseURL | absURL }}' + '/index.json';

document.getElementById('shortRandom').addEventListener('click', sendToRandomArticle);
document.getElementById('longRandom').addEventListener('click', sendToRandomArticle);

function sendToRandomArticle() {
  console.log("hello");
  fetch(json_path)
  .then((response) => response.json())
  .then((data) => {
    searchIndexData = data;
  })
  .then(() => {
    let randIndex = Math.floor(Math.random() * searchIndexData.length);
    let randArticle = searchIndexData[randIndex]['RelPermalink'];
    window.location.href = randArticle;
  })
  .catch(err => console.log(err));
}
