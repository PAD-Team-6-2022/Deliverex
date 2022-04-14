import { openModal } from "../../modal.js";
// get all form inputs
const formatInputs = document
  .querySelector("#formatForm")
  .querySelectorAll("input");

/**
 * Handle the format submit button and try to save the inputs
 */
document
  .getElementById("saveFormat")
  .addEventListener("click", async (event) => {
    event.preventDefault();

    const values = {};
      const formatname1= document.getElementById("name").value
      const height= document.getElementById("height").value
      const width= document.getElementById("width").value
      const length= document.getElementById("length").value


      if (formatname1===""){
          document.getElementById("error2").innerHTML="Format name cant be empty"
          return false;
      }
      if (length===""){
          document.getElementById("error3").innerHTML="Length cant be empty"
          return false;
      }
      if (width===""){
          document.getElementById("error4").innerHTML="Width cant be empty"
          return false;
      }

      if (height===""){
          document.getElementById("error5").innerHTML="Height cant be empty"
          return false;
      }
      if (height===""){
          document.getElementById("error5").innerHTML="Height cant be empty"
          return false;
      }



      // add all input values and names to the values object
    formatInputs.forEach((input) => {
      values[input.name] = input.value;
    });
    // needs validation
    await fetch(`/api/orders/setting`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    })
      .then((response) => {
        if (response.status === 200) {
          location.reload();
        }
      })
      .catch((error) => {
        console.error(`Fetch error: could not fulfill post request
         to update order assignment. Errormessage: ${error}`);
      });
  });

document.querySelectorAll("[data-format-code]").forEach((format) => {
  const id = format.getAttribute("data-format-code");


  format
    .querySelector("[data-format-delete]")
    .addEventListener("click", async (event) => {
      openModal("delete-format", {
        actions: {
          confirm: async () => {
            await fetch(`/api/orders/settings/${id}`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            });
            window.location.reload();
          },
        },
      });
    });
});

var slider = document.getElementById("rangeDoel");
var output = document.getElementById("rangeDoelInfo");
output.innerHTML = slider.value + "%";

slider.oninput = function () {
  output.innerHTML = this.value + "%";
};
