"use strict";
var KreuzungsChaos;
(function (KreuzungsChaos) {
    var fc = FudgeCore;
    let LOCATION;
    (function (LOCATION) {
        LOCATION[LOCATION["BOT"] = 0] = "BOT";
        LOCATION[LOCATION["RIGHT"] = 1] = "RIGHT";
        LOCATION[LOCATION["LEFT"] = 2] = "LEFT";
        LOCATION[LOCATION["TOP"] = 3] = "TOP";
    })(LOCATION = KreuzungsChaos.LOCATION || (KreuzungsChaos.LOCATION = {}));
    let PATH;
    (function (PATH) {
        PATH[PATH["BOTTOP"] = 0] = "BOTTOP";
        PATH[PATH["BOTLEFT"] = 1] = "BOTLEFT";
        PATH[PATH["BOTRIGHT"] = 2] = "BOTRIGHT";
        PATH[PATH["TOPBOT"] = 3] = "TOPBOT";
        PATH[PATH["TOPLEFT"] = 4] = "TOPLEFT";
        PATH[PATH["TOPRIGHT"] = 5] = "TOPRIGHT";
        PATH[PATH["RIGHTLEFT"] = 6] = "RIGHTLEFT";
        PATH[PATH["RIGHTTOP"] = 7] = "RIGHTTOP";
        PATH[PATH["RIGHTBOT"] = 8] = "RIGHTBOT";
        PATH[PATH["LEFTRIGHT"] = 9] = "LEFTRIGHT";
        PATH[PATH["LEFTTOP"] = 10] = "LEFTTOP";
        PATH[PATH["LEFTBOT"] = 11] = "LEFTBOT";
    })(PATH = KreuzungsChaos.PATH || (KreuzungsChaos.PATH = {}));
    let STATUS;
    (function (STATUS) {
        STATUS[STATUS["STOP"] = 0] = "STOP";
        STATUS[STATUS["DRIVING"] = 1] = "DRIVING";
        STATUS[STATUS["TURNING"] = 2] = "TURNING";
    })(STATUS = KreuzungsChaos.STATUS || (KreuzungsChaos.STATUS = {}));
    class Vehicle extends KreuzungsChaos.GameObject {
        constructor(_name, _size, _position, _startlocation) {
            super(_name, _size, _position);
            this.velocity = 0;
            this.speedlimit = 50;
            this.acceleration = .5;
            this.startLocation = _startlocation;
            // this.endlocation = this.randomizeEndlocation(this.startLocation);
            this.endLocation = this.randomizeEndlocation(this.startLocation);
            this.decidePath();
            this.currentStatus = STATUS.STOP;
        }
        randomizeEndlocation(_startlocation) {
            let rng10 = Math.random() * 10;
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
        decidePath() {
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
        followPath(_endlocation) {
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
        move(_path) {
            this.currentStatus = STATUS.DRIVING;
            this.calculateVelocity();
            this.mtxLocal.translateY(this.velocity / 400);
        }
        turn(_path) {
            if (_path == PATH.RIGHTTOP || _path == PATH.LEFTBOT) {
                if (this.mtxLocal.translation == new fc.Vector3(15, 16.25, .1) || this.mtxLocal.translation == new fc.Vector3(15, 13.75, .1)) {
                    for (let i = 0; i < 90; i++) {
                        this.mtxLocal.rotateY(i);
                    }
                }
            }
        }
        checkOutOfBounds() {
            if (this.mtxLocal.translation.x < -10 || this.mtxLocal.translation.x > 40 || this.mtxLocal.translation.y < -10 || this.mtxLocal.translation.y > 40) {
                this.getParent().removeChild(this);
                console.log("REMOVED");
                return true;
            }
            else {
                return false;
            }
        }
        translateLocation(_location) {
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
        calculateVelocity() {
            if (this.velocity < this.speedlimit) {
                this.velocity += this.acceleration;
            }
        }
    }
    KreuzungsChaos.Vehicle = Vehicle;
})(KreuzungsChaos || (KreuzungsChaos = {}));
//# sourceMappingURL=vehicle.js.map