import '../../../tooltip.js';

const id = document
    .querySelector('[data-format-id]')
    .getAttribute('data-format-id');
//hier pak je de values van html en stuur je naar de database
document
    .querySelector('#saveFormat')
    .addEventListener('click', async (event) => {
        const formatname2 = document.getElementById('nameformat2').value;
        const height = document.getElementById('height2').value;
        const width = document.getElementById('width2').value;
        const length = document.getElementById('length2').value;
        //hierin kijkt hij of er lege inputvelden zijn.
        if (formatname2 === '') {
            document.getElementById('error6').innerHTML =
                'Format name cant be empty';
            return false;
        }
        if (length === '') {
            document.getElementById('error7').innerHTML =
                'Length cant be empty';
            return false;
        }
        if (width === '') {
            document.getElementById('error8').innerHTML = 'Width cant be empty';
            return false;
        }

        if (height === '') {
            document.getElementById('error9').innerHTML =
                'Height cant be empty';
            return false;
        }
        const values = {
            width: document.querySelector('#width2').value,
            height: document.querySelector('#height2').value,
            length: document.querySelector('#length2').value,
            nameformat: document.querySelector('#nameformat2').value,
        };
        //hier fetch je existing data from the database
        await fetch(`/api/settings/editFormat/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        })
            .then((response) => {
                if (response.status === 200) {
                    window.location.href = '/dashboard/settings';
                }
            })
            .catch((error) => {
                console.error(`Fetch error: could not fulfill post request
             to update order. Errormessage: ${error}`);
            });
    });
