export class ObjectCustomerClass {
    constructor(
        public name: string,
        public email: string,
        public phone: number | string,
        public status: boolean,
        public GOOGLE: boolean,
        public password?: string,
        // tslint:disable-next-line:variable-name
        public _id?: string,
        public SocketSession?: string,
        // tslint:disable-next-line:variable-name
        public __v?: number,
        public token?: string,
        public picture?: string
    ) {}
}
