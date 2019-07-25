$(() => {

    // Adicionar el service worker
    navigator.serviceWorker
        .register('notificacionesparking-sw.js')
        .then(registro => {
            console.log('Service Worker registrado')
            firebase.messaging().useServiceWorker(registro)
        })
        .catch(error =>
            console.error(`Error al registrar el Service Worker : ${error}`)
        )

    const messaging = firebase.messaging()

    // credenciales web
    messaging.usePublicVapidKey(
        'BEpeOB8sxEPuVfG4pYz8-BRhR5inzRt35w3qBwzb4B2kqEeM_CwpNtu-kKFo3O2qTm7nmqGy2jgfj_OZePvwpJo'
    )

    // Solicitar permisos para las notificaciones
    messaging
        .requestPermission()
        .then(() => {
            console.log('permiso otorgado')
            return messaging.getToken()
        })
        .then(token => {
            console.log('token')
            console.log(token);
            const db = firebase.firestore();
            db.collection('tokens')
                .add({
                    token: token
                })
                .catch(err => {
                    console.error(`Error insertando el token en la BD => ${err}`)
                })
        })
        .catch(function (err) {
            console.error(`No se dio el permiso para la notificación => ${err}`)
        })

    // Recibir las notificaciones cuando el usuario esta foreground
    messaging.onMessage(payload => {
        Materialize.toast(
            `Parqueadero disponible el ${payload.data.nombreparqueadero}`,
            6000
        )
    })

    // Se obtiene el token cuando este cambia
    messaging.onTokenRefresh(() => {
        messaging
            .getToken()
            .then(refreshedToken => {
                console.log('Token refreshed.')
                const db = firebase.firestore();
                db.collection('tokens')
                    .add({
                        token: token
                    })
                    .catch(err => {
                        console.error(`Error al actualizar el token a la BD => ${err}`)
                    })
            })
            .catch(err => {
                console.log(`No es posible recuperar el token actualizado => ${err}`)
            })
    })

})