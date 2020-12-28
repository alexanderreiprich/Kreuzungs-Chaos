namespace KreuzungsChaos {

    import fc = FudgeCore;

    export enum STATE {

        ALL_RED, BOT_RED, SIDE_RED

    }

    export class Trafficlight extends GameObject {

        public state: STATE;
        public stateUpdate: number = 0;

        public constructor(_material: fc.Material, _size: fc.Vector2, _position: fc.Vector3, _state: number) {

            super("Trafficlights", _size, _position);

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

            let cmpMaterial: fc.ComponentMaterial = new fc.ComponentMaterial(_material);
            
            
            this.addComponent(cmpMaterial);

        }

        public hndControl(): void {

            if (fc.Keyboard.isPressedOne([fc.KEYBOARD_CODE.SPACE])) 

                this.switchState();

        }

        public switchState(): number { //Switch state from bot red to side red or the other way around

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

        public emergency(): void { //Switch state to all red


        }
    

    }

}