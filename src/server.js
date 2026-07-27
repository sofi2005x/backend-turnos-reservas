//este archivo se encarga de levantar el servidor, importamos la app y la configuracion del puerto, y luego llamamos al metodo listen para que el servidor empiece a escuchar en el puerto especificado.
import app from './app.js';
import config from './config/env.config.js';

app.listen(config.port, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${config.port}`);
});

