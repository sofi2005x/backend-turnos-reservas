import express from 'express'; //importar express para poder crear la app y manejar las rutas
import { engine } from 'express-handlebars';
import servicesRouter from './routes/services.router.js'; //importar los routers de diferentes recursos (servicios y reservas) para poder usarlos en la app
import bookingsRouter from './routes/bookings.router.js'; //
import viewsRouter from './routes/views.router.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express(); //creamos la app de express -> se crea la aplicacion de express

// Middlewares
app.use(express.json()); //recibir datos en formato json (post / put)
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public'))); //Esto es lo que hace que el style.css y socket.js respondan cuando el navegador les pide, ya que los archivos estaticos estan en la carpeta public, y express.static sirve para decirle a express que esa carpeta es de archivos estaticos, y que los sirva cuando el navegador los pida. Esto es necesario para que el style.css y socket.js funcionen correctamente, ya que si no se hace esto, el navegador no puede acceder a esos archivos y no se aplican los estilos ni se ejecuta el script de socket.js.

// Configuración de Handlebars como motor de vistas
app.engine('handlebars', engine({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  helpers: {
    eq: (a, b) => a === b,
  },
  runtimeOptions: {
    allowProtoPropertiesByDefault: true,
    allowProtoMethodsByDefault: true,
  },
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Rutas
app.use('/api/services', servicesRouter);//agregamos el router de servicios a la app, para que pueda manejar las rutas de servicios
app.use('/api/bookings', bookingsRouter); //agregamos el router de reservas a la app, para que pueda manejar las rutas de reservas
//Con el app.use le dice que la ruta final es /api/services/getServices, y que la funcion que maneja esa ruta es getServices, que esta definida en el controller de servicios. El router solo define la ruta y la conecta con la funcion del controller, mientras que la logica de negocio se maneja en el controller y el manager. Esto permite una separacion clara de responsabilidades y facilita el mantenimiento del codigo.
app.use('/views', viewsRouter);

app.get('/', (req, res) => { //punto de verificación de que la app funciona correctamente, devuelve un mensaje de exito
  res.status(200).json({
    status: 'success',
    message: 'Sistema Backend de Turnos y Reservas — API funcionando',
  });   //para saber que la app funciona correctamente, hacemos un get a la ruta raiz y nos devuelve un mensaje de exito
});

export { app };
