
const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env.local') });
dotenv.config({ path: path.join(__dirname, '.env') });

const pool = require('./db');
const jwt = require('jsonwebtoken');
const verificarToken = require('./auth');
const {
    hashPassword,
    verificarYActualizarPassword
} = require('./passwords');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ==========================================
// RUTA PRINCIPAL
// ==========================================
app.get('/', (req, res) => {
    res.json({
        mensaje: 'API de Ruta Académica funcionando correctamente',
        estado: 'OK'
    });
});

// ==========================================
// ESTADO DE LA API Y BASE DE DATOS
// ==========================================
app.get('/api/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() AS fecha');

        res.json({
            servicio: 'Ruta Académica API',
            estado: 'saludable',
            base_de_datos: 'conectada',
            fecha: result.rows[0].fecha
        });
    } catch (error) {
        console.error('Error en health:', error);

        res.status(500).json({
            servicio: 'Ruta Académica API',
            estado: 'error',
            base_de_datos: 'desconectada',
            mensaje: 'No fue posible consultar la base de datos'
        });
    }
});

// ==========================================
// OBTENER USUARIO AUTENTICADO
// ==========================================
app.get('/api/usuarios', verificarToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                id,
                nombre,
                correo,
                programa,
                institucion,
                fecha_registro
            FROM usuarios
            WHERE id = $1
        `, [req.user.id]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error al consultar usuario:', error);

        res.status(500).json({
            mensaje: 'Error al consultar el usuario'
        });
    }
});

// ==========================================
// INICIAR SESIÓN
// ==========================================
app.post('/api/login', async (req, res) => {
    try {
        const { correo, password } = req.body;

        if (
            typeof correo !== 'string' ||
            typeof password !== 'string' ||
            !correo.trim() ||
            !password
        ) {
            return res.status(400).json({
                mensaje: 'Correo y contraseña son obligatorios'
            });
        }

        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET no está configurada');

            return res.status(500).json({
                mensaje: 'El servicio de autenticación no está configurado'
            });
        }

        const result = await pool.query(`
            SELECT
                id,
                nombre,
                correo,
                password,
                programa,
                institucion,
                fecha_registro
            FROM usuarios
            WHERE LOWER(correo) = LOWER($1)
        `, [correo.trim()]);

        if (result.rows.length === 0) {
            return res.status(401).json({
                mensaje: 'Correo o contraseña incorrectos'
            });
        }

        const usuario = result.rows[0];

        const esValida = await verificarYActualizarPassword(
            pool,
            usuario,
            password
        );

        if (!esValida) {
            return res.status(401).json({
                mensaje: 'Correo o contraseña incorrectos'
            });
        }

        const token = jwt.sign(
            { id: usuario.id },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        delete usuario.password;

        res.json({
            ...usuario,
            token
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);

        res.status(500).json({
            mensaje: 'Error interno al iniciar sesión'
        });
    }
});

// ==========================================
// CREAR USUARIO (REGISTRO PÚBLICO)
// ==========================================
app.post('/api/usuarios', async (req, res) => {
    try {
        const {
            nombre,
            correo,
            password,
            programa,
            institucion
        } = req.body;

        if (
            typeof nombre !== 'string' ||
            typeof correo !== 'string' ||
            typeof password !== 'string' ||
            !nombre.trim() ||
            !correo.trim() ||
            !password
        ) {
            return res.status(400).json({
                mensaje: 'Nombre, correo y contraseña son obligatorios'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                mensaje: 'La contraseña debe tener al menos 8 caracteres'
            });
        }

        if (Buffer.byteLength(password, 'utf8') > 72) {
            return res.status(400).json({
                mensaje: 'La contraseña no puede superar 72 bytes'
            });
        }

        const passwordHash = await hashPassword(password);

        const result = await pool.query(`
            INSERT INTO usuarios
            (
                nombre,
                correo,
                password,
                programa,
                institucion
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING
                id,
                nombre,
                correo,
                programa,
                institucion,
                fecha_registro
        `, [
            nombre.trim(),
            correo.trim(),
            passwordHash,
            programa || null,
            institucion || null
        ]);

        res.status(201).json({
            mensaje: 'Usuario creado correctamente',
            usuario: result.rows[0]
        });
    } catch (error) {
        console.error('Error al crear usuario:', error);

        if (error.code === '23505') {
            return res.status(409).json({
                mensaje: 'El correo electrónico ya está registrado'
            });
        }

        res.status(500).json({
            mensaje: 'Error interno al crear el usuario'
        });
    }
});

// ==========================================
// ACTUALIZAR USUARIO AUTENTICADO
// ==========================================
app.put('/api/usuarios/:id', verificarToken, async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id !== req.user.id) {
            return res.status(403).json({
                mensaje: 'No tienes permiso para modificar este usuario'
            });
        }

        const {
            nombre,
            correo,
            password,
            programa,
            institucion
        } = req.body;

        if (
            typeof nombre !== 'string' ||
            typeof correo !== 'string' ||
            !nombre.trim() ||
            !correo.trim()
        ) {
            return res.status(400).json({
                mensaje: 'Nombre y correo son obligatorios'
            });
        }

        let result;

        if (password !== undefined && password !== '') {
            if (typeof password !== 'string' || password.length < 8) {
                return res.status(400).json({
                    mensaje: 'La contraseña debe tener al menos 8 caracteres'
                });
            }

            if (Buffer.byteLength(password, 'utf8') > 72) {
                return res.status(400).json({
                    mensaje: 'La contraseña no puede superar 72 bytes'
                });
            }

            const passwordHash = await hashPassword(password);

            result = await pool.query(`
                UPDATE usuarios
                SET
                    nombre = $1,
                    correo = $2,
                    password = $3,
                    programa = $4,
                    institucion = $5
                WHERE id = $6
                RETURNING
                    id,
                    nombre,
                    correo,
                    programa,
                    institucion,
                    fecha_registro
            `, [
                nombre.trim(),
                correo.trim(),
                passwordHash,
                programa || null,
                institucion || null,
                id
            ]);
        } else {
            result = await pool.query(`
                UPDATE usuarios
                SET
                    nombre = $1,
                    correo = $2,
                    programa = $3,
                    institucion = $4
                WHERE id = $5
                RETURNING
                    id,
                    nombre,
                    correo,
                    programa,
                    institucion,
                    fecha_registro
            `, [
                nombre.trim(),
                correo.trim(),
                programa || null,
                institucion || null,
                id
            ]);
        }

        if (result.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        res.json({
            mensaje: 'Usuario actualizado correctamente',
            usuario: result.rows[0]
        });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);

        if (error.code === '23505') {
            return res.status(409).json({
                mensaje: 'El correo electrónico ya está registrado'
            });
        }

        res.status(500).json({
            mensaje: 'Error interno al actualizar el usuario'
        });
    }
});

// ==========================================
// ELIMINAR USUARIO AUTENTICADO
// ==========================================
app.delete('/api/usuarios/:id', verificarToken, async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id !== req.user.id) {
            return res.status(403).json({
                mensaje: 'No tienes permiso para eliminar este usuario'
            });
        }

        const result = await pool.query(`
            DELETE FROM usuarios
            WHERE id = $1
            RETURNING
                id,
                nombre,
                correo,
                programa,
                institucion
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        res.json({
            mensaje: 'Usuario eliminado correctamente',
            usuario: result.rows[0]
        });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);

        res.status(500).json({
            mensaje: 'Error interno al eliminar el usuario'
        });
    }
});

// ==========================================
// OBTENER ASIGNATURAS DEL USUARIO
// ==========================================
app.get('/api/asignaturas', verificarToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                a.id,
                a.nombre,
                a.descripcion,
                a.porcentaje_progreso,
                a.usuario_id,
                a.fecha_creacion,
                u.nombre AS usuario_nombre
            FROM asignaturas a
            INNER JOIN usuarios u
                ON a.usuario_id = u.id
            WHERE a.usuario_id = $1
            ORDER BY a.id
        `, [req.user.id]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error al consultar asignaturas:', error);

        res.status(500).json({
            mensaje: 'Error al consultar las asignaturas'
        });
    }
});

// ==========================================
// CREAR ASIGNATURA
// ==========================================
app.post('/api/asignaturas', verificarToken, async (req, res) => {
    try {
        const {
            nombre,
            descripcion,
            porcentaje_progreso
        } = req.body;

        if (typeof nombre !== 'string' || !nombre.trim()) {
            return res.status(400).json({
                mensaje: 'El nombre de la asignatura es obligatorio'
            });
        }

        const progreso = porcentaje_progreso ?? 0;

        if (
            typeof progreso !== 'number' ||
            !Number.isFinite(progreso) ||
            progreso < 0 ||
            progreso > 100
        ) {
            return res.status(400).json({
                mensaje: 'El porcentaje de progreso debe estar entre 0 y 100'
            });
        }

        const result = await pool.query(`
            INSERT INTO asignaturas
            (
                nombre,
                descripcion,
                porcentaje_progreso,
                usuario_id
            )
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `, [
            nombre.trim(),
            descripcion || null,
            progreso,
            req.user.id
        ]);

        res.status(201).json({
            mensaje: 'Asignatura creada correctamente',
            asignatura: result.rows[0]
        });
    } catch (error) {
        console.error('Error al crear asignatura:', error);

        res.status(500).json({
            mensaje: 'Error al crear la asignatura'
        });
    }
});

// ==========================================
// ACTUALIZAR ASIGNATURA
// ==========================================
app.put('/api/asignaturas/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;

        const {
            nombre,
            descripcion,
            porcentaje_progreso
        } = req.body;

        if (typeof nombre !== 'string' || !nombre.trim()) {
            return res.status(400).json({
                mensaje: 'El nombre de la asignatura es obligatorio'
            });
        }

        const progreso = porcentaje_progreso ?? 0;

        if (
            typeof progreso !== 'number' ||
            !Number.isFinite(progreso) ||
            progreso < 0 ||
            progreso > 100
        ) {
            return res.status(400).json({
                mensaje: 'El porcentaje de progreso debe estar entre 0 y 100'
            });
        }

        const result = await pool.query(`
            UPDATE asignaturas
            SET
                nombre = $1,
                descripcion = $2,
                porcentaje_progreso = $3
            WHERE id = $4
              AND usuario_id = $5
            RETURNING *
        `, [
            nombre.trim(),
            descripcion || null,
            progreso,
            id,
            req.user.id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'Asignatura no encontrada para este usuario'
            });
        }

        res.json({
            mensaje: 'Asignatura actualizada correctamente',
            asignatura: result.rows[0]
        });
    } catch (error) {
        console.error('Error al actualizar asignatura:', error);

        res.status(500).json({
            mensaje: 'Error al actualizar la asignatura'
        });
    }
});

// ==========================================
// ELIMINAR ASIGNATURA
// ==========================================
app.delete('/api/asignaturas/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            DELETE FROM asignaturas
            WHERE id = $1
              AND usuario_id = $2
            RETURNING *
        `, [
            id,
            req.user.id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'Asignatura no encontrada para este usuario'
            });
        }

        res.json({
            mensaje: 'Asignatura eliminada correctamente',
            asignatura: result.rows[0]
        });
    } catch (error) {
        console.error('Error al eliminar asignatura:', error);

        res.status(500).json({
            mensaje: 'Error al eliminar la asignatura'
        });
    }
});

// ==========================================
// OBTENER ACTIVIDADES DEL USUARIO
// ==========================================
app.get('/api/actividades', verificarToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                a.id,
                a.nombre,
                a.descripcion,
                a.asignatura_id,
                a.fecha_entrega,
                a.prioridad,
                a.estado,
                a.observaciones,
                a.fecha_creacion,
                s.nombre AS asignatura_nombre,
                s.usuario_id
            FROM actividades a
            INNER JOIN asignaturas s
                ON a.asignatura_id = s.id
            WHERE s.usuario_id = $1
            ORDER BY
                a.fecha_entrega ASC,
                a.id ASC
        `, [req.user.id]);

        res.json(result.rows);
    } catch (error) {
        console.error('Error al consultar actividades:', error);

        res.status(500).json({
            mensaje: 'Error al consultar las actividades'
        });
    }
});

// ==========================================
// CREAR ACTIVIDAD
// ==========================================
app.post('/api/actividades', verificarToken, async (req, res) => {
    try {
        const {
            nombre,
            descripcion,
            asignatura_id,
            fecha_entrega,
            prioridad,
            estado,
            observaciones
        } = req.body;

        if (
            typeof nombre !== 'string' ||
            !nombre.trim() ||
            !asignatura_id ||
            !fecha_entrega
        ) {
            return res.status(400).json({
                mensaje: 'Nombre, asignatura y fecha de entrega son obligatorios'
            });
        }

        const asignatura = await pool.query(`
            SELECT id
            FROM asignaturas
            WHERE id = $1
              AND usuario_id = $2
        `, [
            asignatura_id,
            req.user.id
        ]);

        if (asignatura.rows.length === 0) {
            return res.status(403).json({
                mensaje: 'La asignatura no pertenece al usuario autenticado'
            });
        }

        const prioridadesValidas = ['Alta', 'Media', 'Baja'];
        const estadosValidos = ['Pendiente', 'En proceso', 'Completada'];

        const prioridadFinal = prioridad || 'Media';
        const estadoFinal = estado || 'Pendiente';

        if (!prioridadesValidas.includes(prioridadFinal)) {
            return res.status(400).json({
                mensaje: 'La prioridad debe ser Alta, Media o Baja'
            });
        }

        if (!estadosValidos.includes(estadoFinal)) {
            return res.status(400).json({
                mensaje: 'El estado debe ser Pendiente, En proceso o Completada'
            });
        }

        const result = await pool.query(`
            INSERT INTO actividades
            (
                nombre,
                descripcion,
                asignatura_id,
                fecha_entrega,
                prioridad,
                estado,
                observaciones
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `, [
            nombre.trim(),
            descripcion || null,
            asignatura_id,
            fecha_entrega,
            prioridadFinal,
            estadoFinal,
            observaciones || null
        ]);

        res.status(201).json({
            mensaje: 'Actividad creada correctamente',
            actividad: result.rows[0]
        });
    } catch (error) {
        console.error('Error al crear actividad:', error);

        res.status(500).json({
            mensaje: 'Error al crear la actividad'
        });
    }
});

// ==========================================
// ACTUALIZAR ACTIVIDAD
// ==========================================
app.put('/api/actividades/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;

        const {
            nombre,
            descripcion,
            asignatura_id,
            fecha_entrega,
            prioridad,
            estado,
            observaciones
        } = req.body;

        if (
            typeof nombre !== 'string' ||
            !nombre.trim() ||
            !asignatura_id ||
            !fecha_entrega
        ) {
            return res.status(400).json({
                mensaje: 'Nombre, asignatura y fecha de entrega son obligatorios'
            });
        }

        const prioridadesValidas = ['Alta', 'Media', 'Baja'];
        const estadosValidos = ['Pendiente', 'En proceso', 'Completada'];

        if (!prioridadesValidas.includes(prioridad)) {
            return res.status(400).json({
                mensaje: 'La prioridad debe ser Alta, Media o Baja'
            });
        }

        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({
                mensaje: 'El estado debe ser Pendiente, En proceso o Completada'
            });
        }

        const asignatura = await pool.query(`
            SELECT id
            FROM asignaturas
            WHERE id = $1
              AND usuario_id = $2
        `, [
            asignatura_id,
            req.user.id
        ]);

        if (asignatura.rows.length === 0) {
            return res.status(403).json({
                mensaje: 'La asignatura no pertenece al usuario autenticado'
            });
        }

        const result = await pool.query(`
            UPDATE actividades
            SET
                nombre = $1,
                descripcion = $2,
                asignatura_id = $3,
                fecha_entrega = $4,
                prioridad = $5,
                estado = $6,
                observaciones = $7
            WHERE id = $8
              AND EXISTS (
                  SELECT 1
                  FROM asignaturas s
                  WHERE s.id = actividades.asignatura_id
                    AND s.usuario_id = $9
              )
            RETURNING *
        `, [
            nombre.trim(),
            descripcion || null,
            asignatura_id,
            fecha_entrega,
            prioridad,
            estado,
            observaciones || null,
            id,
            req.user.id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'Actividad no encontrada para este usuario'
            });
        }

        res.json({
            mensaje: 'Actividad actualizada correctamente',
            actividad: result.rows[0]
        });
    } catch (error) {
        console.error('Error al actualizar actividad:', error);

        res.status(500).json({
            mensaje: 'Error al actualizar la actividad'
        });
    }
});

// ==========================================
// ELIMINAR ACTIVIDAD
// ==========================================
app.delete('/api/actividades/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            DELETE FROM actividades a
            USING asignaturas s
            WHERE a.id = $1
              AND a.asignatura_id = s.id
              AND s.usuario_id = $2
            RETURNING a.*
        `, [
            id,
            req.user.id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'Actividad no encontrada para este usuario'
            });
        }

        res.json({
            mensaje: 'Actividad eliminada correctamente',
            actividad: result.rows[0]
        });
    } catch (error) {
        console.error('Error al eliminar actividad:', error);

        res.status(500).json({
            mensaje: 'Error al eliminar la actividad'
        });
    }
});

// ==========================================
// RUTAS NO ENCONTRADAS
// ==========================================
app.use((req, res) => {
    res.status(404).json({
        mensaje: 'Ruta no encontrada',
        ruta: req.originalUrl
    });
});

// ==========================================
// ERRORES GENERALES
// ==========================================
app.use((error, req, res, next) => {
    console.error('Error general:', error);

    res.status(500).json({
        mensaje: 'Error interno del servidor'
    });
});

// ==========================================
// INICIAR SERVIDOR
// ==========================================
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
