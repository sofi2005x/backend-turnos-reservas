# Sistema Backend de Turnos y Reservas

API REST construida con **Node.js**, **Express** y **MongoDB**, que gestiona dos recursos —
**servicios** y **reservas** — persistiendo los datos en una base de datos NoSQL mediante
**Mongoose**.

Este proyecto corresponde a la pre-entrega "Consultas avanzadas, validación y relaciones con
populate" del curso de Backend Avanzado, que se suma sobre la migración a MongoDB con Mongoose
ya realizada previamente. La arquitectura en capas se mantiene intacta: se incorporaron filtros,
paginación y ordenamiento en servicios; validación de datos con Zod en servicios y reservas; y
relaciones entre colecciones usando `populate`, sin modificar el comportamiento de los endpoints
existentes.

## Tecnologías utilizadas

- Node.js (ESM — `"type": "module"`)
- Express 5
- MongoDB Atlas (base de datos en la nube)
- Mongoose (ODM para MongoDB)
- Zod (validación de datos de entrada)
- Handlebars (motor de plantillas para vistas server-side)
- Socket.io (comunicación en tiempo real)
- dotenv (variables de entorno)

## Instalación

```bash
git clone https://github.com/sofi2005x/backend-turnos-reservas.git
cd backend-turnos-reservas
npm install
```

## Variables de entorno

Copiar `.env.example` a `.env` y completar:

| Variable  | Descripción                                              | Ejemplo                                                   |
| --------  | -------------------------------------------------------- | --------------------------------------------------------- |
| PORT      | Puerto en el que escucha el servidor                     | 8080                                                      |
| NODE_ENV  | Entorno de ejecución                                     | development                                               |
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
  app.js                       # configura Express, middlewares, archivos estáticos, motor de vistas y rutas
  server.js                    # crea el servidor HTTP + Socket.io, conecta la DB y levanta el server
  config/
    db.js                      # conexión a MongoDB con Mongoose
  controllers/
    services.controller.js     # lógica de request/response de servicios
    bookings.controller.js     # lógica de request/response de reservas
    views.controller.js        # lógica de renderizado de vistas HTML
  services/
    services.service.js        # reglas de negocio de servicios
    bookings.service.js        # reglas de negocio de reservas
  repositories/
    services.repository.js     # intermediario entre service y DAO; arma filtros, orden y paginación
    bookings.repository.js     # intermediario entre service y DAO
  validations/
    service.validation.js      # schemas Zod para crear/actualizar un servicio
    booking.validation.js      # schemas Zod para crear una reserva y agregar un servicio a una reserva
  middlewares/
    validate.middleware.js     # validateBody / validateParams: corta con 400 antes de llegar al controller
  models/
    service.model.js           # esquema Mongoose de servicios
    booking.model.js           # esquema Mongoose de reservas (services: referencias por ObjectId)
    message.model.js           # esquema Mongoose de mensajes
  dao/
    services.dao.js            # operaciones de servicios en MongoDB (find, sort, skip, limit, countDocuments)
    bookings.dao.js             # operaciones de reservas en MongoDB (populate de services.service)
  routes/
    services.router.js         # define endpoints de /api/services + validaciones
    bookings.router.js         # define endpoints de /api/bookings + validaciones
    views.router.js             # define endpoints de /views (HTML)
  views/
    layouts/
      main.handlebars          # layout base: carga style.css, socket.io y socket.js
    services.handlebars        # vista de listado de servicios
    bookings.handlebars        # vista de listado de reservas
    booking-detail.handlebars  # vista de detalle de una reserva puntual
  dependencies/
    index.js                   # inyección centralizada de dependencias
public/
  css/
    style.css                  # estilos de las vistas
  js/
    socket.js                  # cliente de Socket.io, escucha eventos y actualiza el DOM
```

## Arquitectura en capas

El proyecto mantiene la separación de responsabilidades en capas, permitiendo cambios
en la persistencia sin afectar las capas superiores:

```
Cliente → Router → Middleware de validación (Zod) → Controller → Service → Repository → DAO → Model → MongoDB
```

| Capa           | Responsabilidad                                                                          | Qué NO hace                                                        |
| -------------- | ---------------------------------------------------------------------------------------  | ------------------------------------------------------------------ |
| **Router**     | Define la URL, el método HTTP y encadena el middleware de validación con el controller    | No lee `req`, no valida datos, no llama a otras capas, no responde  |
| **Middleware de validación** | Valida `body` o `params` contra un schema de Zod antes de llegar al controller | No conoce reglas de negocio, no accede a la BD                     |
| **Controller** | Lee `req.params` / `req.query` / `req.body` (ya validados), llama al service y responde con `res.status().json()` (o `res.render()` en las vistas) | No conoce reglas de negocio ni accede a la BD |
| **Service**    | Contiene las reglas de negocio (validaciones de negocio, qué está permitido hacer)         | No conoce `req` ni `res`, no accede directamente a la BD           |
| **Repository** | Intermediario entre el service y el DAO; arma filtros, paginación y ordenamiento sin lógica de negocio | No contiene reglas de negocio                        |
| **DAO**        | Opera directamente sobre las colecciones de MongoDB, usando los models de Mongoose        | No contiene reglas de negocio, no define esquemas                  |
| **Model**      | Define el esquema Mongoose de cada colección (campos, tipos, validaciones de estructura)  | No accede a la base de datos por sí solo, no contiene lógica       |

**Ejemplo — `POST /api/services` (crear un servicio):**

1. `services.router.js` recibe la petición y la pasa primero por `validateBody(createServiceSchema)`.
2. Si el `body` no cumple el schema (falta `name`, `price` es negativo, etc.), el middleware corta
   ahí mismo con `400` y un mensaje claro — **nunca llega a tocar MongoDB**.
3. Si es válido, la deriva a `createService` en `services.controller.js`, que lee `req.body`
   (ya limpio, sin campos extra) y se lo pasa a `servicesService.createService(data)`.
4. `services.service.js` delega en `servicesRepository.create(data)`.
5. `services.repository.js` reenvía la llamada a `services.dao.js`.
6. `services.dao.js` crea un documento en la colección `services` usando
   `ServiceModel.create()` (el model importado desde `src/models/`).
   MongoDB genera automáticamente el `_id` (ObjectId).
7. El resultado vuelve capa por capa hasta el controller, que emite el
   evento `serviceCreated` por Socket.io y responde `201` con el servicio creado.

**Ejemplo — `GET /views/services` (renderizar el listado de servicios):**

1. `views.router.js` recibe la petición y la deriva a `renderServices`.
2. `views.controller.js` llama a `servicesService.getServices()` — la
   misma capa de servicio que usa la API REST, sin duplicar lógica.
3. El controller le pasa los datos a `res.render('services', { services })`.
4. Express usa `services.handlebars` (envuelto por `layouts/main.handlebars`)
   para armar el HTML final y devolverlo al navegador.

**Regla de negocio destacada — `bookings`:** si al agregar un servicio a
una reserva (`POST /api/bookings/:bid/services/:sid`) ese servicio ya
estaba presente, `bookings.service.js` incrementa su `quantity` en vez
de duplicar la entrada. Esta decisión vive en el **service**, no en el
DAO, porque es una regla de negocio y no un detalle técnico de
persistencia.

Gracias a esta separación, la migración de archivos JSON a MongoDB quedó
contenida **únicamente en la capa DAO/Model**, la incorporación de vistas
con Handlebars y Socket.io quedó contenida en la **capa de controllers y
presentación**, y la incorporación de consultas avanzadas y validaciones
quedó contenida en la **capa de repository** y en una **capa de
middlewares/validations nueva** — en ningún caso se tocó la lógica de
negocio existente.

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

### Validación (Zod)

Definida en `src/validations/service.validation.js` y aplicada como middleware en el router:

| Endpoint | Schema | Reglas |
| -------- | ------ | ------ |
| `POST /api/services` | `createServiceSchema` | `name`, `description`, `category`: string no vacío. `duration`: número positivo. `price`: número ≥ 0. `available`: boolean, opcional. |
| `PUT /api/services/:sid` | `updateServiceSchema` (`createServiceSchema.partial()`) | Mismas reglas que arriba, pero todos los campos son opcionales (permite actualizar solo algunos). |

Si el `body` no cumple el schema, la respuesta es `400` con un mensaje descriptivo
**antes** de que el controller o Mongoose intervengan. Ejemplo:

```bash
curl -X POST http://localhost:8080/api/services \
  -H "Content-Type: application/json" \
  -d '{"name": "", "price": -100}'
```

```json
{
  "status": "error",
  "message": "name es obligatorio, description es obligatorio, duration debe ser mayor a 0, price no puede ser negativo, category es obligatorio"
}
```

### Endpoints

| Método | Ruta                 | Descripción                                                                                |
| ------ | -------------------- | ------------------------------------------------------------------------------------------ |
| GET    | `/api/services`      | Lista servicios con filtros, ordenamiento y paginación (ver más abajo)                     |
| GET    | `/api/services/:sid` | Devuelve un servicio por id                                                                |
| POST   | `/api/services`      | Crea un servicio (validado con Zod) y emite el evento `serviceCreated` por socket          |
| PUT    | `/api/services/:sid` | Actualiza un servicio (validado con Zod, ignora cualquier `_id` recibido en el body)       |
| DELETE | `/api/services/:sid` | Elimina un servicio                                                                        |

### Consultas avanzadas en `GET /api/services`

Acepta los siguientes query params, todos opcionales y combinables entre sí:

| Query param | Descripción                                                   | Ejemplo              |
| ----------- | -------------------------------------------------------------- | ---------------     |
| `category`  | Filtra por categoría exacta                                    | `category=estetica` |
| `available` | Filtra por disponibilidad (`"true"` o `"false"`)               | `available=true`    |
| `page`      | Página a devolver (por defecto `1`)                            | `page=2`            |
| `limit`     | Cantidad de resultados por página (por defecto `10`)           | `limit=5`           |
| `sortBy`    | Campo por el cual ordenar (por defecto `name`)                 | `sortBy=price`      |
| `order`     | Dirección del orden: `asc` (por defecto) o `desc`              | `order=desc`        |

La respuesta incluye el listado en `payload` y los metadatos de paginación al mismo nivel:

```json
{
  "status": "success",
  "payload": [ /* array de servicios */ ],
  "totalResults": 23,
  "page": 2,
  "limit": 5,
  "totalPages": 5,
  "hasPrevPage": true,
  "hasNextPage": true
}
```

### Ejemplos

**Filtrar por categoría y disponibilidad:**

```bash
curl "http://localhost:8080/api/services?category=estetica&available=true"
```

**Paginar (página 2, 5 resultados por página):**

```bash
curl "http://localhost:8080/api/services?page=2&limit=5"
```

**Ordenar por precio, de mayor a menor:**

```bash
curl "http://localhost:8080/api/services?sortBy=price&order=desc"
```

**Combinar filtros, orden y paginación:**

```bash
curl "http://localhost:8080/api/services?category=peluqueria&available=true&sortBy=price&order=asc&page=1&limit=10"
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

Cada reserva se **persiste** guardando solo referencias (`ObjectId`) a los servicios, nunca
el objeto completo:

```json
{
  "_id": "6a7ab016302b05041d1dc99a",
  "clientName": "Ana Perez",
  "clientEmail": "ana@test.com",
  "date": "2025-08-01",
  "time": "10:00",
  "status": "pending",
  "services": [
    { "service": "6a7ab016302b05041d1dc998", "quantity": 1 }
  ]
}
```

Al **consultar** una reserva (`GET /api/bookings/:bid`, `GET /api/bookings` o tras un
`POST /api/bookings/:bid/services/:sid`), `bookings.dao.js` usa `.populate('services.service')`,
así que la respuesta trae el documento completo de cada servicio asociado:

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
- `status`: si no se envía, toma el valor por defecto `"pending"`. Solo acepta `"pending"`,
  `"confirmed"` o `"cancelled"`.
- `services`: en la base es un array de **referencias** (`{ service: ObjectId, quantity: Number }`).
  El objeto completo del servicio nunca se guarda ni se duplica ahí — se resuelve al consultar,
  vía `populate`. Si se agrega el mismo servicio más de una vez, **se incrementa `quantity`** en
  lugar de duplicar la entrada.

### Validación (Zod)

Definida en `src/validations/booking.validation.js` y aplicada como middleware en el router:

| Endpoint | Schema | Reglas |
| -------- | ------ | ------ |
| `POST /api/bookings` | `createBookingSchema` | `clientName`, `date`, `time`: string no vacío. `clientEmail`: formato de email válido. `status`: opcional, solo `pending`/`confirmed`/`cancelled`. `services`: opcional, array de `{ service: ObjectId válido, quantity: entero positivo opcional }`. |
| `POST /api/bookings/:bid/services/:sid` | `bookingServiceParamsSchema` | `bid` y `sid` deben ser ObjectIds válidos (24 caracteres hexadecimales). |

Ejemplo de un `body` inválido, cortado antes de llegar a MongoDB:

```bash
curl -X POST http://localhost:8080/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"clientName": "Ana", "clientEmail": "no-es-un-email", "date": "2025-08-01", "time": "10:00"}'
```

```json
{ "status": "error", "message": "clientEmail debe ser un email válido" }
```

### Endpoints

| Método | Ruta                                | Descripción                                                                |
| ------ | ------------------------------------| --------------------------------------------------------------------       |
| POST   | `/api/bookings`                     | Crea una reserva (validada con Zod; puede iniciarse con `services` vacío)  |
| GET    | `/api/bookings/:bid`                | Devuelve una reserva por id, con datos completos de servicios (`populate`) |
| POST   | `/api/bookings/:bid/services/:sid`  | Agrega un servicio a una reserva existente (params validados con Zod)      |

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

**Consultar una reserva (con servicios completos, gracias a `populate`):**

```bash
curl http://localhost:8080/api/bookings/6a7ab016302b05041d1dc99a
```

**Agregar un servicio a una reserva existente:**

```bash
curl -X POST http://localhost:8080/api/bookings/6a7ab016302b05041d1dc99a/services/6a7ab016302b05041d1dc998
```

Si se vuelve a ejecutar la misma request, la reserva no duplica el
servicio: incrementa `quantity` en 1.

## Vistas con Handlebars

Además de la API REST, el proyecto expone vistas HTML renderizadas del lado
del servidor, para visualizar servicios y reservas sin necesidad de una
aplicación frontend completa. Las vistas reutilizan la misma capa de
`service` que usa la API — no hay lógica de negocio duplicada, solo cambia
cómo se responde (`res.render` en vez de `res.json`).

### Endpoints

| Método | Ruta                       | Descripción                                                           |
| ------ | -------------------------- | ----------------------------------------------------------------------- |
| GET    | `/views/services`          | Renderiza el listado completo de servicios                            |
| GET    | `/views/bookings`          | Renderiza el listado completo de reservas                             |
| GET    | `/views/bookings/:bid`     | Renderiza el detalle de una reserva puntual, con sus servicios        |

### Ejemplos

**Ver el listado de servicios:**

```
http://localhost:8080/views/services
```

**Ver el listado de reservas:**

```
http://localhost:8080/views/bookings
```

**Ver el detalle de una reserva:**

```
http://localhost:8080/views/bookings/6a7ab016302b05041d1dc99a
```

El `id` de una reserva se obtiene desde MongoDB Compass/Atlas (colección
`bookings`) o desde la respuesta de `POST /api/bookings`.

## Comunicación en tiempo real con Socket.io

El servidor HTTP (`server.js`) se envuelve con `http.createServer` para
poder montar una instancia de Socket.io sobre el mismo puerto que usa
Express. Esa instancia se guarda en la app (`app.set('io', io)`) para que
cualquier controller pueda emitir eventos sin pasarla a mano por todas
las capas.

Al crear un servicio (`POST /api/services`), una vez que el documento se
guardó correctamente en MongoDB, el controller emite el evento
`serviceCreated` con el servicio recién creado. Del lado del navegador,
`public/js/socket.js` escucha ese evento y agrega la nueva tarjeta a la
vista `/views/services` sin recargar la página.

### Cómo probarlo

1. Abrir dos pestañas en `http://localhost:8080/views/services`
2. Desde Postman/Thunder Client, hacer un `POST /api/services` con un servicio nuevo
3. Verificar que la tarjeta nueva aparece sola, en ambas pestañas, sin recargar

## Cambios en esta entrega — Consultas avanzadas, validación y populate (Módulo 8)

- **Consultas avanzadas en servicios:** `GET /api/services` acepta `category`, `available`,
  `page`, `limit`, `sortBy` y `order`. El filtro y el ordenamiento se arman dinámicamente en
  `services.repository.js`, y la respuesta incluye metadatos de paginación
  (`totalResults`, `page`, `limit`, `totalPages`, `hasPrevPage`, `hasNextPage`).
- **Validación con Zod:** se agregó la carpeta `validations/` con schemas para crear/actualizar
  un servicio (ya existía) y se **extendió a reservas**: crear una reserva
  (`createBookingSchema`) y agregar un servicio a una reserva (`bookingServiceParamsSchema`,
  que valida que `bid` y `sid` sean ObjectIds válidos). Los schemas se aplican como
  middleware (`validateBody` / `validateParams`) directamente en los routers, nunca dentro
  de los controllers ni de los models.
- **Relaciones con `populate`:** el modelo de `booking` guarda los servicios como referencias
  (`{ service: ObjectId, quantity: Number }`), nunca como objeto completo. Al consultar una
  reserva (`getAll`, `getById`, y tras `update`), `bookings.dao.js` resuelve esas referencias
  con `.populate('services.service')`, devolviendo el documento completo de cada servicio.
- **Sin romper comportamiento existente:** todos los endpoints que ya funcionaban antes
  (CRUD de servicios, alta de reservas, agregar servicio a una reserva) siguen respondiendo
  igual; lo único que cambia es que ahora hay una validación previa y una consulta más rica.

## Cambios en la migración a MongoDB (Módulo 7)

- **Persistencia:** cambio de archivos JSON locales a MongoDB Atlas en la nube.
- **Modelos:** implementación de tres esquemas Mongoose (`service`, `booking`, `message`).
- **IDs:** cambio de números enteros a ObjectIds de MongoDB (formato: `ObjectId('...')`).
- **Populate:** uso de `.populate()` en bookings para obtener datos completos de servicios.
- **Seeds:** script automático para poblar la base de datos con datos iniciales.
- **Inyección de dependencias:** carpeta `dependencies/` para centralizar imports.
- **Comparaciones:** actualización de lógica para comparar ObjectIds usando `.equals()` o `.toString()`.

## Cambios en Vistas con Handlebars y Socket.io (Módulo 6)

- **Motor de vistas:** incorporación de `express-handlebars` como view engine de Express, y `express.static` para servir la carpeta `public/`.
- **Nueva capa de presentación:** `views.controller.js`, `views.router.js` y la carpeta `views/`, conectados en `app.js`.
- **Reutilización de lógica:** las vistas llaman a los mismos `services` (`servicesService`, `bookingsService`) que usa la API REST, sin duplicar reglas de negocio.
- **Vistas disponibles:** listado de servicios, listado de reservas y detalle de reserva puntual.
- **Tiempo real:** incorporación de `socket.io`, envolviendo el servidor con `http.createServer` y guardando la instancia de `io` en la app.
- **Evento implementado:** `createService` emite `serviceCreated` tras persistir el servicio; `public/js/socket.js` lo escucha y actualiza el DOM sin recargar la página.
- **Refactor de arquitectura:** se movió la carpeta `models/` fuera de `dao/` para respetar la separación de capas (los models definen esquemas, los DAO operan sobre ellos; son responsabilidades distintas).

## Manejo de errores

| Situación                                                        | Código |
| ---------------------------------------------------------------  | ------ |
| Crear un servicio con datos inválidos (Zod)                      | `400`  |
| Actualizar un servicio con datos inválidos (Zod)                  | `400`  |
| Crear una reserva sin `clientEmail`/`date`/`time` o con formato inválido (Zod) | `400` |
| Agregar un servicio a una reserva con `bid`/`sid` que no son ObjectId válido (Zod) | `400` |
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