import { BookingModel } from './models/booking.model.js';

export const bookingsDao = {
  async create(bookingData) {
    return await BookingModel.create(bookingData);
  },

  async getById(id) {
    return await BookingModel.findById(id).populate('services.service');
  },

  async update(id, changes) {
    return await BookingModel.findByIdAndUpdate(id, changes, { new: true }).populate('services.service');
  },
};