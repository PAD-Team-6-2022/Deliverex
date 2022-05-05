console.log('service worker loaded');

//Array that stores incoming order request notifications
//to keep track of them across events
const activeRequestNotifications = [];

self.addEventListener('push', (event) => {
    const data = event.data.json();

    let notificationOptions = {
        body: data.body,
        vibrate: [100, 50, 100],
        timestamp: new Date().getTime(),
        data: {
            type: data.type,
            userHasInteracted: false,
            eventData: data
        },
        //icon: 'iets.png'
    };

    if(data.type === 'deliveryRequest'){
        notificationOptions.data.order = data.order;
        notificationOptions.actions = [
            {action: 'accepted', title: 'Accept'/*, icon: 'example.png'*/},
            {action: 'denied', title: 'Deny'/*, icon: 'example.png'*/}
        ];
    }

    self.registration.showNotification(data.title, notificationOptions)
        .then(() => {
            //do nothing
        }).catch((err) => console.error(
        `Could not show notification: ${err}`));

    //Have the notification close itself after a set amount of seconds
    if(data.type === 'deliveryRequest'){
        self.registration.getNotifications().then((notifications) => {
            const newNotification = notifications[notifications.length-1];

            activeRequestNotifications.push(newNotification);
            const index = activeRequestNotifications.length-1;

            setTimeout(() => {
                const currentNotification = activeRequestNotifications[index];
                if(!currentNotification.data.userHasInteracted)
                    submitAnswerToServer('denied', currentNotification.data.eventData);
                activeRequestNotifications.splice(index, 1);
                currentNotification.close();
            }, data.expirationTime*1000);
        });
    }
});

self.addEventListener('notificationclick',  (event) => {
    const notification = event.notification;

    if(notification.data.type !== 'deliveryRequest')
        return;

    console.log('CLICKED THE ORDER REQUEST!');

    //Signify to the global object the user has interacted with this notification
    activeRequestNotifications.forEach((activeNotification, index) => {
        if(activeNotification.data.order.id === notification.data.order.id){
            activeNotification.data.userHasInteracted = true;
        }
    });

    let action = event.action;

    //The request is also considered 'accepted' in case the user
    // didn't click on any specific action (but still clicked)
    if(action.length === 0)
        action = 'accepted';

    //TODO: Change this to the live-deployed domain link
    submitAnswerToServer(action, notification.data.eventData).then(() => {
        if(action !== denied)
            clients.openWindow('http://localhost:3000/dashboard/overview');
    });

    notification.close();
})

self.addEventListener('notificationclose', (event) => {

    const notification = event.notification;

    if(notification.data.type !== 'deliveryRequest')
        return;

    //Signify to the global object the user has interacted with this notification
    activeRequestNotifications.forEach((activeNotification, index) => {
        if(activeNotification.data.order.id === notification.data.order.id){
            activeNotification.data.userHasInteracted = true;
        }
    });

    submitAnswerToServer('denied', notification.data.eventData).then(() => {
        //Do nothing
    });
});

const submitAnswerToServer = (userResponse, orderRequestData) => {
    return fetch('/api/ORS/submitSpontaneousDeliveryResponse', {
        method: 'PUT',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify({answer: userResponse, data: orderRequestData})
    }).then((response) => {
        if(response.status !== 200)
            console.error(`The server responded with an
             unexpected status code: ${response.status}`);
    }).catch((err) => console.error(`Fetch error: could not
     submit the response to a spontaneous delivery. Error message: ${err}`));
}