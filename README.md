# Backend Turnos y Reservas — Administrador de Servicios

Proyecto Node.js (ESM) que implementa una clase `ServiceManager` para gestionar
los servicios ofrecidos por un sistema de turnos y reservas (peluquería,
estética, bienestar, etc.), persistiendo los datos en un archivo JSON local.

## Instalación

\`\`\`bash
git clone https://github.com/sofi2005x/backend-turnos-reservas.git
cd backend-turnos-reservas
npm install
\`\`\`

## Variables de entorno

Copiar `.env.example` a `.env` y completar:

| Variable   | Descripción                          | Ejemplo       |
|------------|---------------------------------------|---------------|
| PORT       | Puerto reservado para etapas futuras  | 8080          |
| NODE_ENV   | Entorno de ejecución                  | development   |

Si falta alguna variable obligatoria, la app no arranca y muestra un error
explícito en consola (fail-fast, validado en `src/config/env.config.js`).

## Ejecución

\`\`\`bash
node src/app.js
\`\`\`

Esto corre una prueba manual que crea, busca, actualiza y elimina servicios
usando `ServiceManager`, mostrando el resultado de cada operación por consola.
Todavía no hay servidor HTTP levantado: esta etapa se centra en la lógica de
negocio pura, sin capa de red (eso se agrega en un módulo posterior del curso).

## Recurso: `services`

Cada servicio tiene la forma:

\`\`\`json
{
  "id": 1,
  "name": "Corte de cabello",
  "description": "Corte clásico",
  "duration": 30,
  "price": 5000,
  "category": "peluqueria",
  "available": true
}
\`\`\`

- `id`: generado automáticamente, nunca se recibe desde afuera.
- `duration`: minutos que dura el servicio.
- `price`: precio en la moneda local.
- `category`: rubro del servicio (ej. peluqueria, estetica, bienestar).
- `available`: si el servicio está actualmente ofrecido (`false` es un valor
  válido, no significa "campo vacío").

## Métodos de `ServiceManager`

| Método                          | Descripción                                      | Retorno si no existe |
|----------------------------------|---------------------------------------------------|-----------------------|
| `getServices()`                  | Devuelve todos los servicios                      | —                     |
| `getServiceById(id)`             | Busca un servicio puntual                         | `null`                |
| `addService(data)`               | Crea un servicio, valida campos obligatorios       | lanza error si faltan datos |
| `updateService(id, data)`        | Actualiza un servicio; ignora cualquier `id` recibido en `data` | `null` |
| `deleteService(id)`              | Elimina un servicio                               | `null`                |

### Ejemplos de uso

\`\`\`javascript
import ServiceManager from './src/managers/ServiceManager.js';

const manager = new ServiceManager('./src/data/services.json');

const nuevo = await manager.addService({
  name: 'Corte de cabello',
  description: 'Corte clásico',
  duration: 30,
  price: 5000,
  category: 'peluqueria',
  available: true,
});

const todos = await manager.getServices();
const uno = await manager.getServiceById(nuevo.id);
const actualizado = await manager.updateService(nuevo.id, { price: 6000 });
const eliminado = await manager.deleteService(nuevo.id);
\`\`\`
