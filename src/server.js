import dotenv from 'dotenv';
dotenv.config();

import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { app } from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 8080;

// Envolvemos la app de Express en un servidor HTTP nativo,
// para poder colgar Socket.io del mismo servidor y puerto.
const httpServer = createServer(app);
const io = new Server(httpServer);

// Guardamos io en la app para que cualquier controller pueda
// acceder a él con req.app.get('io'), sin pasarlo a mano por todos lados.
app.set('io', io);

io.on('connection', (socket) => {
  console.log('Cliente conectado por WebSocket:', socket.id);

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

const startServer = async () => {
  await connectDB();
  httpServer.listen(PORT, () => { //quien escucha el puerto ahora es el servidor HTTP , no la app de Express directamente
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
  });
};

startServer();