class Parqueadero {

  constructor() {
    this.db = firebase.firestore();
  }

  async crearEntrada(
    uid,
    idParqueadero,
    nombreCliente,
    placa,
    celularCliente,
    observacion,
    imagenLink) {
    try {
      const refDoc = await this.db
        .collection('entradas')
        .add({
          uid: uid,
          idparqueadero: idParqueadero,
          nombrecliente: nombreCliente,
          celularcliente: celularCliente,
          placa: placa,
          observacion: observacion,
          imagenlink: imagenLink,
          fecha: firebase.firestore.FieldValue.serverTimestamp()
        })

      await this.db
        .collection('parqueaderos')
        .doc(idParqueadero)
        .update({
          "libre": false
        });

      console.log(`Id de la entrada => ${refDoc.id}`);
      return refDoc.id

    } catch (error) {
      console.error(`Error creando la entrada => ${error}`)
    }
  }

  async crearSalida(
    idEntrada,
    fechaSalida,
    costo,
    idParqueadero) {
    try {

      await this.db
        .collection('entradas')
        .doc(idEntrada)
        .set({
          salida: {
            costo: costo,
            fechaSalida: fechaSalida
          }
        }, { merge: true });

      await this.db
        .collection('parqueaderos')
        .doc(idParqueadero)
        .update({
          "libre": true
        });

      return true

    } catch (error) {
      console.error(`Error creando la salida => ${error}`)
    }
  }

  async consultarTodosParquedaderos(fntCallBack) {
    try {
      await this.db
        .collection('parqueaderos')
        .orderBy('nombre', 'asc')
        .onSnapshot((parqueaderos) => {

          $('#parqueaderos').empty();
          console.log("limpia");

          parqueaderos.forEach(async (parqueadero) => {

            const parqueaderoData = parqueadero.data();

            const entradasParqueadero = await this.db
              .collection('entradas')
              .where('idparqueadero', '==', parqueadero.id)
              .orderBy('fecha', 'desc')
              .limit(1)
              .get();

            if (entradasParqueadero.empty || parqueaderoData.libre === true) {
              fntCallBack({
                nombreParqueadero: parqueaderoData.nombre,
                libre: parqueaderoData.libre,
                id: parqueadero.id
              });
            } else {
              const entradaParqueadero = entradasParqueadero.docs[0].data();
              fntCallBack({
                nombreParqueadero: parqueaderoData.nombre,
                libre: parqueaderoData.libre,
                nombreCliente: entradaParqueadero.nombrecliente,
                celularCliente: entradaParqueadero.celularcliente,
                placa: entradaParqueadero.placa,
                observacion: entradaParqueadero.observacion,
                imagenLink: entradaParqueadero.imagenlink,
                fecha: entradaParqueadero.fecha,
                id: parqueadero.id,
                idEntrada: entradasParqueadero.docs[0].id
              });
            }

          });

        });

    } catch (error) {
      console.error(`Error consultando todos los parqueaderos => ${error}`)
    }
  }

  async consultarParqueaderoLibres(fntCallBack) {
    try {
      await this.db
        .collection('parqueaderos')
        .orderBy('nombre', 'asc')
        .where('libre', '==', true)
        .onSnapshot((parqueaderos) => {

          $('#parqueaderos').empty();

          parqueaderos.forEach((parqueadero) => {
            const parqueaderoData = parqueadero.data();
            fntCallBack({
              nombreParqueadero: parqueaderoData.nombre,
              libre: parqueaderoData.libre,
              id: parqueadero.id
            });

          });

        });

    } catch (error) {
      console.error(`Error consultando todos los parqueaderos libres => ${error}`)
    }
  }

  subirImagenPost(file, uid) {
    const refStorage = firebase.storage().ref(`imgsParqueaderos/${uid}/${file.name}`);
    const task = refStorage.put(file)

    task.on(
      'state_changed',
      snapshot => {
        const porcentaje = snapshot.bytesTransferred / snapshot.totalBytes * 100
        $('.determinate').attr('style', `width: ${porcentaje}%`)
      },
      err => {
        Materialize.toast(`Error subiendo archivo = > ${err.message}`, 4000)
      },
      async () => {
        try {
          const url = await task.snapshot.ref
            .getDownloadURL();

          console.log(url)
          sessionStorage.setItem('imgNewEntrada', url)

        } catch (err) {
          console.error(err);
          Materialize.toast(`Error obteniendo downloadURL = > ${err}`, 4000)
        }
      }
    )
  }


}
