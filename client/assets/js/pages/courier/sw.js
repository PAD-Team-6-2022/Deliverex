/**
 *  Sw.js (wherein 'sw' stands for 'serviceworker') is a script that is
 *  ran by a serviceworker instance, which in turn is managed by the
 *  browser. The purpose of the script is to manage and act on push
 *  notification events regardless of whether the user currently has
 *  the website (or even just the browser) opened on his device. This
 *  is what makes the serviceworker ideal for notifications.
 *
 *  Sw.js' main job is to receive and display 'online' notifications
 *  and 'order delivery request' notifications to the user, and in turn
 *  communicate the users' answer back to the server.
 *
 * @Author: Thomas Linssen
 */

//Array that stores incoming order request notifications
//to keep track of them across events
const activeRequestNotifications = [];

/**
 * Listens for a 'push' message from the server, interprets it, and
 * displays it as a notification based on the data sent.
 */
self.addEventListener('push', async (event) => {

    //First, extract the data
    const pushData = event.data.json();

    //Declare and define a default object that counts as a notification
    let notificationOptions = {
        body: pushData.body,
        vibrate: [100, 50, 100],
        timestamp: new Date().getTime(),
        data: {
            type: pushData.type,
            userHasInteracted: false,
            eventData: pushData
        },
        icon: '../../../../favicon.ico'
    };

    //If the pushMessage was meant as a delivery request, add
    // some extra relevant data to the notificationOptions object
    if (pushData.type === 'deliveryRequest') {
        notificationOptions.data.order = pushData.order;
        notificationOptions.actions = [
            {action: 'accepted', title: 'Accept'},
            {action: 'denied', title: 'Deny'}
        ];
    }

    //Show the notification with the title and all the defined options
    self.registration.showNotification(pushData.title, notificationOptions)
        .then(() => {

            //Have the notification close itself after a set amount of seconds
            if (pushData.type === 'deliveryRequest') {
                self.registration.getNotifications().then((notifications) => {

                    //Get the last taken notification (the one that was just shown)
                    const newNotification = notifications[notifications.length - 1];

                    //Push it to the list of active notifications
                    activeRequestNotifications.push(newNotification);

                    //Take its order ID
                    const order_id = newNotification.data.order.id;

                    //Set a timeout that will automatically send out a 'deny'
                    // answer to the server in case the user has not reacted
                    // after a set amount of time
                    setTimeout(() => {
                        activeRequestNotifications
                            .forEach((notification, index) => {
                                if (notification.data.order.id === order_id) {
                                    if (!notification.data.userHasInteracted)
                                        submitAnswerToServer('denied',
                                            notification.data.eventData);

                                    activeRequestNotifications.splice(index, 1);
                                    notification.close();
                                }
                            })
                    }, pushData.expirationTime * 1000);
                });
            }
        }).catch((err) => console.error(
        `Could not show notification: ${err}`));
});

/**
 * Listens for if the user clicks on a certain notification that was
 * shown by this serviceworker. The event is trigged specifically if
 * the user presses on 'accept' or on the notification message itself.
 */
self.addEventListener('notificationclick', async (event) => {

    //First, extract the notification
    const notification = event.notification;

    //In case the user did not click on a delivery request
    // notification, do nothing and return.
    if (notification.data.type !== 'deliveryRequest')
        return;

    //Signify to the global object the user has interacted with this notification
    activeRequestNotifications.forEach((activeNotification) => {
        if (activeNotification.data.order.id === notification.data.order.id)
            activeNotification.data.userHasInteracted = true;
    });

    //Obtain the notification action (defined in the 'push' eventhandler)
    let action = event.action;

    //The request is also considered 'accepted' in case the user
    // didn't click on any specific action (but still clicked)
    if (action.length === 0)
        action = 'accepted';

    //Submit the answer to the server
    event.waitUntil(submitAnswerToServer(action, notification.data.eventData)
        .catch((err) => console.error(`Error: could not submit request
         answer to server. Errormessage: ${err}`)));

    //TODO: Change this to the live-deployed domain link
    //If no 'denied' message was interpreted, open the 'dashboard' window
    if (action !== 'denied')
        clients.openWindow('http://deliverex.herokuapp.com/dashboard/overview')
            .catch((err) => console.error(`Could not open new window: ${err}`));

    //Close the notification
    notification.close();
})

/**
 * Listens for if the user either presses 'deny' on a notification or
 * swipes it away.
 */
self.addEventListener('notificationclose', (event) => {

    //First, extract the notification
    const notification = event.notification;

    //In case the user did not click on a delivery request
    // notification, do nothing and return.
    if (notification.data.type !== 'deliveryRequest')
        return;

    //Signify to the global object the user has interacted with this notification
    activeRequestNotifications.forEach((activeNotification) => {
        if (activeNotification.data.order.id === notification.data.order.id)
            activeNotification.data.userHasInteracted = true;
    });

    //Submit a 'denied' message to the server
    submitAnswerToServer('denied', notification.data.eventData)
        .then(() => {
            //Do nothing
        });
});

/**
 * Submits an answer to a delivery request to the server. This
 * answer can either be 'accepted' or 'denied'.
 *
 * @param userResponse answer message to the server
 * @param orderRequestData the data identifying the order
 * @returns {Promise<T | void>} server response
 */
const submitAnswerToServer = (userResponse, orderRequestData) => {
    return fetch('/api/ors/submitSpontaneousDeliveryResponse', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({answer: userResponse, data: orderRequestData})
    }).then((response) => {
        if (response.status !== 200)
            console.error(`The server responded with an
             unexpected status code: ${response.status}`);
    }).catch((err) => console.error(`Fetch error: could not
     submit the response to a spontaneous delivery. Error message: ${err}`));
}