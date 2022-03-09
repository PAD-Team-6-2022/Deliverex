/**
 * Toggle the menu in the navigation bar
 */
const navToggle = () => {
    const menu = document.querySelector('#mobile-menu');
    const nav = document.querySelector('#nav');
    if(menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
        nav.classList.add('h-auto');
        nav.classList.add('md:h-16');
        
    } else {
        menu.classList.add('hidden');
        nav.classList.remove('h-auto');
    }
}

/**
 * Event listener for menu toggle
 */
document.querySelector('#menu-toggle').onclick = () => {
    navToggle();
};