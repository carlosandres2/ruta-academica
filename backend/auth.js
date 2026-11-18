const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            mensaje: 'Se requiere autenticación'
        });
    }

    const token = authHeader.split(' ')[1];

    try {
       if (!process.env.JWT_SECRET) {
    return res.status(500).json({
        mensaje: 'Error de configuración del servidor'
    });
}

const decoded = jwt.verify(token, process.env.JWT_SECRET);

if (!Number.isSafeInteger(decoded.id) || decoded.id <= 0) {
    return res.status(401).json({
        mensaje: 'Token inválido o expirado'
    });
}

req.user = {
    id: decoded.id
};

        next();
    } catch (error) {
        return res.status(401).json({
            mensaje: 'Token inválido o expirado'
        });
    }
}

module.exports = verificarToken;
