//Es el index de los managers, donde se crean las instancias de los managers y se exportan para ser usados en otros archivos
//En vez de crear una instancia de cada manager en cada archivo donde se necesite, se crea una sola instancia de cada manager y se exporta para ser usada en otros archivos
import path from 'node:path'; //path es un modulo de node que permite trabajar con rutas de archivos y directorios
import { fileURLToPath } from 'node:url'; //fileURLToPath es un metodo de node que permite obtener la ruta absoluta de un archivo a partir de su URL

//exportamos los managers para poder usarlos en otros archivos
import { ServiceManager } from './ServiceManager.js';
import { BookingManager } from './BookingManager.js'; 

//const __filename = fileURLToPath(import.meta.url); //obtenemos la ruta absoluta del archivo actual
//const __dirname = path.dirname(__filename); //obtenemos la ruta absoluta del directorio donde se encuentra el archivo actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Apunta a src/data/
const servicesFilePath = path.join(__dirname, '..', 'data', 'services.json'); 
const bookingsFilePath = path.join(__dirname, '..', 'data', 'bookings.json');

export const serviceManager = new ServiceManager(servicesFilePath);
//orden importa , serviceManager debe ser creado antes que bookingManager porque bookingManager necesita la referencia a serviceManager para poder validar servicios
export const bookingManager = new BookingManager(bookingsFilePath, serviceManager);    
//ahi usa el serviceManager que creó arriba
