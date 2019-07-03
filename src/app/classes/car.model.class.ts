import { ObjectCustomerClass } from './customer.class';
// Objeto de clase que maneja la interfaz de los vehiculos
export class ObjectCustomerCarClass {
    constructor(
        public car_name: string,
        public car_colour: string,
        public car_plate: string,
        public client: ObjectCustomerClass | string,
        public car_model?: string,
        public _id?: string,
    ) {}
}
// Objeto de vehiculo con imagen
export class ObjectCarClass {
    constructor(
        public car_images: string,
        public car_model_id: ObjectCustomerCarClass | string | any,
        public _id?: string
    ) {}
}
