namespace KreuzungsChaos {

    import fc = FudgeCore;

    export enum EVENT {

        POLICE, RACE

    }

    enum STATUS {

        STARTING, ACTIVE, ENDED

    }

    export let currentEventType: EVENT;
    let currentStatus: STATUS;

    export class Events {

        public constructor() {

            Events.launchEvent(Events.decideEvent());


        }

        public static decideEvent(): EVENT {

            if (currentEventType == undefined) {
                return currentEventType;
            }
            else {
                let rngEvent: number = Math.random();
                if (rngEvent > 0.5) {
                    currentEventType = EVENT.POLICE;
                    return EVENT.POLICE;
                }
                else {
                    currentEventType = EVENT.RACE;
                    return EVENT.RACE;
                }
            }

        }

        public static launchEvent(_event: EVENT): void {

            switch (_event) {

                case EVENT.POLICE:
                    console.log("- - - EVENT: POLICE - - -");
                    currentStatus = STATUS.STARTING;
                    this.execPoliceEvent();

                case EVENT.RACE:
                    console.log("- - - EVENT: RACE - - -");
                    currentStatus = STATUS.STARTING;
                    this.execRaceEvent();

                default:
                    console.log("UNDEFINED EVENT");

            }

        }

        public static execPoliceEvent(): void {

            let policeCar: Police = new Police("Police", new fc.Vector3(40, 40, 0.1));
            

        }

        public static execRaceEvent(): void {

            

        }

        public static eventOver(): boolean {

            if (currentStatus == STATUS.ENDED) {
                return true;
            }
            else {
                return false;
            }

        }

    }

}