var socket = io();
var params = new URLSearchParams(window.location.search);

if (!params.has('nombre') || !params.has('sala')) {
    window.location = 'index.html';
    alert('El nombre es necesario.');
    throw new Error('El nombre y sala son necesarios.');
} else if (params.get('nombre') === 'Servidor') {
    window.location = 'index.html';
    alert('Nombre "Servidor" no válido');
    throw new Error('Nombre "Servidor" no válido');
}

var usuario = {
    nombre: params.get('nombre'),
    sala: params.get('sala')
};

socket.on('connect', function () {
    console.log('Conectado al servidor');

    socket.emit('entrarChat', usuario);
});

socket.on('disconnect', function() {
    console.log('Perdimos conexión con el servidor');
});

// Escuchar información
socket.on('recibirMensaje', function (mensaje) {
    console.log(mensaje);
    if (mensaje.asunto === 'Usuarios conectados')
        renderizacionUsuarios(mensaje.data);
    if (mensaje.asunto === 'Mensaje usuario' || mensajeServidorValido(mensaje)) {
        renderizarMensajes({ nombre: mensaje.nombre, mensaje: mensaje.data, fecha: mensaje.fecha }, false);
        scrollBottom();
    }
});

function mensajeServidorValido(mensaje) {
    return mensaje.asunto === 'Conexión' || mensaje.asunto === 'Desconexión';
}