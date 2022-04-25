// toggle the voting modal
document.querySelectorAll('[data-modal-toggle="voting-modal"]').forEach(toggle => {
    toggle.onclick = () => {
        document.querySelector("#voting-modal").classList.toggle("hidden");
    }
})

document.querySelector("#voting-form").onsubmit = (e) => {
    e.preventDefault();

    const data = new FormData(e.target);
    const values = {}
    
    // store data in values
    for(let pair of data.entries()) {
        values[pair[0]] = pair[1];
    }

    // send form

    document.querySelector("#voting-modal").classList.toggle("hidden");

    // empty form
    e.target.reset()
}