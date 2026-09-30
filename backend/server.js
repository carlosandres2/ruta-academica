const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./db');

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
            mensaje: error.message
        });
    }
});

// ==========================================
// OBTENER USUARIOS
// ==========================================
app.get('/api/usuarios', async (req, res) => {
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
            ORDER BY id
        `);

        res.json(result.rows);

    } catch (error) {
        console.error('Error al consultar usuarios:', error);

        res.status(500).json({
            mensaje: 'Error al consultar los usuarios',
            error: error.message
        });
    }
});

// ==========================================
// INICIAR SESIÓN
// ==========================================
app.post('/api/login', async (req, res) => {
    try {
        const { correo, password } = req.body;

        if (!correo || !password) {
            return res.status(400).json({
                mensaje: 'Correo y contrasena son obligatorios'
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
        `, [correo]);

        if (result.rows.length === 0) {
            return res.status(401).json({
                mensaje: 'Correo o contrasena incorrectos'
            });
        }

        const usuario = result.rows[0];

        if (usuario.password !== password) {
            return res.status(401).json({
                mensaje: 'Correo o contrasena incorrectos'
            });
        }

        delete usuario.password;

        res.json(usuario);

    } catch (error) {
        console.error('Error al iniciar sesion:', error);

        res.status(500).json({
            mensaje: 'Error al iniciar sesion',
            error: error.message
        });
    }
});

// ==========================================
// CREAR USUARIO
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

        if (!nombre || !correo || !password) {
            return res.status(400).json({
                mensaje: 'Nombre, correo y contrasena son obligatorios'
            });
        }

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
            nombre,
            correo,
            password,
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
                mensaje: 'El correo electronico ya esta registrado'
            });
        }

        res.status(500).json({
            mensaje: 'Error al crear el usuario',
            error: error.message
        });
    }
});

// ==========================================
// ACTUALIZAR USUARIO
// ==========================================
app.put('/api/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const {
            nombre,
            correo,
            password,
            programa,
            institucion
        } = req.body;

        if (!nombre || !correo) {
            return res.status(400).json({
                mensaje: 'Nombre y correo son obligatorios'
            });
        }

        let result;

        if (password) {
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
                nombre,
                correo,
                password,
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
                nombre,
                correo,
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
                mensaje: 'El correo electronico ya esta registrado'
            });
        }

        res.status(500).json({
            mensaje: 'Error al actualizar el usuario',
            error: error.message
        });
    }
});

// ==========================================
// ELIMINAR USUARIO
// ==========================================
app.delete('/api/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;

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
            mensaje: 'Error al eliminar el usuario',
            error: error.message
        });
    }
});

// ==========================================
// OBTENER ASIGNATURAS
// ==========================================
app.get('/api/asignaturas', async (req, res) => {
    try {
        const { usuario_id } = req.query;

        let query = `
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
        `;

        const params = [];

        if (usuario_id) {
            query += ` WHERE a.usuario_id = $1`;
            params.push(usuario_id);
        }

        query += ` ORDER BY a.id`;

        const result = await pool.query(query, params);

        res.json(result.rows);

    } catch (error) {
        console.error('Error al consultar asignaturas:', error);

        res.status(500).json({
            mensaje: 'Error al consultar las asignaturas',
            error: error.message
        });
    }
});

// ==========================================
// CREAR ASIGNATURA
// ==========================================
app.post('/api/asignaturas', async (req, res) => {
    try {
        const {
            nombre,
            descripcion,
            porcentaje_progreso,
            usuario_id
        } = req.body;

        if (!nombre || !usuario_id) {
            return res.status(400).json({
                mensaje: 'Nombre y usuario_id son obligatorios'
            });
        }

        const usuario = await pool.query(
            'SELECT id FROM usuarios WHERE id = $1',
            [usuario_id]
        );

        if (usuario.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'El usuario indicado no existe'
            });
        }

        const progreso = porcentaje_progreso ?? 0;

        if (progreso < 0 || progreso > 100) {
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
            nombre,
            descripcion || null,
            progreso,
            usuario_id
        ]);

        res.status(201).json({
            mensaje: 'Asignatura creada correctamente',
            asignatura: result.rows[0]
        });

    } catch (error) {
        console.error('Error al crear asignatura:', error);

        res.status(500).json({
            mensaje: 'Error al crear la asignatura',
            error: error.message
        });
    }
});

// ==========================================
// OBTENER ACTIVIDADES
// ==========================================
app.get('/api/actividades', async (req, res) => {
    try {
        const { usuario_id } = req.query;

        let query = `
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
        `;

        const params = [];

        if (usuario_id) {
            query += ` WHERE s.usuario_id = $1`;
            params.push(usuario_id);
        }

        query += `
            ORDER BY
                a.fecha_entrega ASC,
                a.id ASC
        `;

        const result = await pool.query(query, params);

        res.json(result.rows);

    } catch (error) {
        console.error('Error al consultar actividades:', error);

        res.status(500).json({
            mensaje: 'Error al consultar las actividades',
            error: error.message
        });
    }
});

// ==========================================
// CREAR ACTIVIDAD
// ==========================================
app.post('/api/actividades', async (req, res) => {
    try {
        const {
            nombre,
            descripcion,
            asignatura_id,
            fecha_entrega,
            prioridad,
            estado,
            observaciones,
            usuario_id
        } = req.body;

        if (!nombre || !asignatura_id || !fecha_entrega || !usuario_id) {
            return res.status(400).json({
                mensaje: 'Nombre, asignatura_id, fecha_entrega y usuario_id son obligatorios'
            });
        }

        // Verificar que la asignatura pertenece al usuario
        const asignatura = await pool.query(`
            SELECT id
            FROM asignaturas
            WHERE id = $1
              AND usuario_id = $2
        `, [
            asignatura_id,
            usuario_id
        ]);

        if (asignatura.rows.length === 0) {
            return res.status(403).json({
                mensaje: 'La asignatura no pertenece al usuario'
            });
        }

        const prioridadesValidas = [
            'Alta',
            'Media',
            'Baja'
        ];

        const estadosValidos = [
            'Pendiente',
            'En proceso',
            'Completada'
        ];

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
            nombre,
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
            mensaje: 'Error al crear la actividad',
            error: error.message
        });
    }
});

// ==========================================
// ACTUALIZAR ACTIVIDAD
// ==========================================
app.put('/api/actividades/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const {
            nombre,
            descripcion,
            asignatura_id,
            fecha_entrega,
            prioridad,
            estado,
            observaciones,
            usuario_id
        } = req.body;

        if (!nombre || !asignatura_id || !fecha_entrega || !usuario_id) {
            return res.status(400).json({
                mensaje: 'Nombre, asignatura_id, fecha_entrega y usuario_id son obligatorios'
            });
        }

        const prioridadesValidas = [
            'Alta',
            'Media',
            'Baja'
        ];

        const estadosValidos = [
            'Pendiente',
            'En proceso',
            'Completada'
        ];

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

        // Verificar que la actividad pertenece al usuario
        const actividadActual = await pool.query(`
            SELECT a.id
            FROM actividades a
            INNER JOIN asignaturas s
                ON a.asignatura_id = s.id
            WHERE a.id = $1
              AND s.usuario_id = $2
        `, [
            id,
            usuario_id
        ]);

        if (actividadActual.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'Actividad no encontrada para este usuario'
            });
        }

        // Verificar que la nueva asignatura pertenece al usuario
        const asignatura = await pool.query(`
            SELECT id
            FROM asignaturas
            WHERE id = $1
              AND usuario_id = $2
        `, [
            asignatura_id,
            usuario_id
        ]);

        if (asignatura.rows.length === 0) {
            return res.status(403).json({
                mensaje: 'La asignatura no pertenece al usuario'
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
            RETURNING *
        `, [
            nombre,
            descripcion || null,
            asignatura_id,
            fecha_entrega,
            prioridad,
            estado,
            observaciones || null,
            id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                mensaje: 'Actividad no encontrada'
            });
        }

        res.json({
            mensaje: 'Actividad actualizada correctamente',
            actividad: result.rows[0]
        });

    } catch (error) {
        console.error('Error al actualizar actividad:', error);

        res.status(500).json({
            mensaje: 'Error al actualizar la actividad',
            error: error.message
        });
    }
});

// ==========================================
// ELIMINAR ACTIVIDAD
// ==========================================
app.delete('/api/actividades/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { usuario_id } = req.query;

        if (!usuario_id) {
            return res.status(400).json({
                mensaje: 'usuario_id es obligatorio'
            });
        }

        const result = await pool.query(`
            DELETE FROM actividades a
            USING asignaturas s
            WHERE a.id = $1
              AND a.asignatura_id = s.id
              AND s.usuario_id = $2
            RETURNING a.*
        `, [
            id,
            usuario_id
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
            mensaje: 'Error al eliminar la actividad',
            error: error.message
        });
    }
});

// ==========================================
// ACTUALIZAR ASIGNATURA
// ==========================================
app.put('/api/asignaturas/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const {
            nombre,
            descripcion,
            porcentaje_progreso,
            usuario_id
        } = req.body;

        if (!nombre || !usuario_id) {
            return res.status(400).json({
                mensaje: 'Nombre y usuario_id son obligatorios'
            });
        }

        const progreso = porcentaje_progreso ?? 0;

        if (progreso < 0 || progreso > 100) {
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
            nombre,
            descripcion || null,
            progreso,
            id,
            usuario_id
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
            mensaje: 'Error al actualizar la asignatura',
            error: error.message
        });
    }
});

// ==========================================
// ELIMINAR ASIGNATURA
// ==========================================
app.delete('/api/asignaturas/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { usuario_id } = req.query;

        if (!usuario_id) {
            return res.status(400).json({
                mensaje: 'usuario_id es obligatorio'
            });
        }

        const result = await pool.query(`
            DELETE FROM asignaturas
            WHERE id = $1
              AND usuario_id = $2
            RETURNING *
        `, [
            id,
            usuario_id
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
            mensaje: 'Error al eliminar la asignatura',
            error: error.message
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
    console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
});