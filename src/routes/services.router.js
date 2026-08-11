import { Router } from 'express'; //importamos Router de express para definir rutas
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from '../dependencies/index.js';

const router = Router();

// El router solo define endpoints y los conecta con su función del controller
router.get('/', getServices);
router.get('/:sid', getServiceById); //son los endpoints que se definen en el router, y se conectan con las funciones del controller. El router no tiene lógica de negocio, solo define rutas y las conecta con los controllers.
router.post('/', createService);
router.put('/:sid', updateService);
router.delete('/:sid', deleteService);

export default router;