import { servicesService } from '../services/services.service.js';

// GET /api/services -> lista servicios con filtros, paginación y ordenamiento
export const getServices = async (req, res) => {
  try {
    const { category, available, page, limit, sortBy, order } = req.query;
    const { services, pagination } = await servicesService.getServices({
      category,
      available,
      page,
      limit,
      sortBy,
      order,
    });

    res.status(200).json({
      status: 'success',
      payload: services,
      ...pagination,
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al obtener los servicios' });
  }
};

// GET /api/services/:sid -> devuelve un servicio puntual por id
export const getServiceById = async (req, res) => {
  try {
    const { sid } = req.params;
    const service = await servicesService.getServiceById(sid);

    if (!service) {
      return res.status(404).json({ status: 'error', message: `No se encontró un servicio con id ${sid}` });
    }

    res.status(200).json({ status: 'success', payload: service });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al obtener el servicio' });
  }
};

// POST /api/services -> crea un nuevo servicio (req.body ya viene validado por Zod)
export const createService = async (req, res) => {
  try {
    const newService = await servicesService.createService(req.body);
    req.app.get('io').emit('serviceCreated', newService);
    res.status(201).json({ status: 'success', payload: newService });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// PUT /api/services/:sid -> actualiza un servicio existente
export const updateService = async (req, res) => {
  try {
    const { sid } = req.params;
    const updated = await servicesService.updateService(sid, req.body);

    if (!updated) {
      return res.status(404).json({ status: 'error', message: `No se encontró un servicio con id ${sid}` });
    }

    res.status(200).json({ status: 'success', payload: updated });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al actualizar el servicio' });
  }
};

// DELETE /api/services/:sid -> elimina un servicio existente
export const deleteService = async (req, res) => {
  try {
    const { sid } = req.params;
    const deleted = await servicesService.deleteService(sid);

    if (!deleted) {
      return res.status(404).json({ status: 'error', message: `No se encontró un servicio con id ${sid}` });
    }

    res.status(200).json({ status: 'success', payload: deleted });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Error al eliminar el servicio' });
  }
};

export const servicesController = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};