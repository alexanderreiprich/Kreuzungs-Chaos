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
            if (KreuzungsChaos.switchCooldown == false) {
                KreuzungsChaos.switchCooldown = true;
                this.switchState();
            }
            // if (fc.Keyboard.isPressedOne([fc.KEYBOARD_CODE.SPACE]) && switchCooldown == false) {
            //     switchCooldown = true;
            //     this.switchState();
            // }
            // else if (fc.Keyboard.isPressedOne([fc.KEYBOARD_CODE.SHIFT_LEFT]) && switchCooldown == false) {
            //     switchCooldown = true;
            //     this.emergency();
            // }
        }
        checkForEmergency() {
            if (fc.Keyboard.isPressedOne([fc.KEYBOARD_CODE.SHIFT_LEFT]) && KreuzungsChaos.switchCooldown == false) {
                KreuzungsChaos.switchCooldown = true;
                this.emergency();
            }
            //FIX EMERGENCY BUTTON
        }
        switchState() {
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
            fc.Time.game.setTimer(2000, 0, function changeBoolean() {
                KreuzungsChaos.switchCooldown = false;
            });
            return this.stateUpdate;
        }
        emergency() {
            KreuzungsChaos.previousState = this.state.valueOf();
            this.state = STATE.ALL_RED;
            this.stateUpdate = 0;
            fc.Time.game.setTimer(2000, 1, function changeBoolean() {
                KreuzungsChaos.switchCooldown = false;
            });
            fc.Time.game.setTimer(2000, 1, this.switchState);
            return this.stateUpdate;
        }
    }
    KreuzungsChaos.Trafficlight = Trafficlight;
})(KreuzungsChaos || (KreuzungsChaos = {}));
//# sourceMappingURL=trafficlight.js.map