import api from './api';

export const obtenerActividades = async (usuarioId) => {
    const respuesta = await api.get('/actividades', {
        params: {
            usuario_id: usuarioId
        }
    });

    return respuesta.data;
};

export const crearActividad = async (actividad) => {
    const respuesta = await api.post('/actividades', actividad);
    return respuesta.data;
};

export const actualizarActividad = async (id, actividad) => {
    const respuesta = await api.put(`/actividades/${id}`, actividad);
    return respuesta.data;
};

export const eliminarActividad = async (id, usuarioId) => {
    const respuesta = await api.delete(`/actividades/${id}`, {
        params: {
            usuario_id: usuarioId
        }
    });

    return respuesta.data;
};