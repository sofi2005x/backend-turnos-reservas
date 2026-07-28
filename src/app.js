import express from 'express';
import servicesRouter from './routes/services.router.js';

const app = express(); //creamos la app de express -> se crea la aplicacion de express

app.use(express.json()); //recibir datos en formato json (post / put)

app.use('/api/services', servicesRouter);

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Sistema Backend de Turnos y Reservas — API funcionando',
  });   //para saber que la app funciona correctamente, hacemos un get a la ruta raiz y nos devuelve un mensaje de exito
});

export default app;