import fs from "node:fs/promises"; //file system devuelve promesas, para no bloquear el hilo de ejecución.

//Clase ServiceManager para manejar los servicios de la aplicación
export class ServiceManager {
    //constructor de la clase Service Manager
    //definimos los atributois de la clase, en este caso el path del archivo JSON que este manager administra
  constructor(path) {
    this.path = path; // Ruta del archivo JSON que este manager administra
  } 

  //MÉTODOS = FUNCIONES
  //MÉTODOS INTERNOS ---> No se exportan write y read, solo se usan dentro de la clase ServiceManager

  //método para leer el archivo JSON y devolver un array de servicios

  async readServices() {
    try {
      const fileContext = await fs.readFile(this.path, "utf-8"); //siempre usar el mismo encoding utf-8 para que devuelva un string y no un buffer
      return JSON.parse(fileContext);
    } catch (error) {
      if (error.code === "ENOENT") {
        //Agregar mensaje de error si el archivo no existe
        return [];
      }
    }
  }

  //método para escribir en el archivo JSON

  async writeServices(services) {  //stringify convierte un objeto JS a string JSON
    const fileContext = JSON.stringify(services, null, 2); //null = sin replacer, 2 = indentación legible
    await fs.writeFile(this.path, fileContext, "utf-8");
  }

  //MÉTODOS EXTERNOS --->  si se exportan, se usan fuera de la clase ServiceManager
  //método para obtener todos los servicios

  async getServices() {
    return await this.readServices(); //REUTILIZA LA FUNCION readServices() para obtener todos los servicios
  }

  //método para buscar un servicio puntual por su id

  async getServiceById(id) { //LLEGA DESDE LA url (req.params.id)
    const services = await this.readServices();
    const service = services.find((s) => s.id === Number(id));
    return service || null; //SI NO EXISTE DE DEVUELVE NULL, SI EXISTE DEVUELVE EL SERVICIO
  }

  //método para agregar un nuevo servicio

  async addService(data) {
    const { name, description, duration, price, category, available } = data;

    if (
      !name ||
      !description ||
      duration === undefined || //VAN ASI PORQUE SI EL DATO PUEDE SER 0, Y EN ESE CASO NO SE CONSIDERA COMO FALSO, POR ESO SE USA === undefined
      price === undefined ||
      !category ||
      available === undefined
    ) {
      throw new Error("Faltan campos obligatorios para crear el servicio"); //TIRO UN ERROR SI FALTAN CAMPOS OBLIGATORIOS
    }

    const services = await this.readServices();

    const newId =
      services.length > 0
        ? Math.max(...services.map((s) => s.id)) + 1
        : 1;

    const newService = {
      id: newId,
      name,
      description,
      duration,
      price,
      category,
      available,
    };

    services.push(newService);
    await this.writeServices(services);

    return newService;
  }

  //método para actualizar un servicio existente

  async updateService(id, data) {
    const services = await this.readServices();
    const index = services.findIndex((s) => s.id === Number(id));
    //findIndex en vez de find ---> Necesito la posición del servicio dentro del array(no el objeto)
    //despues voy a modificar ese objeto directamente en services[index]


    if (index === -1) { //eso es lo que devuelve findIndex si no encuentra el elemento, por eso hago esta validación
      return null; //readme --> retorno null si no existe el servicio con ese id
    }

    const { id: idFromBody, ...allowedChanges } = data; //destructuring para separar el id del resto de los campos que se pueden actualizar

    services[index] = {  //arma un nuevo objeto con los datos del servicio existente y los cambios permitidos
      ...services[index],
      ...allowedChanges,
    };

    await this.writeServices(services);

    return services[index];
  }

//método para eliminar un servicio existente

  async deleteService(id) {
    const services = await this.readServices();
    const index = services.findIndex((s) => s.id === Number(id));

    if (index === -1) {
      return null;
    }

    const [deletedService] = services.splice(index, 1); //SPLICE -> modifica el array original quitando 1 elemento en la posición index y devuelve un array con el elemento eliminado, por eso lo desestructuro para obtener el objeto directamente
    await this.writeServices(services); //reescribo el archivo JSON con el array modificado

    return deletedService; //devuelvo el servicio eliminado
  }
}