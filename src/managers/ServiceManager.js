import fs from "node:fs/promises"; //file system devuelve promesas, para no bloquear el hilo de ejecución.

export class ServiceManager {
    //constructor de la clase Service Manager
    //definimos los atributois de la clase, en este caso el path del archivo JSON que este manager administra
  constructor(path) {
    this.path = path; // Ruta del archivo JSON que este manager administra
  } 

  //MÉTODOS = FUNCIONES

  //método para leer el archivo JSON y devolver un array de servicios

  async readServices() {
    try {
    const fileContext = await fs.readFile(this.path, "utf-8"); //siempre usar el mismo encoding utf-8 para que devuelva un string y no un buffer
    return JSON.parse(fileContext);

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

//método para obtener todos los servicios

async getServices() {
  return await this.readServices();
}
}
