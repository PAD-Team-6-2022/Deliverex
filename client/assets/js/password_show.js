document.querySelectorAll('[data-password-show-input]').forEach((input) => {
    const wrapper = document.createElement('div');

    // Set a relation position on the wrapper
    // to contain the icon within the input
    wrapper.classList.add('relative');

    // Wrapping around the toggle
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    // Creating the icon wrapper with the necessary
    // styling to center the icon properly
    const iconWrapper = document.createElement('div');

    iconWrapper.classList.add(
        'flex',
        'items-center',
        'absolute',
        'right-0',
        'top-0',
        'bottom-0',
        'h-full',
        'px-4',
    );

    // Basically an open eye icon
    const inactiveHTML = `
        <svg viewBox="-2 -6 24 24" fill="currentColor" class="h-6 w-6">
            <path d="M18 6c0-1.81-3.76-3.985-8.007-4C5.775 1.985 2 4.178 2 6c0 1.825 3.754 4.006 7.997 4C14.252 9.994 18 7.82 18 6zm-8 6c-5.042.007-10-2.686-10-6S4.984-.017 10 0c5.016.017 10 2.686 10 6s-4.958 5.993-10 6zm0-2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
        </svg>
    `;

    // The same as above but with a strikethrough
    const activeHTML = `
        <svg viewBox="-2 -2 24 24" fill="currentColor" class="h-6 w-6">
            <path d="M15.398 7.23l1.472-1.472C18.749 6.842 20 8.34 20 10c0 3.314-4.958 5.993-10 6a14.734 14.734 0 0 1-3.053-.32l1.747-1.746c.426.044.862.067 1.303.066h.002c-.415 0-.815-.063-1.191-.18l1.981-1.982c.47-.202.847-.579 1.05-1.049l1.98-1.981A4 4 0 0 1 10.022 14C14.267 13.985 18 11.816 18 10c0-.943-1.022-1.986-2.602-2.77zm-9.302 3.645A4 4 0 0 1 9.993 6C5.775 5.985 2 8.178 2 10c0 .896.904 1.877 2.327 2.644L2.869 14.1C1.134 13.028 0 11.585 0 10c0-3.314 4.984-6.017 10-6 .914.003 1.827.094 2.709.262l-1.777 1.776c-.29-.022-.584-.035-.88-.038.282.004.557.037.823.096l-4.78 4.779zM19.092.707a1 1 0 0 1 0 1.414l-16.97 16.97a1 1 0 1 1-1.415-1.413L17.677.708a1 1 0 0 1 1.415 0z"></path>
        </svg>
    `;

    // Adding a click event listener to the icon wrapper
    // to toggle the visibility of the input depending
    // on the current state of the input (active/inactive)
    iconWrapper.addEventListener('click', () => {
        const active = input.type === 'text';

        if (active) {
            input.type = 'password';

            // Change the icon to inactive
            iconWrapper.innerHTML = inactiveHTML;
        } else {
            input.type = 'text';

            // Change the icon to active
            iconWrapper.innerHTML = activeHTML;
        }
    });

    // Set the default icon to inactive
    iconWrapper.innerHTML = inactiveHTML;

    // Add the icon to the wrapper
    wrapper.appendChild(iconWrapper);
});
