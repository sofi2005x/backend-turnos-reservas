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

| Variable | Descripción                           | Ejemplo      |
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
  services/
    services.service.js        # reglas de negocio de servicios
    bookings.service.js        # reglas de negocio de reservas
  repositories/
    services.repository.js     # intermediario entre service y DAO
    bookings.repository.js     # intermediario entre service y DAO
  dao/
    services.dao.js            # lee/escribe directamente services.json
    bookings.dao.js            # lee/escribe directamente bookings.json
  routes/
    services.router.js         # define endpoints de /api/services
    bookings.router.js         # define endpoints de /api/bookings
  data/
    services.json               # persistencia de servicios
    bookings.json               # persistencia de reservas
```

## Arquitectura en capas

El proyecto separa responsabilidades en cinco capas, para que cada parte
tenga una única razón de cambiar y para poder migrar la persistencia en
el futuro (de FileSystem a MongoDB) modificando lo menos posible:

```
Cliente → Router → Controller → Service → Repository → DAO → Archivo JSON
```

| Capa           | Responsabilidad                                                                       | Qué NO hace                                                        |
| -------------- | ----------------------------------------------------------------------------------------- | -----------------------------------------------------          |
| **Router**     | Define la URL y el método HTTP, y los conecta con una función del controller             | No lee `req`, no llama a otras capas, no responde               |
| **Controller** | Lee `req.params` / `req.query` / `req.body`, llama al service y responde con `res.status().json()` | No conoce reglas de negocio ni accede a archivos JSON |
| **Service**    | Contiene las reglas de negocio (validaciones, qué está permitido hacer)                   | No conoce `req` ni `res`, no lee/escribe archivos              |
| **Repository** | Intermediario entre el service y el DAO; expone métodos de acceso a datos sin lógica      | No contiene reglas de negocio                                  |  
| **DAO**        | Lee y escribe directamente el archivo JSON correspondiente                                | No contiene reglas de negocio                                  |

**Ejemplo — `POST /api/services` (crear un servicio):**

1. `services.router.js` recibe la petición y la deriva a `createService`.
2. `services.controller.js` lee `req.body` y se lo pasa a
   `servicesService.createService(data)`.
3. `services.service.js` valida que estén todos los campos obligatorios
   (`name`, `description`, `duration`, `price`, `category`, `available`).
   Si falta alguno, corta ahí mismo con un error (`400`).
4. Si los datos son válidos, delega en `servicesRepository.create(data)`.
5. `services.repository.js` reenvía la llamada a `services.dao.js`.
6. `services.dao.js` lee `services.json`, genera el nuevo `id`
   (`Math.max` + 1), agrega el servicio y reescribe el archivo.
7. El resultado vuelve capa por capa hasta el controller, que responde
   `201` con el servicio creado.

**Regla de negocio destacada — `bookings`:** si al agregar un servicio a
una reserva (`POST /api/bookings/:bid/services/:sid`) ese servicio ya
estaba presente, `bookings.service.js` incrementa su `quantity` en vez
de duplicar la entrada. Esta decisión vive en el **service**, no en el
DAO, porque es una regla de negocio y no un detalle técnico de
persistencia.

Gracias a esta separación, el día que se migre de archivos JSON a
MongoDB (próxima etapa del curso), el cambio queda contenido
**únicamente en la capa DAO** — controllers, services, repositories y
routers permanecen exactamente iguales.

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

| Método | Ruta                 | Descripción                                                                                |
| ------ | -------------------- | ------------------------------------------------------------------------------------------ |
| GET    | `/api/services`      | Lista todos los servicios. Acepta filtros por query params: `?category=` y `?available=`   |
| GET    | `/api/services/:sid` | Devuelve un servicio por id                                                                |
| POST   | `/api/services`      | Crea un servicio (valida todos los campos)                                                 |
| PUT    | `/api/services/:sid` | Actualiza un servicio (ignora cualquier `id` recibido en el body)                          |
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

| Método | Ruta                                | Descripción                                                               |
| ------ | ------------------------------------| ------------------------------------------------------------------------- |
| POST   | `/api/bookings`                     | Crea una reserva (puede iniciarse con `services` vacío)                   |
| GET    | `/api/bookings/:bid`                | Devuelve una reserva por id                                               |
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