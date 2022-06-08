import '../../../ordering.js';
import '../../../pagination.js';
import '../../../tooltip.js';
import '../../../toaster.js';
import { openModal } from '../../../modal.js';

document.querySelectorAll('[data-user-id]').forEach((order) => {
    const id = order.getAttribute('data-user-id');
    const username = order.getAttribute('data-user-username');

    order.querySelector('[data-user-delete]').addEventListener('click', async (event) => {
        openModal('delete-user', {
            actions: {
                confirm: async () => {
                    await fetch(`/api/users/${id}`, {
                        method: 'DELETE',
                    });
                    window.location.reload();
                },
            },
        });

        event.stopPropagation();
    });

    order.querySelector('[data-user-edit]').addEventListener('click', async (event) => {
        window.location.href = `/dashboard/users/${username}/edit`;
        event.stopPropagation();
    });
});
