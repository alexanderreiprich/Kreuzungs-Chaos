"use strict";
var KreuzungsChaos;
(function (KreuzungsChaos) {
    var fc = FudgeCore;
    let EVENT;
    (function (EVENT) {
        EVENT[EVENT["POLICE"] = 0] = "POLICE";
        EVENT[EVENT["RACE"] = 1] = "RACE";
    })(EVENT = KreuzungsChaos.EVENT || (KreuzungsChaos.EVENT = {}));
    let STATUS;
    (function (STATUS) {
        STATUS[STATUS["STARTING"] = 0] = "STARTING";
        STATUS[STATUS["ACTIVE"] = 1] = "ACTIVE";
        STATUS[STATUS["ENDED"] = 2] = "ENDED";
    })(STATUS || (STATUS = {}));
    let currentStatus;
    class Events {
        constructor() {
            Events.launchEvent(Events.decideEvent());
        }
        static decideEvent() {
            if (KreuzungsChaos.currentEventType == undefined) {
                return KreuzungsChaos.currentEventType;
            }
            else {
                let rngEvent = Math.random();
                if (rngEvent > 0.5) {
                    KreuzungsChaos.currentEventType = EVENT.POLICE;
                    return EVENT.POLICE;
                }
                else {
                    KreuzungsChaos.currentEventType = EVENT.RACE;
                    return EVENT.RACE;
                }
            }
        }
        static launchEvent(_event) {
            switch (_event) {
                case EVENT.POLICE:
                    console.log("- - - EVENT: POLICE - - -");
                    currentStatus = STATUS.STARTING;
                    this.execPoliceEvent();
                case EVENT.RACE:
                    console.log("- - - EVENT: RACE - - -");
                    currentStatus = STATUS.STARTING;
                //this.execRaceEvent();
                default:
                    console.log("UNDEFINED EVENT");
            }
        }
        static execPoliceEvent() {
            let policeCar = new KreuzungsChaos.Police("Police", new fc.Vector3(40, 40, 0.1));
            KreuzungsChaos.vehicles.addChild(policeCar);
            KreuzungsChaos.events.addChild(policeCar);
            KreuzungsChaos.root.addChild(KreuzungsChaos.events);
        }
        /*         public static execRaceEvent(): void {
        
                    
        
                } */
        static eventOver() {
            if (currentStatus == STATUS.ENDED) {
                return true;
            }
            else {
                return false;
            }
        }
    }
    KreuzungsChaos.Events = Events;
})(KreuzungsChaos || (KreuzungsChaos = {}));
//# sourceMappingURL=events.js.map