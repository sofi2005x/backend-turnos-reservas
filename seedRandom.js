import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ServiceModel } from './src/models/service.model.js';
import { BookingModel } from './src/models/booking.model.js';
import { MessageModel } from './src/models/message.model.js';
dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Limpiar colecciones previas (opcional, pero recomendado)
    await ServiceModel.deleteMany({});
    await BookingModel.deleteMany({});
    await MessageModel.deleteMany({});

    // Insertar servicios
    const services = await ServiceModel.insertMany([
      {
        name: 'Corte de cabello',
        description: 'Corte profesional',
        duration: 30,
        price: 500,
        category: 'barberia',
        available: true,
      },
      {
        name: 'Afeitado',
        description: 'Afeitado clásico',
        duration: 20,
        price: 300,
        category: 'barberia',
        available: true,
      },
    ]);

    console.log('✅ Servicios insertados:', services.length);

    // Insertar reservas
    const bookings = await BookingModel.insertMany([
      {
        clientName: 'Juan Pérez',
        clientEmail: 'juan@example.com',
        date: '2026-08-15',
        time: '10:00',
        status: 'pending',
        services: [
          { service: services[0]._id, quantity: 1 },
        ],
      },
    ]);

    console.log('✅ Reservas insertadas:', bookings.length);

    // Insertar mensajes
    const messages = await MessageModel.insertMany([
      {
        user: 'admin',
        message: 'Sistema inicializado',
      },
    ]);

    console.log('✅ Mensajes insertados:', messages.length);
    console.log('🌱 Seed completado correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al hacer seed:', error.message);
    process.exit(1);
  }
};

seedDatabase();