const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios.class');
const { crearMensaje } = require('../utils/utilidades');

const usuarios = new Usuarios();

io.on('connection', (client) => {
    client.on('entrarChat', (usuario) => {
        if (!usuario.nombre || !usuario.sala) {
            client.emit('recibirMensaje', {
                ok: false,
                err: {
                    details: 'Información insuficiente. Se necesita tanto el nombre como la sala.'
                }
            });

            return;
        }

        client.join(usuario.sala);

        usuarios.agregarPersona(client.id, usuario.nombre, usuario.sala);

        client.broadcast.to(usuario.sala).emit('recibirMensaje',
            crearMensaje('Servidor', 'Conexión', `${usuario.nombre} se conectó al chat`));

        emitirListaDeUsuarios(client, usuario.sala);

        client.emit('recibirMensaje',
            crearMensaje('Servidor', 'Usuarios conectados', usuarios.getPersonasPorSala(usuario.sala)));
    });

    client.on('disconnect', () => {
        let personaBorrada = usuarios.borrarPersona(client.id);

        client.broadcast.to(personaBorrada.sala).emit('recibirMensaje',
            crearMensaje('Servidor', 'Desconexión', `${personaBorrada.nombre} abandonó el chat`));

        emitirListaDeUsuarios(client, personaBorrada.sala);
    });

    client.on('mensajeSala', (data) => {
        let persona = usuarios.getPersona(client.id);
        client.broadcast.to(persona.sala).emit('recibirMensaje',
            crearMensaje(persona.nombre, 'Mensaje usuario', data.mensaje));
        client.emit('mensajeSala', {
            nombre: persona.nombre,
            mensaje: data.mensaje,
            fecha: data.fecha
        });
    });

    client.on('mensajeTodos', (data) => {
        let persona = usuarios.getPersona(client.id);
        client.broadcast.emit('recibirMensaje',
            crearMensaje(persona.nombre, 'Mensaje usuario', data.mensaje));
    });

    client.on('mensajePrivado', (data) => {
        let persona = usuarios.getPersona(client.id);
        client.broadcast.to(data.remitente).emit('recibirMensaje',
            crearMensaje(persona.nombre, 'Mensaje privado', data.mensaje));
    });
});

function emitirListaDeUsuarios(client, sala) {
    client.broadcast.to(sala).emit('recibirMensaje',
        crearMensaje('Servidor', 'Usuarios conectados', usuarios.getPersonasPorSala(sala)));
}