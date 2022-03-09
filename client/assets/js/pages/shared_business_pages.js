/**
 * Toggle the menu in the navigation bar
 */
const navToggle = () => {
    const menu = document.querySelector('#mobile-menu');

    if(menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
    } else {
        menu.classList.add('hidden');
    }
}