namespace KreuzungsChaos {

    import fc = FudgeCore;

    export enum EVENT {

        POLICE, RACE

    }

    export let currentEventType: EVENT;

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
                    this.execPoliceEvent();

                case EVENT.RACE:
                    console.log("- - - EVENT: RACE - - -");
                    this.execRaceEvent();

                default:
                    console.log("UNDEFINED EVENT");

            }

        }

        public static execPoliceEvent(): void {

            

        }

        public static execRaceEvent(): void {

            

        }

    }

}