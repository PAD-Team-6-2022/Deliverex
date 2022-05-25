import '../../../password_show.js';
import '../../../tooltip.js';

const passwordSection = document.getElementById('password-section');

document.querySelectorAll("input[type='radio']").forEach((radioInput) => {
    radioInput.addEventListener('change', () => {
        const value = radioInput.value;

        passwordSection.classList.toggle('hidden', value !== 'create');
    });
});
