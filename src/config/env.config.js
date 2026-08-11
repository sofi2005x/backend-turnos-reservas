//validación fail-fast
//process.env no lee automáticamente el archivo .env
//necesitamos dotenv para conectar ambas cosas.
//centralizamos todo el acceso a las variables de entorno en un solo archivo, para no tener que estar llamando a process.env en cada archivo que necesite una variable de entorno.

import dotenv from 'dotenv';
dotenv.config(); // Conecta el archivo .env con process.env

// Lista de variables que la app NO puede arrancar sin tener
const requiredVars = ['PORT', 'NODE_ENV'];

// Busca cuáles de esas variables NO están presentes en process.env
const missing = requiredVars.filter(key => !process.env[key]);

if (missing.length > 0) {
  // Fail-fast: mejor que no arranque el server, a que arranque roto
  console.error(`ERROR FATAL: Faltan las siguientes variables de entorno: ${missing.join(', ')}`);
  process.exit(1);
}

const 
config = {
  port: Number(process.env.PORT), // Number() porque process.env siempre da string
  nodeEnv: process.env.NODE_ENV,
  mongoUri: process.env.MONGO_URI
};

export default config; // Cualquier otro archivo importa este objeto ya validado