// seedRandom.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ServiceModel } from './src/models/service.model.js';
import { BookingModel } from './src/models/booking.model.js';
import { MessageModel } from './src/models/message.model.js';
dotenv.config();

// Nombres aleatorios
const nombres = ['María', 'Carlos', 'Ana', 'Pedro', 'Laura', 'Jorge', 'Sofía', 'Luis', 'Elena', 'Miguel'];
const apellidos = ['González', 'Rodríguez', 'Martínez', 'Sánchez', 'Fernández', 'López', 'Díaz', 'Pérez', 'García', 'Torres'];
const mensajes = [
  'Excelente servicio, volveré pronto',
  'Muy profesionales, recomendado',
  'La atención fue increíble',
  'Todo perfecto, gracias',
  'Muy contento con el resultado',
  'Volveré sin dudas',
  'El mejor lugar de la ciudad',
  'Atención de primera',
  'Super recomendable',
  'Quedé muy satisfecho'
];
const statuses = ['confirmed', 'pending', 'cancelled'];

// Generar nombre aleatorio
const randomName = () => {
  const nombre = nombres[Math.floor(Math.random() * nombres.length)];
  const apellido = apellidos[Math.floor(Math.random() * apellidos.length)];
  return `${nombre} ${apellido}`;
};

// Generar email aleatorio
const randomEmail = (nombre) => {
  const name = nombre.toLowerCase().replace(' ', '.');
  return `${name}@email.com`;
};

// Generar fecha aleatoria (próximos 30 días)
const randomDate = () => {
  const today = new Date();
  const days = Math.floor(Math.random() * 30) + 1;
  const date = new Date(today);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

// Generar hora aleatoria (9:00 - 18:00)
const randomTime = () => {
  const hour = Math.floor(Math.random() * 9) + 9;
  const minutes = Math.random() > 0.5 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minutes}`;
};

// Generar cantidad aleatoria de servicios (1-3)
const randomServices = (serviceIds) => {
  const count = Math.floor(Math.random() * 3) + 1;
  const shuffled = [...serviceIds].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(id => ({
    service: id,
    quantity: Math.floor(Math.random() * 2) + 1
  }));
};

const seedRandom = async () => {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // 1. OBTENER SERVICIOS
    const services = await ServiceModel.find({});
    if (services.length === 0) {
      console.error('❌ No hay servicios. Ejecuta primero el seed de servicios.');
      process.exit(1);
    }
    const serviceIds = services.map(s => s._id);
    console.log(`✅ ${serviceIds.length} servicios disponibles`);

    // 2. LIMPIAR DATOS EXISTENTES (opcional)
    await BookingModel.deleteMany({});
    await MessageModel.deleteMany({});

    // 3. GENERAR 10 RESERVAS ALEATORIAS
    console.log('📝 Generando reservas aleatorias...');
    const bookings = [];
    for (let i = 0; i < 10; i++) {
      const name = randomName();
      bookings.push({
        clientName: name,
        clientEmail: randomEmail(name),
        date: randomDate(),
        time: randomTime(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        services: randomServices(serviceIds)
      });
    }

    const insertedBookings = await BookingModel.insertMany(bookings);
    console.log(`✅ ${insertedBookings.length} reservas creadas`);

    // 4. GENERAR 10 MENSAJES ALEATORIOS
    console.log('📝 Generando mensajes aleatorios...');
    const msgs = [];
    for (let i = 0; i < 10; i++) {
      const name = randomName();
      msgs.push({
        user: name,
        message: mensajes[Math.floor(Math.random() * mensajes.length)]
      });
    }

    const insertedMessages = await MessageModel.insertMany(msgs);
    console.log(`✅ ${insertedMessages.length} mensajes creados`);

    // 5. RESUMEN
    console.log('\n📊 Resumen:');
    console.log(`  - Reservas: ${insertedBookings.length}`);
    console.log(`  - Mensajes: ${insertedMessages.length}`);
    
    // Mostrar algunas reservas como ejemplo
    console.log('\n📋 Ejemplos de reservas:');
    insertedBookings.slice(0, 3).forEach(b => {
      console.log(`  - ${b.clientName}: ${b.date} ${b.time} (${b.status})`);
    });

    console.log('\n✅ Seed completado');
    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedRandom();