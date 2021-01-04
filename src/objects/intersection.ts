namespace KreuzungsChaos {


    export class Intersection {

        public id: string;
        public streetlist: Street[];

        public constructor(_id: string, _streetlist: Street[]) {

            this.id = _id;
            this.streetlist = _streetlist;

        }

    }

} 