import http from 'http';
import config from './config/env.config.js';
import {services} from './data/services.js';
import { sendResponse } from './utils/sendResponse.js';    

//req  = request --- todo lo que entra a tu servidor (que esta consultando el frontend)
//res = response --- todo lo que sale de tu servidor (lo que envio, respuesta que mando al cliente)

//Acá creamos nuestro servidor 

const server = http.createServer((req, res) => {    
//necesito el método , es decir, que tipo de operación va a realizar el cliente (GET, POST, PUT, DELETE)
//necesito la URL (dirección hacia dónde va el cliente) ,es decir, a que recurso va a acceder el cliente ("/services", "/users", "/turns", etc)
// const method = req.method; //GET, POST, PUT, DELETE
//cnst url = req.url; //"/services", "/users", "/turns", etc

const { method, url } = req; //destructuring

console.info(` ${method} request received for ${url}`);

if (method === 'GET' && url === '/') {
   return sendResponse(res, 200 , {
    status: 'Server iniciado',

   })
}

if (method === 'GET' && url === '/api/services') {
    return sendResponse(res, 200 , {
        status: 'success',
        payload: services
    })
}

}); 

//importante: el servidor debe estar escuchando en un puerto para poder recibir las solicitudes del cliente (frontend)
server.listen(config.port, () => {
    console.info(`⚡️  Server is running on port ${config.port}`);
})

