import { servicesDao } from '../dao/services.dao.js';
const SORTABLE_FIELDS = ['name', 'price', 'duration', 'category', 'createdAt'];

// Escapa caracteres especiales de regex para que el texto del usuario se busque literal
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const servicesRepository = {
    async getAll({ name, category, available, page, limit, sortBy, order } = {}) {
    const filter = {};
    if (name && name.trim() !== '') {
      filter.name = new RegExp(escapeRegex(name.trim()), 'i');
    }
    if (category && category.trim() !== '') {
      filter.category = new RegExp(`^${escapeRegex(category.trim())}$`, 'i');
    }
    if (available === 'true' || available === true) {
      filter.available = true;
    } else if (available === 'false' || available === false) {
      filter.available = false;
    }

    const sortField = SORTABLE_FIELDS.includes(sortBy) ? sortBy : 'name';
    const sortOption = { [sortField]: order === 'desc' ? -1 : 1 };

    const currentPage = Math.max(Number(page) || 1, 1);
    const currentLimit = Math.min(Math.max(Number(limit) || 10, 1), 100);
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