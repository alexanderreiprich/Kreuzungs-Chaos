"use strict";
var KreuzungsChaos;
(function (KreuzungsChaos) {
    var fc = FudgeCore;
    let STATE;
    (function (STATE) {
        STATE[STATE["ALL_RED"] = 0] = "ALL_RED";
        STATE[STATE["BOT_RED"] = 1] = "BOT_RED";
        STATE[STATE["SIDE_RED"] = 2] = "SIDE_RED";
    })(STATE = KreuzungsChaos.STATE || (KreuzungsChaos.STATE = {}));
    class Trafficlight extends KreuzungsChaos.GameObject {
        constructor(_material, _size, _position, _state) {
            super("Trafficlights", _size, _position);
            this.stateUpdate = 0;
            switch (_state) {
                case 0:
                    this.state = STATE.ALL_RED;
                    break;
                case 1:
                    this.state = STATE.BOT_RED;
                    break;
                case 2:
                    this.state = STATE.SIDE_RED;
                    break;
                default:
                    break;
            }
            let cmpMaterial = new fc.ComponentMaterial(_material);
            this.addComponent(cmpMaterial);
        }
        hndControl() {
            if (fc.Keyboard.isPressedOne([fc.KEYBOARD_CODE.SPACE]))
                this.switchState();
        }
        switchState() {
            console.log("STATE SWITCHED");
            console.log("OLD:" + this.state);
            if (this.state == STATE.BOT_RED || this.state == STATE.ALL_RED) {
                this.state = STATE.SIDE_RED;
                this.stateUpdate = 2;
            }
            else {
                this.state = STATE.BOT_RED;
                this.stateUpdate = 1;
            }
            console.log("NEW:" + this.state);
            console.log("RETURN:" + this.state.valueOf());
            return this.stateUpdate;
        }
        emergency() {
        }
    }
    KreuzungsChaos.Trafficlight = Trafficlight;
})(KreuzungsChaos || (KreuzungsChaos = {}));
//# sourceMappingURL=trafficlight.js.map