const orderId = parseInt(document.querySelector("[data-order]").getAttribute("data-order")); // the id of the order

// add toggle to all modal toggles
document.querySelectorAll('[data-modal-toggle="voting-modal"]').forEach(toggle => votingModalToggle(toggle));

document.querySelectorAll("[data-goal]").forEach(async (goal) => {
    const goalId = parseInt(goal.getAttribute("data-goal"));

    goal.querySelector("button").onclick = () => {
        postVote(orderId, goalId);
    }
})

// collect all modal form values and post form
document.querySelector("#voting-form").onsubmit = async (e) => {
    e.preventDefault();

    const data = new FormData(e.target);
    const values = {}
    
    // store data in values
    for(let pair of data.entries()) {
        values[pair[0]] = pair[1];
    }

    // send form
    await postGoal(values);
}

/**
 * toggle the voting modal
 * 
 * @author Dylan Weijgertze
 * @param {Element} toggle 
 */
const votingModalToggle = (toggle) => {
    toggle.onclick = () => {
        document.querySelector("#voting-modal").classList.toggle("hidden");
    }
}

/**
 * Post vote for the given goal from the given order
 * 
 * @author Dylan Weijgertze
 * @param {number} orderId The id of the order from which is voted
 * @param {number} goalId the id of the goal that's voted on
 */
const postVote = async (orderId, goalId) => {
    await fetch(`/api/votes`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({orderId, goalId}),
    }).then((response) => {
        if (response.status === 200) {
            window.location.reload();
        }
    }).catch((error) => {
        console.error(`Fetch error: could not fulfill post request
         to create order. Error message: ${error}`);
    });
}

/**
 * Send the given values to the API to be saved as a new goal
 * 
 * @author Dylan Weijgertze
 * @param {Object} values all the values from the form
 */
const postGoal = async (values) => {
    await fetch(`/api/goals`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
    }).then((response) => {
        if (response.status === 200) {
            window.location.reload();
        }
    }).catch((error) => {
        console.error(`Fetch error: could not fulfill post request
         to create order. Error message: ${error}`);
    });
}
