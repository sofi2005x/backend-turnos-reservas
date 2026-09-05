const socket = io();

// Escucha el evento emitido desde services.controller.js al crear un servicio
socket.on('serviceCreated', (newService) => {
  const container = document.getElementById('services-list');
  if (!container) return; // este script corre en todas las vistas, pero solo actuamos en /views/services

  const card = document.createElement('div');
  card.className = 'card' + (newService.available ? '' : ' unavailable');
  card.innerHTML = `
    <h2>${newService.name}</h2>
    <p>${newService.description}</p>
    <p>Duración: ${newService.duration} minutos</p>
    <p>Precio: $${newService.price}</p>
    <p>Categoría: ${newService.category}</p>
    <p>Disponible: ${newService.available ? 'Sí' : 'No'}</p>
  `;
  container.appendChild(card);
});

//Este es el script que corre en el navegador del cliente, y se conecta al servidor de WebSocket que corre en el backend.