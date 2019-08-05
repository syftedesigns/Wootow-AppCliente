// Clase que se encarga de construir los objetos para las notificaciones
export class ObjectPushClass {
    constructor(
        public app_id: string,
        public include_player_ids: string[],
        public template_id: string,
        public data?: any,
        public contents?: any,
    ) {}
}
