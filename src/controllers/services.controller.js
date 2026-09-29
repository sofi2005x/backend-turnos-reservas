import { servicesService } from '../services/services.service.js';

// GET /api/services -> lista servicios con filtros, paginación y ordenamiento
export const getServices = async (req, res) => {
  try {
    const { name, category, available, page, limit, sortBy, order } = req.validatedQuery;
    const { services, pagination } = await servicesService.getServices({
      name,
      category,
      available,
      page,
      limit,
      sortBy,
      order,
    });

    const buildLink = (targetPage) => {
      const params = new URLSearchParams();
      if (name) params.set('name', name);
      if (category) params.set('category', category);
      if (available !== undefined) params.set('available', available);
      if (sortBy) params.set('sortBy', sortBy);
      if (order) params.set('order', order);
      params.set('limit', pagination.limit);
      params.set('page', targetPage);
      return `/api/services?${params.toString()}`;
    };

    res.status(200).json({
      status: 'success',
      payload: services,
      totalResults: pagination.totalResults,
      totalPages: pagination.totalPages,
      page: pagination.page,
      limit: pagination.limit,
      hasPrevPage: pagination.hasPrevPage,
      hasNextPage: pagination.hasNextPage,
      prevPage: pagination.hasPrevPage ? pagination.page - 1 : null,
      nextPage: pagination.hasNextPage ? pagination.page + 1 : null,
      prevLink: pagination.hasPrevPage ? buildLink(pagination.page - 1) : null,
      nextLink: pagination.hasNextPage ? buildLink(pagination.page + 1) : null,
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
    const io = req.app.get('io');
    if (io) io.emit('serviceCreated', newService);
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

    const io = req.app.get('io');
    if (io) io.emit('serviceUpdated', updated);

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

    const io = req.app.get('io');
    if (io) io.emit('serviceDeleted', { id: sid });

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