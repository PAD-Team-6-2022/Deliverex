console.log('service worker loaded');

//Array that stores incoming order request notifications
//to keep track of them across events
const activeRequestNotifications = [];

//TODO: Try to find a use for the (below) activate event later
/*
self.addEventListener('activate', () => {
    self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    }).then(async (subscriptionObject) => {
        await fetch('/api/ORS/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(subscriptionObject)
        }).then((response) => response.json())
            .then((data) => {
                console.log('Response data: ' + data)
            }).catch((err) => console.error(`Fetch error: ${err}`));

    }).catch((err) => console.error(`Error: could not
         subscribe service worker. Error message: ${err}`));
})*/

self.addEventListener('push', async (event) => {
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
        icon: '../../../../favicon.ico'
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
            //Have the notification close itself after a set amount of seconds
            if(data.type === 'deliveryRequest'){
                self.registration.getNotifications().then((notifications) => {
                    const newNotification = notifications[notifications.length-1];

                    activeRequestNotifications.push(newNotification);
                    const order_id = newNotification.data.order.id;

                    setTimeout(() => {
                        activeRequestNotifications.forEach((not, index) => {
                            if(not.data.order.id === order_id){
                                console.log('Info about the notification that is being cronned:');
                                console.log(not);
                                if(!not.data.userHasInteracted)
                                    submitAnswerToServer('denied', not.data.eventData);
                                activeRequestNotifications.splice(index, 1);
                                not.close();
                            }
                        })
                    }, data.expirationTime*1000);
                });
            }
        }).catch((err) => console.error(
        `Could not show notification: ${err}`));
});

self.addEventListener('notificationclick',  async (event) => {
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


    event.waitUntil(submitAnswerToServer(action, notification.data.eventData)
        .catch((err) => console.error(`Error: could not submit request
         answer to server. Errormessage: ${err}`)));

    //TODO: Change this to the live-deployed domain link
    if(action !== 'denied')
        clients.openWindow('http://145.109.136.58:3000/dashboard/overview')
            .catch((err) => console.error(`Could not open new window: ${err}`));

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