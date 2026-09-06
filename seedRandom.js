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
        name: 'Corte de cabello masculino',
        description: 'Corte clásico o moderno con tijera y máquina, incluye lavado.',
        duration: 30,
        price: 1200,
        category: 'barberia',
        available: true,
      },
      {
        name: 'Perfilado y corte de barba',
        description: 'Arreglo completo de barba con toalla caliente y aceites esenciales.',
        duration: 25,
        price: 800,
        category: 'barberia',
        available: true,
      },
      {
        name: 'Coloración y Mechas',
        description: 'Tintura completa o reflejos con productos de alta nutrición capilar.',
        duration: 90,
        price: 3500,
        category: 'peluqueria',
        available: true,
      },
      {
        name: 'Manicura Spa Completa',
        description: 'Exfoliación, hidratación profunda y esmaltado semipermanente.',
        duration: 45,
        price: 1500,
        category: 'estetica',
        available: true,
      },
      {
        name: 'Masaje Descontracturante',
        description: 'Sesión de relajación y alivio muscular en espalda y cuello.',
        duration: 50,
        price: 2500,
        category: 'spa',
        available: true,
      },
    ]);

    console.log('✅ Servicios insertados:', services.length);

    // Insertar reservas
    const bookings = await BookingModel.insertMany([
      {
        clientName: 'Juan Pérez',
        clientEmail: 'juan.perez@example.com',
        date: '2026-09-10',
        time: '10:00',
        status: 'confirmed',
        services: [
          { service: services[0]._id, quantity: 1 },
          { service: services[1]._id, quantity: 1 },
        ],
      },
      {
        clientName: 'María Rodríguez',
        clientEmail: 'maria.rodriguez@example.com',
        date: '2026-09-11',
        time: '14:30',
        status: 'pending',
        services: [
          { service: services[2]._id, quantity: 1 },
          { service: services[3]._id, quantity: 1 },
        ],
      },
      {
        clientName: 'Carlos Gómez',
        clientEmail: 'carlos.gomez@example.com',
        date: '2026-09-12',
        time: '16:00',
        status: 'confirmed',
        services: [
          { service: services[4]._id, quantity: 1 },
        ],
      },
    ]);

    console.log('✅ Reservas insertadas:', bookings.length);

    // Insertar mensajes
    const messages = await MessageModel.insertMany([
      {
        user: 'Juan Pérez',
        message: 'Excelente atención, el corte quedó genial.',
      },
      {
        user: 'María Rodríguez',
        message: '¿Tienen disponibilidad para el próximo sábado por la mañana?',
      },
      {
        user: 'Carlos Gómez',
        message: 'Muy buen ambiente y puntualidad.',
      },
      {
        user: 'Admin',
        message: '¡Bienvenidos al sistema de gestión de turnos!',
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