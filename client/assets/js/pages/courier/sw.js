console.log('service worker loaded');

self.addEventListener('push', (event) => {
    console.log('received a push! Event:');
    console.log(event);

    console.log(event.data.json());

    const data = event.data.json();

    console.log('Event data:')
    console.log(event.data.json());

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
            console.log('succeeded in showing the notification!')
        }).catch((err) => console.error(
        `Could not show notification: ${err}`));

    //Have the notification close itself after a set amount of seconds
    if(data.type === 'deliveryRequest')
    self.registration.getNotifications().then((notifications) => {
        const currentNotification = notifications[notifications.length-1];
        setTimeout(() => {
            if(!currentNotification.data.userHasInteracted)
                submitAnswerToServer('denied', currentNotification.data.eventData);
            currentNotification.close();
        }, data.expirationTime*1000);
    });

})

//Als je 'accept' clickt, of de notification aanklikt, terwijl de 60 seconden al
//verstreken zijn, laat dan een nieuwe notification zien die de gebruiker informeert
//dat het niet kan.

//"Click or press 'accept' to accept this order."

self.addEventListener('notificationclick', (event) => {
    const notification = event.notification;
    notification.data.userHasInteracted = true;

    if(notification.data.type !== 'deliveryRequest')
        return;

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
    notification.data.userHasInteracted = true;

    if(notification.data.type !== 'deliveryRequest')
        return;

    submitAnswerToServer('denied', notification.data.eventData).then(() => {
        //Do nothing
    })

})

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

        //TODO: Hier de reactie programmeren van wat er gedaan moet
        // worden indien de tijd verstreken is! Denk er aan om te voorkomen
        // dat de client geen window opent als hij een 'forbidden' status
        // code terugkrijgt!

    }).catch((err) => console.error(`Fetch error: could not
     submit the response to a spontaneous delivery. Error message: ${err}`));
}