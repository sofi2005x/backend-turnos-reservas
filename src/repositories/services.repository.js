import { servicesDao } from '../dao/services.dao.js';

export const servicesRepository = {
  async getAll({ name, category, available, page, limit, sortBy, order } = {}) {
    // Construcción dinámica del filtro: solo se agregan las claves que el cliente mandó
    const filter = {};
    if (name && name.trim() !== '') {
      filter.name = new RegExp(name.trim(), 'i');
    }
    if (category && category.trim() !== '') {
      filter.category = new RegExp(`^${category.trim()}$`, 'i');
    }
    if (available === 'true' || available === true) {
      filter.available = true;
    } else if (available === 'false' || available === false) {
      filter.available = false;
    }

    // Ordenamiento: por defecto orden ascendente por nombre si no se pide nada puntual
    const sortField = sortBy || 'name';
    const sortOption = { [sortField]: order === 'desc' ? -1 : 1 };

    const currentPage = Number(page) || 1;
    const currentLimit = Number(limit) || 10;
    const skip = (currentPage - 1) * currentLimit;

    const [services, totalResults] = await Promise.all([
      servicesDao.getAll(filter, sortOption, skip, currentLimit),
      servicesDao.countAll(filter),
    ]);

    const totalPages = Math.ceil(totalResults / currentLimit) || 1;

    return {
      services,
      pagination: {
        totalResults,
        page: currentPage,
        limit: currentLimit,
        totalPages,
        hasPrevPage: currentPage > 1,
        hasNextPage: currentPage < totalPages,
      },
    };
  },
  async getById(id) {
    return await servicesDao.getById(id);
  },
  async create(data) {
    return await servicesDao.create(data);
  },
  async update(id, data) {
    return await servicesDao.update(id, data);
  },
  async delete(id) {
    return await servicesDao.delete(id);
  },
};