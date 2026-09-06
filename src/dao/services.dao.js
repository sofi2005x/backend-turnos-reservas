import { ServiceModel } from '../models/service.model.js';

export const servicesDao = {
  async getAll(filter, sortOption, skip, limit) {
    return await ServiceModel.find(filter).sort(sortOption).skip(skip).limit(limit);
  },

  async countAll(filter) {
    return await ServiceModel.countDocuments(filter);
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