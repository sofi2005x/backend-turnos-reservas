import { ServiceModel } from '../models/service.model.js';
export const servicesDao = {
  async getAll() {
    return await ServiceModel.find();
  },

  async getById(id) {
    return await ServiceModel.findById(id);
  },

  async create(serviceData) {
    return await ServiceModel.create(serviceData);
  },

  async update(id, changes) {
    return await ServiceModel.findByIdAndUpdate(id, changes, { new: true });
  },

  async delete(id) {
    return await ServiceModel.findByIdAndDelete(id);
  },
};