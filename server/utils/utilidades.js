const crearMensaje = (nombre, asunto, data) => {
    return {
        nombre,
        asunto,
        data,
        fecha: new Date().getTime()
    }
}

module.exports = {
    crearMensaje
}