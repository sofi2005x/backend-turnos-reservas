const socket = io();

// Escucha el evento emitido desde services.controller.js al crear un servicio
socket.on('serviceCreated', (newService) => {
  const container = document.getElementById('services-list');
  if (!container) return;

  // Si había un mensaje de "no se encontraron servicios", lo limpiamos
  if (container.children.length === 1 && container.children[0].textContent.includes('No se encontraron')) {
    container.innerHTML = '';
  }

  const card = document.createElement('div');
  card.className = 'card' + (newService.available ? '' : ' unavailable');
  card.style.animation = 'fadeIn 0.4s ease';
  card.innerHTML = `
    <div>
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.5rem;">
        <h2>${newService.name}</h2>
        ${newService.available 
          ? '<span class="badge badge-success">Disponible</span>' 
          : '<span class="badge badge-danger">Agotado</span>'}
      </div>
      <p style="margin-bottom: 0.8rem;">${newService.description}</p>
      <p><strong>Categoría:</strong> <span class="badge badge-default">${newService.category}</span></p>
      <p><strong>Duración:</strong> ${newService.duration} min</p>
    </div>
    <p class="price-tag">$${newService.price}</p>
  `;
  container.prepend(card);
});

// Lógica para desplegar el formulario y enviar petición POST con validación Zod
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggle-form-btn');
  const panel = document.getElementById('create-service-panel');
  const cancelBtn = document.getElementById('cancel-form-btn');
  const form = document.getElementById('create-service-form');
  const errorMsg = document.getElementById('form-error-msg');

  if (toggleBtn && panel) {
    toggleBtn.addEventListener('click', () => {
      const isHidden = panel.style.display === 'none' || panel.style.display === '';
      panel.style.display = isHidden ? 'block' : 'none';
      toggleBtn.textContent = isHidden ? 'Cerrar Formulario' : 'Nuevo Servicio';
    });
  }

  if (cancelBtn && panel) {
    cancelBtn.addEventListener('click', () => {
      panel.style.display = 'none';
      if (toggleBtn) toggleBtn.textContent = 'Nuevo Servicio';
      if (errorMsg) errorMsg.style.display = 'none';
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (errorMsg) errorMsg.style.display = 'none';

      const formData = new FormData(form);
      const serviceData = {
        name: formData.get('name'),
        description: formData.get('description'),
        category: formData.get('category'),
        duration: Number(formData.get('duration')),
        price: Number(formData.get('price')),
        available: formData.get('available') === 'on',
      };

      try {
        const response = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(serviceData),
        });

        const result = await response.json();

        if (!response.ok) {
          if (errorMsg) {
            errorMsg.textContent = `Error de Validación: ${result.message || 'Datos inválidos'}`;
            errorMsg.style.display = 'block';
          }
          return;
        }

        // Éxito: limpiar formulario y cerrar panel
        form.reset();
        if (panel) panel.style.display = 'none';
        if (toggleBtn) toggleBtn.textContent = 'Nuevo Servicio';
      } catch (err) {
        if (errorMsg) {
          errorMsg.textContent = 'Error de conexión al crear el servicio';
          errorMsg.style.display = 'block';
        }
      }
    });
  }
});