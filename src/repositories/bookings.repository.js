import { bookingsDao } from '../dao/bookings.dao.js';

export const bookingsRepository = {
  async getAll() {
    return await bookingsDao.getAll();
  },
  async create(data) {
    return await bookingsDao.create(data);
  },
  async getById(id) {
    return await bookingsDao.getById(id);
  },
  async update(id, data) {
    return await bookingsDao.update(id, data);
  },
  async delete(id) {
    return await bookingsDao.delete(id);
  },
};