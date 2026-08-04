# Sistema Backend de Turnos y Reservas

API REST construida con **Node.js** y **Express**, que gestiona dos recursos —
**servicios** y **reservas** — persistiendo los datos en archivos JSON locales
mediante el módulo nativo `fs/promises`.

Este proyecto corresponde a la pre-entrega "API inicial de servicios y
reservas con FileSystem" del curso de Backend Avanzado. Es la base sobre la
que, en módulos posteriores, se van a incorporar arquitectura en capas,
MongoDB, vistas y WebSockets.

## Tecnologías utilizadas

- Node.js (ESM — `"type": "module"`)
- Express 5
- dotenv (variables de entorno)
- Persistencia con archivos JSON (`fs/promises`)

## Instalación

```bash
git clone https://github.com/sofi2005x/backend-turnos-reservas.git
cd backend-turnos-reservas
npm install
```

## Variables de entorno

Copiar `.env.example` a `.env` y completar:

| Variable | Descripción                          | Ejemplo     |
| -------- | ------------------------------------- | ----------- |
| PORT     | Puerto en el que escucha el servidor  | 8080        |
| NODE_ENV | Entorno de ejecución                  | development |

Si falta alguna variable obligatoria, la app **no arranca** y muestra un
error explícito en consola (fail-fast, validado en `src/config/env.config.js`).

## Ejecución

```bash
npm start   # levanta el servidor una sola vez
npm run dev # levanta el servidor con reinicio automático (node --watch)
```

Si todo carga bien, vas a ver en la consola:

```
🚀 Servidor escuchando en http://localhost:8080
```

## Estructura del proyecto

```
src/
  app.js                       # configura Express, middlewares y rutas
  server.js                    # levanta el servidor (app.listen)
  config/
    env.config.js              # valida y centraliza las variables de entorno
  controllers/
    services.controller.js     # lógica de request/response de servicios
    bookings.controller.js     # lógica de request/response de reservas
  managers/
    ServiceManager.js          # CRUD de servicios sobre services.json
    BookingManager.js          # CRUD de reservas sobre bookings.json
    index.js                   # crea y exporta las instancias únicas de los managers
  routes/
    services.router.js         # define endpoints de /api/services
    bookings.router.js         # define endpoints de /api/bookings
  data/
    services.json              # persistencia de servicios
    bookings.json              # persistencia de reservas
```

## Arquitectura: routers, controllers y managers

El proyecto separa responsabilidades en tres capas, para que cada parte
tenga una única razón de cambiar:

```
Cliente → Router → Controller → Manager → Archivo JSON
```

| Capa           | Responsabilidad                                                                 | Qué NO hace                                  |
| -------------- | --------------------------------------------------------------------------------- | ---------------------------------------------- |
| **Router**     | Define la URL y el método HTTP, y los conecta con una función del controller     | No lee `req`, no llama al manager, no responde |
| **Controller** | Lee `req.params` / `req.query` / `req.body`, llama al manager y responde con `res.status().json()` | No accede directamente a los archivos JSON     |
| **Manager**    | Contiene toda la lógica de datos: leer, validar, crear, actualizar, eliminar      | No conoce `req` ni `res`                       |

**Ejemplo — `GET /api/services/:sid`:**

1. `services.router.js` recibe la petición y la deriva a `getServiceById`.
2. `services.controller.js` lee `req.params.sid`, se lo pasa a
   `serviceManager.getServiceById(sid)`, y arma la respuesta HTTP
   (`200` si existe, `404` si no).
3. `ServiceManager.js` busca el servicio dentro de `services.json` y lo
   devuelve (o `null`).

Esta separación es la que permite, en etapas futuras del curso, cambiar
la persistencia de FileSystem a MongoDB modificando **únicamente** la
capa de managers, sin tocar controllers ni routers.

## Recurso: `services`

Cada servicio tiene la forma:

```json
{
  "id": 1,
  "name": "Corte de cabello",
  "description": "Corte clásico",
  "duration": 30,
  "price": 5000,
  "category": "peluqueria",
  "available": true
}
```

- `id`: se genera automáticamente, nunca se recibe desde el body.
- `duration`: minutos que dura el servicio.
- `price`: precio en la moneda local.
- `category`: rubro del servicio (ej. `peluqueria`, `estetica`, `bienestar`).
- `available`: si el servicio está disponible (`false` es un valor válido,
  no significa "campo vacío").

### Endpoints

| Método | Ruta                 | Descripción                                                                               |
| ------ | -------------------- | ------------------------------------------------------------------------------------------ |
| GET    | `/api/services`      | Lista todos los servicios. Acepta filtros por query params: `?category=` y `?available=` |
| GET    | `/api/services/:sid` | Devuelve un servicio por id                                                               |
| POST   | `/api/services`      | Crea un servicio (valida todos los campos)                                               |
| PUT    | `/api/services/:sid` | Actualiza un servicio (ignora cualquier `id` recibido en el body)                          |
| DELETE | `/api/services/:sid` | Elimina un servicio                                                                       |

### Ejemplos

**Listar servicios disponibles de una categoría:**

```bash
curl "http://localhost:8080/api/services?category=estetica&available=true"
```

**Crear un servicio:**

```bash
curl -X POST http://localhost:8080/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tinte",
    "description": "Coloración completa",
    "duration": 90,
    "price": 15000,
    "category": "peluqueria",
    "available": true
  }'
```

**Actualizar un servicio (el id nunca cambia, aunque se mande en el body):**

```bash
curl -X PUT http://localhost:8080/api/services/1 \
  -H "Content-Type: application/json" \
  -d '{"price": 6000}'
```

**Eliminar un servicio:**

```bash
curl -X DELETE http://localhost:8080/api/services/1
```

## Recurso: `bookings`

Cada reserva tiene la forma:

```json
{
  "id": 1,
  "clientName": "Ana Perez",
  "clientEmail": "ana@test.com",
  "date": "2025-08-01",
  "time": "10:00",
  "status": "pending",
  "services": [
    { "service": 2, "quantity": 1 }
  ]
}
```

- `id`: se genera automáticamente.
- `status`: si no se envía, toma el valor por defecto `"pending"`.
- `services`: array de referencias a servicios existentes. Cada entrada
  guarda solo el `id` del servicio (`service`) y una `quantity`. Si se
  agrega el mismo servicio más de una vez, **se incrementa `quantity`** en
  lugar de duplicar la entrada.

### Endpoints

| Método | Ruta                                | Descripción                                                              |
| ------ | ------------------------------------ | ------------------------------------------------------------------------- |
| POST   | `/api/bookings`                     | Crea una reserva (puede iniciarse con `services` vacío)                 |
| GET    | `/api/bookings/:bid`                | Devuelve una reserva por id                                              |
| POST   | `/api/bookings/:bid/services/:sid`  | Agrega un servicio a una reserva existente, validando que ambos existan |

### Ejemplos

**Crear una reserva:**

```bash
curl -X POST http://localhost:8080/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "Ana Perez",
    "clientEmail": "ana@test.com",
    "date": "2025-08-01",
    "time": "10:00"
  }'
```

**Consultar una reserva:**

```bash
curl http://localhost:8080/api/bookings/1
```

**Agregar un servicio a una reserva existente:**

```bash
curl -X POST http://localhost:8080/api/bookings/1/services/2
```

Si se vuelve a ejecutar la misma request, la reserva no duplica el
servicio: incrementa `quantity` en 1.

## Manejo de errores

| Situación                                                     | Código |
| ---------------------------------------------------------------  | ------ |
| Crear un servicio o reserva sin los campos obligatorios          | `400`  |
| Consultar/actualizar/eliminar un `id` de servicio inexistente    | `404`  |
| Consultar una reserva inexistente                                | `404`  |
| Agregar un servicio inexistente a una reserva                    | `404`  |
| Agregar un servicio a una reserva inexistente                    | `404`  |

Todas las respuestas siguen el mismo formato:

```json
{ "status": "success", "payload": { } }
```

o

```json
{ "status": "error", "message": "..." }
```