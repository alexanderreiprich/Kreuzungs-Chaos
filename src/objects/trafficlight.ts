namespace KreuzungsChaos {

    import fc = FudgeCore;

    export enum STATE {

        ALL_RED, BOT_RED, SIDE_RED

    }

    export class Trafficlight extends GameObject {

        public state: STATE;
        public stateUpdate: number;

        public constructor(_material: fc.Material, _size: fc.Vector2, _position: fc.Vector3, _state: number) {

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

            let cmpMaterial: fc.ComponentMaterial = new fc.ComponentMaterial(_material);
            this.addComponent(cmpMaterial);

        }

        public hndControl(): void {

            if (fc.Keyboard.isPressedOne([fc.KEYBOARD_CODE.SPACE])) {

                switchCooldown = true;
                this.switchState();
                

            }

            else if (fc.Keyboard.isPressedOne([fc.KEYBOARD_CODE.SHIFT_LEFT])) {

                switchCooldown = true;
                this.emergency();

            }

        }

        public switchState(): number { // Switch state from bot red to side red or the other way around

            console.log("SWITCH STATE, COCAINE");

            if (this.state == STATE.BOT_RED || this.state == STATE.ALL_RED) {
                previousState = this.state.valueOf();
                this.state = STATE.SIDE_RED;
                this.stateUpdate = 2;
            }
            else {
                previousState = 2;
                this.state = STATE.BOT_RED;
                this.stateUpdate = 1;
            }

            fc.Time.game.setTimer(2000, 0, function changeBoolean(): void {
                switchCooldown = false;
            });

            return this.stateUpdate;

        }

        public emergency(): number { // Switch state to all red

            previousState = this.state.valueOf();
            this.state = STATE.ALL_RED;
            this.stateUpdate = 0;
            fc.Time.game.setTimer(3000, 1, this.switchState); 

            return this.stateUpdate;

        }

    }

}