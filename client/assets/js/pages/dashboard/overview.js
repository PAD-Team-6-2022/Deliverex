import('./partials/navbar.js');

let nextLink = document.getElementById("nextLink")
let prevLink = document.getElementById("prevLink")

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let page = urlParams.get('page')

if (page == null) {
    page = 1;
}

nextLink.href = "?page=" + (parseInt(page) + 1);

if (page > 1) {
    prevLink.href = "?page=" + (parseInt(page) - 1)
}