
const bcrypt = require('bcrypt');

const ROUNDS = 12;

async function hashPassword(password) {
    return bcrypt.hash(password, ROUNDS);
}

async function verificarYActualizarPassword(pool, usuario, passwordIngresada) {
    const almacenada = usuario.password;

    if (!almacenada) {
        return false;
    }

    const esHashBcrypt = /^\$2[aby]\$/.test(almacenada);

    if (esHashBcrypt) {
        return bcrypt.compare(passwordIngresada, almacenada);
    }

    // Compatibilidad temporal con contraseñas antiguas.
    if (almacenada !== passwordIngresada) {
        return false;
    }

    const nuevoHash = await hashPassword(passwordIngresada);

    // Actualización condicional para proteger cambios simultáneos.
    const actualizacion = await pool.query(
        `UPDATE usuarios
         SET password = $1
         WHERE id = $2 AND password = $3`,
        [nuevoHash, usuario.id, almacenada]
    );

    if (actualizacion.rowCount === 1) {
    return true;
}

const usuarioActual = await pool.query(
    'SELECT password FROM usuarios WHERE id = $1',
    [usuario.id]
);

if (usuarioActual.rows.length === 0) {
    return false;
}

const hashActual = usuarioActual.rows[0].password;

if (!hashActual || !/^\$2[aby]\$/.test(hashActual)) {
    return false;
}

return bcrypt.compare(passwordIngresada, hashActual);
}

module.exports = {
    hashPassword,
    verificarYActualizarPassword
};
