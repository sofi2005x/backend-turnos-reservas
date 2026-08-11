# Sistema Backend de Turnos y Reservas

API REST construida con **Node.js**, **Express** y **MongoDB**, que gestiona dos recursos —
**servicios** y **reservas** — persistiendo los datos en una base de datos NoSQL mediante
**Mongoose**.

Este proyecto corresponde a la pre-entrega "Migración a MongoDB con Mongoose" del curso de
Backend Avanzado. La arquitectura en capas se mantiene intacta, reemplazando únicamente la
persistencia de archivos JSON por una base de datos MongoDB Atlas.

## Tecnologías utilizadas

- Node.js (ESM — `"type": "module"`)
- Express 5
- MongoDB Atlas (base de datos en la nube)
- Mongoose (ODM para MongoDB)
- dotenv (variables de entorno)

## Instalación

```bash
git clone https://github.com/sofi2005x/backend-turnos-reservas.git
cd backend-turnos-reservas
npm install
```

## Variables de entorno

Copiar `.env.example` a `.env` y completar:

| Variable | Descripción                                              | Ejemplo                                                   |
| -------- | -------------------------------------------------------- | --------------------------------------------------------- |
| PORT     | Puerto en el que escucha el servidor                     | 8080                                                      |
| NODE_ENV | Entorno de ejecución                                     | development                                              |
| MONGO_URI | URI de conexión a MongoDB Atlas | mongodb+srv://usuario:password@cluster.mongodb.net/... |

Si falta alguna variable obligatoria, la app **no arranca** y muestra un
error explícito en consola.

## Ejecución

```bash
npm start   # levanta el servidor una sola vez
npm run dev # levanta el servidor con reinicio automático (node --watch)
npm run seed # puebla la base de datos con datos iniciales
```

Si todo carga bien, vas a ver en la consola:

```
✅ MongoDB conectado: ...
🚀 Servidor escuchando en http://localhost:8080
```

## Estructura del proyecto

```
src/
  app.js                       # configura Express, middlewares y rutas
  server.js                    # levanta el servidor (app.listen) e inicializa DB
  config/
    db.js                      # conexión a MongoDB con Mongoose
  controllers/
    services.controller.js     # lógica de request/response de servicios
    bookings.controller.js     # lógica de request/response de reservas
  services/
    services.service.js        # reglas de negocio de servicios
    bookings.service.js        # reglas de negocio de reservas
  repositories/
    services.repository.js     # intermediario entre service y DAO
    bookings.repository.js     # intermediario entre service y DAO
  dao/
    models/
      service.model.js         # esquema Mongoose de servicios
      booking.model.js         # esquema Mongoose de reservas
      message.model.js         # esquema Mongoose de mensajes
    services.dao.js            # operaciones de servicios en MongoDB
    bookings.dao.js            # operaciones de reservas en MongoDB
  routes/
    services.router.js         # define endpoints de /api/services
    bookings.router.js         # define endpoints de /api/bookings
  dependencies/
    index.js                   # inyección centralizada de dependencias
```

## Arquitectura en capas

El proyecto mantiene la separación de responsabilidades en cinco capas, permitiendo cambios
en la persistencia sin afectar las capas superiores:

```
Cliente → Router → Controller → Service → Repository → DAO → MongoDB
```

| Capa           | Responsabilidad                                                                       | Qué NO hace                                                        |
| -------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **Router**     | Define la URL y el método HTTP, y los conecta con una función del controller             | No lee `req`, no llama a otras capas, no responde                  |
| **Controller** | Lee `req.params` / `req.query` / `req.body`, llama al service y responde con `res.status().json()` | No conoce reglas de negocio ni accede a la BD                      |
| **Service**    | Contiene las reglas de negocio (validaciones, qué está permitido hacer)                   | No conoce `req` ni `res`, no accede directamente a la BD           |
| **Repository** | Intermediario entre el service y el DAO; expone métodos de acceso a datos sin lógica      | No contiene reglas de negocio                                      |
| **DAO**        | Opera directamente sobre las colecciones de MongoDB mediante Mongoose                     | No contiene reglas de negocio                                      |

**Ejemplo — `POST /api/services` (crear un servicio):**

1. `services.router.js` recibe la petición y la deriva a `createService`.
2. `services.controller.js` lee `req.body` y se lo pasa a
   `servicesService.createService(data)`.
3. `services.service.js` valida que estén todos los campos obligatorios
   (`name`, `description`, `duration`, `price`, `category`, `available`).
   Si falta alguno, corta ahí mismo con un error (`400`).
4. Si los datos son válidos, delega en `servicesRepository.create(data)`.
5. `services.repository.js` reenvía la llamada a `services.dao.js`.
6. `services.dao.js` crea un documento en la colección `services` usando
   `ServiceModel.create()`. MongoDB genera automáticamente el `_id` (ObjectId).
7. El resultado vuelve capa por capa hasta el controller, que responde
   `201` con el servicio creado.

**Regla de negocio destacada — `bookings`:** si al agregar un servicio a
una reserva (`POST /api/bookings/:bid/services/:sid`) ese servicio ya
estaba presente, `bookings.service.js` incrementa su `quantity` en vez
de duplicar la entrada. Esta decisión vive en el **service**, no en el
DAO, porque es una regla de negocio y no un detalle técnico de
persistencia.

Gracias a esta separación, la migración de archivos JSON a MongoDB quedó
contenida **únicamente en la capa DAO** — controllers, services, repositories y
routers permanecen exactamente iguales.

## Recurso: `services`

Cada servicio tiene la forma:

```json
{
  "_id": "6a7ab016302b05041d1dc998",
  "name": "Corte de cabello",
  "description": "Corte clásico",
  "duration": 30,
  "price": 5000,
  "category": "peluqueria",
  "available": true,
  "createdAt": "2026-08-11T05:16:06.044Z",
  "updatedAt": "2026-08-11T05:16:06.044Z"
}
```

- `_id`: ObjectId generado automáticamente por MongoDB, nunca se recibe desde el body.
- `duration`: minutos que dura el servicio.
- `price`: precio en la moneda local.
- `category`: rubro del servicio (ej. `peluqueria`, `estetica`, `bienestar`).
- `available`: si el servicio está disponible (`false` es un valor válido).
- `createdAt` / `updatedAt`: timestamps automáticos de Mongoose.

### Endpoints

| Método | Ruta                 | Descripción                                                                                |
| ------ | -------------------- | ------------------------------------------------------------------------------------------ |
| GET    | `/api/services`      | Lista todos los servicios. Acepta filtros por query params: `?category=` y `?available=`   |
| GET    | `/api/services/:sid` | Devuelve un servicio por id                                                                |
| POST   | `/api/services`      | Crea un servicio (valida todos los campos)                                                 |
| PUT    | `/api/services/:sid` | Actualiza un servicio (ignora cualquier `_id` recibido en el body)                         |
| DELETE | `/api/services/:sid` | Elimina un servicio                                                                        |

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

**Actualizar un servicio (el _id nunca cambia, aunque se mande en el body):**

```bash
curl -X PUT http://localhost:8080/api/services/6a7ab016302b05041d1dc998 \
  -H "Content-Type: application/json" \
  -d '{"price": 6000}'
```

**Eliminar un servicio:**

```bash
curl -X DELETE http://localhost:8080/api/services/6a7ab016302b05041d1dc998
```

## Recurso: `bookings`

Cada reserva tiene la forma:

```json
{
  "_id": "6a7ab016302b05041d1dc99a",
  "clientName": "Ana Perez",
  "clientEmail": "ana@test.com",
  "date": "2025-08-01",
  "time": "10:00",
  "status": "pending",
  "services": [
    {
      "service": {
        "_id": "6a7ab016302b05041d1dc998",
        "name": "Corte de cabello",
        "description": "Corte clásico",
        "duration": 30,
        "price": 5000,
        "category": "peluqueria",
        "available": true
      },
      "quantity": 1
    }
  ],
  "createdAt": "2026-08-11T05:16:06.044Z",
  "updatedAt": "2026-08-11T05:16:06.044Z"
}
```

- `_id`: ObjectId generado automáticamente.
- `status`: si no se envía, toma el valor por defecto `"pending"`.
- `services`: array de referencias a servicios existentes. Cada entrada
  guarda el documento completo del servicio (gracias a `.populate()`) y una `quantity`.
  Si se agrega el mismo servicio más de una vez, **se incrementa `quantity`** en
  lugar de duplicar la entrada.

### Endpoints

| Método | Ruta                                | Descripción                                                               |
| ------ | ------------------------------------| -------------------------------------------------------------------- |
| POST   | `/api/bookings`                     | Crea una reserva (puede iniciarse con `services` vacío)                   |
| GET    | `/api/bookings/:bid`                | Devuelve una reserva por id (con datos completos de servicios)             |
| POST   | `/api/bookings/:bid/services/:sid`  | Agrega un servicio a una reserva existente, validando que ambos existan   |

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
curl http://localhost:8080/api/bookings/6a7ab016302b05041d1dc99a
```

**Agregar un servicio a una reserva existente:**

```bash
curl -X POST http://localhost:8080/api/bookings/6a7ab016302b05041d1dc99a/services/6a7ab016302b05041d1dc998
```

Si se vuelve a ejecutar la misma request, la reserva no duplica el
servicio: incrementa `quantity` en 1.

## Cambios en la migración a MongoDB (Módulo 7)

- **Persistencia:** cambio de archivos JSON locales a MongoDB Atlas en la nube.
- **Modelos:** implementación de tres esquemas Mongoose (`service`, `booking`, `message`).
- **IDs:** cambio de números enteros a ObjectIds de MongoDB (formato: `ObjectId('...')`).
- **Populate:** uso de `.populate()` en bookings para obtener datos completos de servicios.
- **Seeds:** script automático para poblar la base de datos con datos iniciales.
- **Inyección de dependencias:** carpeta `dependencies/` para centralizar imports.
- **Comparaciones:** actualización de lógica para comparar ObjectIds usando `.equals()` o `.toString()`.

## Manejo de errores

| Situación                                                     | Código |
| --------------------------------------------------------------- | ------ |
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