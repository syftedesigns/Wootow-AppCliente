export class Tax {
    constructor(
        public ExtraDistance: number,
        public ChargeByDistance: number,
        public TotalTowing: number,
        public DispatchFee: number,
        public Total: number,
        public WoowTowFee: number,
        public Gruas: number,
        public totalMiles: number,
        public TowType?: string,
        public name?: string,
        public fromLng?: number | string,
        public fromLat?: number | string,
        public toLng?: number | string,
        public toLat?: number | string
    ) {}
}
