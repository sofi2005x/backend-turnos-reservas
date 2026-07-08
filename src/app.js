import config from './config/env.config.js';
import ServiceManager from './managers/ServiceManager.js';

console.log(`Aplicación inicializada en modo ${config.nodeEnv}, puerto ${config.port}`);

// Instanciamos el manager apuntando a nuestro archivo de datos
const manager = new ServiceManager('./src/data/services.json');

// Prueba manual: crea un servicio y lista todos, para verificar que el flujo completo funciona
async function test() {
  await manager.addService({
    name: 'Corte de cabello',
    description: 'Corte clásico',
    duration: 30,
    price: 5000,
    category: 'peluqueria',
    available: true,
  });

  await manager.addService({
    name: 'Manicura',
    description: 'Manicura semipermanente',
    duration: 45,
    price: 8000,
    category: 'estetica',
    available: true,
  });

  await manager.addService({
    name: 'Masaje relajante',
    description: 'Masaje de 1 hora',
    duration: 60,
    price: 12000,
    category: 'bienestar',
    available: false,
  });

  console.log(await manager.getServices()); // debería mostrar los 3
}

test();