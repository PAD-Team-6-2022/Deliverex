console.log('service worker loaded');

const publicVapidKey = 'BLxVvjwWFJLXU0nqPOxRB_cZZiDMMTeD6c-7gTDvatl3gak50_jM9AhpWMwmn3sOkd8Ga-xhnzhq-zYpVqueOnI';

//Converts an base64 string to an unsigned 8 bit array
//Source: https://github.com/bradtraversy/node_push_notifications/blob/master/client/client.js
function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");

    const rawData = self.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

//Array that stores incoming order request notifications
//to keep track of them across events
const activeRequestNotifications = [];

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
})

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