const navToggle = () => {
    const menu = document.querySelector('#mobile-menu');
    console.log(menu);
    if(menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
    } else {
        menu.classList.add('hidden');
    }
}