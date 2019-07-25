importScripts('https://www.gstatic.com/firebasejs/6.3.1/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/5.5.9/firebase-messaging.js')

firebase.initializeApp({
    projectId: "parking-f75e3",
    messagingSenderId: "291313876374"
});

const messaging = firebase.messaging();

// Función que se ejecuta en background para recibir las notificaciones
messaging.setBackgroundMessageHandler(payload => {
    const tituloNotificacion = "PARQUEADERO DISPONIBLE";
    const opcionesNotificacion = {
        body: `El parqueadero ${payload.data.nombreparqueadero}`,
        icon: 'icons/icon.png',
        image: 'imagenes/logo.png',
        actions: [
            {
                title: 'Ver',
                action: 'ver',
                icon: 'icons/icon.png'
            }
        ]
    };

    return self.registration.showNotification(
        tituloNotificacion,
        opcionesNotificacion
    )
})

self.addEventListener('notificationclick', event => {
    if (event.action == 'ver') {
        //clients.openWindow('https://blogeekplatzi.firebaseapp.com/posts')
    }
})