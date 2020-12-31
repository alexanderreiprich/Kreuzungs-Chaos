namespace KreuzungsChaos {

    import fc = FudgeCore;

    export enum LOCATION {

        BOT, RIGHT, LEFT, TOP

    }

    export enum PATH {

        BOTTOP, BOTLEFT, BOTRIGHT,
        TOPBOT, TOPLEFT, TOPRIGHT, 
        RIGHTLEFT, RIGHTTOP, RIGHTBOT, 
        LEFTRIGHT, LEFTTOP, LEFTBOT

    }
    
    export enum STATUS {

        STOP, DRIVING, TURNING

    }

    export class Vehicle extends GameObject {

        public startLocation: LOCATION;
        public endLocation: LOCATION;
        public path: PATH;
        public currentStatus: STATUS;

        public velocity: number = 0;
        public speedlimit: number = 50;
        public acceleration: number = .5;

        public constructor(_name: string, _size: fc.Vector2, _position: fc.Vector3, _startlocation: LOCATION) {

            super(_name, _size, _position);

            this.startLocation = _startlocation;
            // this.endlocation = this.randomizeEndlocation(this.startLocation);
            this.endLocation = this.randomizeEndlocation(this.startLocation);
            this.decidePath();

            this.currentStatus = STATUS.STOP;

        }

        public randomizeEndlocation(_startlocation: LOCATION): LOCATION {

            let rng10: number = Math.random() * 10;

            if (rng10 <= 2.5) {
                return LOCATION.BOT;
            }
            else if (rng10 > 2.5 && rng10 < 5) {
                return LOCATION.RIGHT;
            }
            else if (rng10 >= 5 && rng10 < 7.5) {
                return LOCATION.TOP;
            }
            else {
                return LOCATION.LEFT;
            }

        }

        public decidePath(): void { // Decides Path for Vehicle to follow

            switch (this.startLocation) {

                case LOCATION.BOT:
                    if (this.endLocation == LOCATION.TOP) {
                        this.path = PATH.BOTTOP;
                        break;
                    }
                    else {
                        console.log("ALERT - PATH NOT AVAILABLE YET");
                        this.mtxLocal.translation = new fc.Vector3(1000, 1000, 0);
                        break;
                    }
    
                case LOCATION.RIGHT:
                    if (this.endLocation == LOCATION.LEFT) {
                        this.path = PATH.RIGHTLEFT;
                        break;
                    }
                    else {
                        console.log("ALERT - PATH NOT AVAILABLE YET");
                        this.mtxLocal.translation = new fc.Vector3(1000, 1000, 0);
                        break;
                    }
                
                case LOCATION.TOP:
                    if (this.endLocation == LOCATION.BOT) {
                        this.path = PATH.TOPBOT;
                        break;
                    }
                    else {
                        console.log("ALERT - PATH NOT AVAILABLE YET");
                        this.mtxLocal.translation = new fc.Vector3(1000, 1000, 0);
                        break;
                    }

                case LOCATION.LEFT:
                    if (this.endLocation == LOCATION.RIGHT) {
                        this.path = PATH.LEFTRIGHT;
                        break;
                    }
                    else {
                        console.log("ALERT - PATH NOT AVAILABLE YET");
                        this.mtxLocal.translation = new fc.Vector3(1000, 1000, 0);
                        break;
                    }

                default:
                    console.log("ALERT - NO STARTLOCATION");
                    break;

            }

        }

        public followPath(_endlocation: LOCATION): void { // Makes the Vehicle follow the Path

            switch (this.path) {

                case PATH.BOTTOP:
                    this.move(PATH.BOTTOP);
                    break;

                case PATH.TOPBOT:
                    this.move(PATH.TOPBOT);
                    break;

                case PATH.RIGHTLEFT:
                    this.move(PATH.RIGHTLEFT);
                    break;
                    
                case PATH.LEFTRIGHT:
                    this.move(PATH.LEFTRIGHT);
                    break;

            }

        }

        public move(_path: PATH): void {

            this.currentStatus = STATUS.DRIVING;

            this.calculateVelocity();
            this.mtxLocal.translateY(this.velocity / 400);

        }

        public turn(_path: PATH): void {

            if (_path == PATH.RIGHTTOP || _path == PATH.LEFTBOT) {
                if (this.mtxLocal.translation == new fc.Vector3(15, 16.25, .1) || this.mtxLocal.translation == new fc.Vector3(15, 13.75, .1)) {

                    for (let i: number = 0; i < 90; i++) {
                        this.mtxLocal.rotateY(i);
                    }

                }
            }

        }

        public checkOutOfBounds(): boolean {

            if (this.mtxLocal.translation.x < -10 || this.mtxLocal.translation.x > 40 || this.mtxLocal.translation.y < -10 || this.mtxLocal.translation.y > 40) {
                
                this.getParent().removeChild(this);
                console.log("REMOVED");
                return true;

            }
            else {

                return false;

            }

        }

        public translateLocation(_location: LOCATION): fc.Vector3  {

            switch (_location) {
    
                case LOCATION.BOT:
                    return new fc.Vector3(16.25, -5, .1);
                    break;
                
                case LOCATION.RIGHT:
                    this.mtxLocal.rotateZ(90);
                    return new fc.Vector3(35, 16.25, .1);
                    break;
                
                case LOCATION.TOP:
                    this.mtxLocal.rotateZ(180);
                    return new fc.Vector3(13.75, 35, .1);
                    break;
    
                case LOCATION.LEFT:
                    this.mtxLocal.rotateZ(-90);
                    return new fc.Vector3(-5, 13.75, .1);
                    break;
    
            }
    
        }

        public calculateVelocity(): void {

            if (this.velocity < this.speedlimit) {

                this.velocity += this.acceleration;

            }

        }

    }

}