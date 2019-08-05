// Clase que construye la interfaz de los conductores
export class ObjectProviderClass {
    constructor(
        public email: string,
        public name: string,
        public phone: number | string,
        public city: string,
        public password?: string,
        public authorized?: boolean,
        public statusWork?: boolean,
        public status?: boolean,
        public token?: string,
        public _id?: string,
        public currentLat?: number,
        public currentLng?: number,
        public AppPlayerId?: string
    ) {}
}
