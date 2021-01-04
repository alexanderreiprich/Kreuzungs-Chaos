namespace KreuzungsChaos {

    import fc = FudgeCore;

    export class Street {

        public id: string;
        public startInt: fc.Vector3;
        public endInt: fc.Vector3;
        public startAway: fc.Vector3;
        public endAway: fc.Vector3;

        public constructor(_id: string, _startInt: fc.Vector3, _endInt: fc.Vector3, _startAway: fc.Vector3, _endAway: fc.Vector3) {

            this.id = _id;
            this.startInt = _startInt;
            this.endInt = _endInt;
            this.startAway = _startAway;
            this.endAway = _endAway;

        }

    }


}