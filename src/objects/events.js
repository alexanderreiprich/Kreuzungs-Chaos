"use strict";
var KreuzungsChaos;
(function (KreuzungsChaos) {
    let EVENT;
    (function (EVENT) {
        EVENT[EVENT["POLICE"] = 0] = "POLICE";
        EVENT[EVENT["RACE"] = 1] = "RACE";
    })(EVENT = KreuzungsChaos.EVENT || (KreuzungsChaos.EVENT = {}));
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
                    this.execPoliceEvent();
                case EVENT.RACE:
                    console.log("- - - EVENT: RACE - - -");
                    this.execRaceEvent();
                default:
                    console.log("UNDEFINED EVENT");
            }
        }
        static execPoliceEvent() {
        }
        static execRaceEvent() {
        }
    }
    KreuzungsChaos.Events = Events;
})(KreuzungsChaos || (KreuzungsChaos = {}));
//# sourceMappingURL=events.js.map