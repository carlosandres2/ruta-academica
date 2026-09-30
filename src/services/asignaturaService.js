import api from './api';

export const obtenerAsignaturas = async (usuarioId) => {
    const respuesta = await api.get('/asignaturas', {
        params: {
            usuario_id: usuarioId
        }
    });

    return respuesta.data;
};

export const crearAsignatura = async (asignatura) => {
    const respuesta = await api.post('/asignaturas', asignatura);
    return respuesta.data;
};

export const actualizarAsignatura = async (id, asignatura) => {
    const respuesta = await api.put(`/asignaturas/${id}`, asignatura);
    return respuesta.data;
};

export const eliminarAsignatura = async (id, usuarioId) => {
    const respuesta = await api.delete(`/asignaturas/${id}`, {
        params: {
            usuario_id: usuarioId
        }
    });

    return respuesta.data;
};