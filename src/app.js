import express from 'express'; //importar express para poder crear la app y manejar las rutas
import servicesRouter from './routes/services.router.js'; //importar los routers de diferentes recursos (servicios y reservas) para poder usarlos en la app
import bookingsRouter from './routes/bookings.router.js'; //

const app = express(); //creamos la app de express -> se crea la aplicacion de express

// Middlewares
app.use(express.json()); //recibir datos en formato json (post / put)
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/services', servicesRouter);//agregamos el router de servicios a la app, para que pueda manejar las rutas de servicios
app.use('/api/bookings', bookingsRouter); //agregamos el router de reservas a la app, para que pueda manejar las rutas de reservas
//Con el app.use le dice que la ruta fin       al es /api/services/getServices, y que la funcion que maneja esa ruta es getServices, que esta definida en el controller de servicios. El router solo define la ruta y la conecta con la funcion del controller, mientras que la logica de negocio se maneja en el controller y el manager. Esto permite una separacion clara de responsabilidades y facilita el mantenimiento del codigo.

app.get('/', (req, res) => { //punto de verificación de que la app funciona correctamente, devuelve un mensaje de exito
  res.status(200).json({
    status: 'success',
    message: 'Sistema Backend de Turnos y Reservas — API funcionando',
  });   //para saber que la app funciona correctamente, hacemos un get a la ruta raiz y nos devuelve un mensaje de exito
});

export { app };
