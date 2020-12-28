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
            switch (_state) {
                case 0:
                    this.state = STATE.ALL_RED;
                    this.stateUpdate = 0;
                    break;
                case 1:
                    this.state = STATE.BOT_RED;
                    this.stateUpdate = 1;
                    break;
                case 2:
                    this.state = STATE.SIDE_RED;
                    this.stateUpdate = 2;
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
            if (fc.Keyboard.isPressedOne([fc.KEYBOARD_CODE.SHIFT_LEFT]))
                this.emergency();
        }
        switchState() {
            console.log("STATE SWITCHED");
            console.log("OLD:" + this.state);
            if (this.state == STATE.BOT_RED || this.state == STATE.ALL_RED) {
                KreuzungsChaos.previousState = this.state.valueOf();
                this.state = STATE.SIDE_RED;
                this.stateUpdate = 2;
            }
            else {
                KreuzungsChaos.previousState = 2;
                this.state = STATE.BOT_RED;
                this.stateUpdate = 1;
            }
            console.log("NEW:" + this.state);
            return this.stateUpdate;
        }
        emergency() {
            console.log("STATE SWITCHED TO EMERGENCY");
            console.log("OLD:" + KreuzungsChaos.currentState);
            KreuzungsChaos.previousState = this.state.valueOf();
            this.state = STATE.ALL_RED;
            this.stateUpdate = 0;
            console.log("NEW:" + this.state);
            return this.stateUpdate;
        }
    }
    KreuzungsChaos.Trafficlight = Trafficlight;
})(KreuzungsChaos || (KreuzungsChaos = {}));
//# sourceMappingURL=trafficlight.js.map