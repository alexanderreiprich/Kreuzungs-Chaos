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
        STATUS[STATUS["STARTING"] = 0] = "STARTING";
        STATUS[STATUS["STOP"] = 1] = "STOP";
        STATUS[STATUS["DRIVING"] = 2] = "DRIVING";
        STATUS[STATUS["TURNING"] = 3] = "TURNING";
        STATUS[STATUS["ARRIVED"] = 4] = "ARRIVED";
    })(STATUS = KreuzungsChaos.STATUS || (KreuzungsChaos.STATUS = {}));
    class Vehicle extends KreuzungsChaos.GameObject {
        constructor(_name, _size, _position) {
            super(_name, _size, _position);
            this.hitbox = new fc.Node("Hitbox");
            this.frontHitNode = new fc.Node("FrontHitNode");
            this.backHitNode = new fc.Node("FrontBackNode");
            this.velocity = 0;
            this.speedlimit = 50;
            this.acceleration = .5;
            //Standardmap
            this.street1 = new KreuzungsChaos.Street("TOPSTREET", new fc.Vector3(13.75, 35, .1), new fc.Vector3(13.75, 18, .1), new fc.Vector3(16.25, 18, .1), new fc.Vector3(16.25, 35, .1), new fc.Vector3(13.75, 22, .1));
            this.street2 = new KreuzungsChaos.Street("BOTSTREET", new fc.Vector3(16.25, -5, .1), new fc.Vector3(16.25, 12, .1), new fc.Vector3(13.75, 12, .1), new fc.Vector3(13.75, -5, .1), new fc.Vector3(16.25, 8, .1));
            this.street3 = new KreuzungsChaos.Street("LEFTSTREET", new fc.Vector3(-5, 13.75, .1), new fc.Vector3(12, 13.75, .1), new fc.Vector3(12, 16.25, .1), new fc.Vector3(-5, 16.25, .1), new fc.Vector3(8, 13.75, .1));
            this.street4 = new KreuzungsChaos.Street("RIGHTSTREET", new fc.Vector3(35, 16.25, .1), new fc.Vector3(18, 16.25, .1), new fc.Vector3(18, 13.75, .1), new fc.Vector3(35, 13.75, .1), new fc.Vector3(22, 16.25, .1));
            this.streetList = [this.street1, this.street2, this.street3, this.street4];
            this.intersection = new KreuzungsChaos.Intersection("Intersection", this.streetList);
            this.getLocations(this.streetList);
            this.routeTargets = Vehicle.generateRoute(this.startLocation, this.endLocation);
            console.log("[Car " + this.name + "] Going " + this.startLocation.id + " -> " + this.endLocation.id);
            this.currentStatus = STATUS.STARTING;
            this.getNextTarget();
            this.frontHitNode.addComponent(new fc.ComponentTransform);
            this.backHitNode.addComponent(new fc.ComponentTransform);
            this.frontHitNode.mtxWorld.translateY(-5); // Moving hitbox creation out of view
            this.backHitNode.mtxWorld.translateY(-5);
            this.frontHitNode.mtxLocal.translateY(1); // Translating hitbox to corresponding car parts
            this.backHitNode.mtxLocal.translateY(-0.75);
            this.appendChild(this.frontHitNode);
            this.appendChild(this.backHitNode);
            this.frontRect = new fc.Rectangle(this.frontHitNode.mtxLocal.translation.x, this.frontHitNode.mtxLocal.translation.y, 2, 2, fc.ORIGIN2D.CENTER);
            this.backRect = new fc.Rectangle(this.backHitNode.mtxLocal.translation.x, this.backHitNode.mtxLocal.translation.y, 2, 2, fc.ORIGIN2D.CENTER);
            this.frontRect.position = this.frontHitNode.mtxLocal.translation.toVector2();
            this.backRect.position = this.backHitNode.mtxLocal.translation.toVector2();
            console.log(this.startLocationID);
            // this.hitbox.appendChild(new Background(mtrHitbox, new fc.Vector2(1, 1), new fc.Vector3(this.frontHitNode.mtxLocal.translation.x, this.frontHitNode.mtxLocal.translation.y, .25)));
            // this.hitbox.appendChild(new Background(mtrHitbox, new fc.Vector2(1, 1), new fc.Vector3(this.backHitNode.mtxLocal.translation.x, this.backHitNode.mtxLocal.translation.y, .25)));
            this.appendChild(this.hitbox);
        }
        static calculateRotation(_currentPos, _targetPos) {
            let directionalVector = fc.Vector3.DIFFERENCE(_targetPos, _currentPos).toVector2();
            directionalVector = new fc.Vector2(directionalVector.y, -directionalVector.x); // Turn 90 deg to match texture
            let angleInRad = Math.atan2(directionalVector.y, directionalVector.x);
            return 180 * angleInRad / Math.PI; // Angle in Degrees
        }
        static calculateMove(_currentPos, _targetPos, _velocity) {
            let directionalVector = fc.Vector3.DIFFERENCE(_targetPos, _currentPos).toVector2();
            let directionalVectorLength = directionalVector.magnitude;
            if (directionalVectorLength >= _velocity / 400) {
                return _velocity / 400;
            }
            else {
                return directionalVectorLength;
            }
        }
        static generateRoute(_startlocation, _endlocation) {
            let vectorlist = [];
            vectorlist.push(_endlocation.endAway);
            vectorlist.push(_endlocation.startAway);
            vectorlist.push(_startlocation.endInt);
            vectorlist.push(_startlocation.stop);
            return vectorlist;
        }
        getLocations(_streetlist) {
            let rngStartlocation = Math.floor(Math.random() * _streetlist.length);
            let rngEndlocation;
            do {
                rngEndlocation = Math.floor(Math.random() * _streetlist.length);
            } while (rngStartlocation == rngEndlocation);
            rngStartlocation = 3;
            rngEndlocation = 0;
            this.startLocation = _streetlist[rngStartlocation];
            this.startLocationID = rngStartlocation;
            this.endLocation = _streetlist[rngEndlocation];
            this.endLocationID = rngEndlocation;
        }
        getNextTarget() {
            if (this.routeTargets.length == 0) {
                console.log("TARGET REACHED");
                this.currentStatus = STATUS.ARRIVED;
                this.getParent().removeChild(this);
            }
            else if (this.currentStatus == STATUS.STARTING) {
                this.mtxLocal.translation = this.startLocation.startInt;
                this.currentTarget = this.routeTargets.pop();
                this.currentStatus = STATUS.DRIVING;
            }
            else if (this.currentStatus == STATUS.STOP) {
                this.currentTarget = this.routeTargets.pop();
                this.currentStatus = STATUS.STOP;
            }
            else if (this.currentStatus == STATUS.DRIVING) {
                this.currentTarget = this.routeTargets.pop();
                this.currentStatus = STATUS.TURNING;
            }
            else if (this.currentStatus == STATUS.TURNING) {
                this.currentTarget = this.routeTargets.pop();
                this.currentStatus = STATUS.DRIVING;
            }
        }
        onTargetReached() {
            this.getNextTarget();
        }
        followPath() {
            this.mtxWorld.translation = this.mtxLocal.translation;
            this.frontRect.position = this.frontHitNode.mtxWorld.translation.toVector2();
            this.backRect.position = this.backHitNode.mtxWorld.translation.toVector2();
            if (this.startLocationID == 0 || this.startLocationID == 1) {
                if (this.routeTargets.length == 2 && KreuzungsChaos.trafficlight.stateUpdate != 2) {
                    this.stop();
                }
                else {
                    if (this.checkInFront()) {
                        this.stop();
                    }
                    else {
                        this.move();
                    }
                }
            }
            else {
                if (this.routeTargets.length == 2 && KreuzungsChaos.trafficlight.stateUpdate != 1) {
                    this.stop();
                }
                else {
                    if (this.checkInFront()) {
                        this.stop();
                    }
                    else {
                        this.move();
                    }
                }
            }
            if (this.mtxLocal.translation.equals(this.currentTarget)) {
                this.onTargetReached();
            }
        }
        move() {
            this.calculateVelocity();
            this.mtxLocal.rotation = new fc.Vector3(0, 0, Vehicle.calculateRotation(this.mtxLocal.translation, this.currentTarget));
            console.log(this.mtxLocal.rotation.z);
            switch (Vehicle.calculateRotation(this.mtxLocal.translation, this.currentTarget)) {
                case 0:
                    this.currentDirection = LOCATION.TOP;
                    console.log("TOP");
                    break;
                case -0:
                    this.currentDirection = LOCATION.TOP;
                    //console.log("TOP");
                    break;
                case -90:
                    this.currentDirection = LOCATION.RIGHT;
                    //console.log("RIGHT");
                    break;
                case -180:
                    this.currentDirection = LOCATION.BOT;
                    //console.log("BOT");
                    break;
                case 90:
                    this.currentDirection = LOCATION.LEFT;
                    console.log("LEFT");
                default:
                    break;
            }
            this.mtxLocal.translateY(Vehicle.calculateMove(this.mtxLocal.translation, this.currentTarget, this.velocity));
            // this.hitbox.getChild(0).mtxLocal.translation = new fc.Vector3(this.frontRect.position.x, this.frontRect.position.y, 0.5);
            // this.hitbox.getChild(1).mtxLocal.translation = new fc.Vector3(this.backRect.position.x, this.backRect.position.y, 0.5);
        }
        moveAside() {
            if (this.velocity > 0) {
                this.velocity -= this.acceleration;
                this.mtxLocal.translateY(Vehicle.calculateMove(this.mtxLocal.translation, this.currentTarget, this.velocity));
                this.mtxLocal.translateX(0.1);
                this.moveAside();
            }
            else if (this.velocity == 0 && this.currentStatus != STATUS.STOP) {
                this.currentStatus = STATUS.STOP;
            }
        }
        moveBack() {
            if (this.currentStatus != STATUS.DRIVING) {
                this.currentStatus = STATUS.DRIVING;
            }
            if (this.velocity <= this.speedlimit) {
                this.velocity += this.acceleration;
                this.mtxLocal.translateY(Vehicle.calculateMove(this.mtxLocal.translation, this.currentTarget, this.velocity));
                this.mtxLocal.translateX(-0.1);
                this.moveBack();
            }
        }
        stop() {
            if (this.velocity > 0) {
                this.velocity -= this.acceleration;
            }
        }
        hndEvent() {
            this.moveAside();
            //if event over
            this.moveBack();
        }
        rotateVector(_vector, _rotation) {
            _vector.transform(fc.Matrix4x4.ROTATION_Z(_rotation));
            return _vector;
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
        calculateVelocity() {
            if (this.velocity < this.speedlimit) {
                this.velocity += this.acceleration;
            }
        }
        checkCollision(_target) {
            let intersectionFront = this.frontRect.getIntersection(_target.frontRect);
            let intersectionBack = this.frontRect.getIntersection(_target.backRect);
            if (intersectionFront == null || intersectionBack == null)
                return false;
            else {
                if (this != _target) {
                    console.log("COLLISION!!");
                    return true;
                }
                else {
                    return false;
                }
            }
        }
        checkInFront() {
            /* for (let i: number = 0; i < vehicles.getChildren().length; i++) {

                let vectorBetween: fc.Vector3 = new fc.Vector3;
                vectorBetween = vehicles.getChild(i).mtxWorld.translation;
                vectorBetween.subtract(this.mtxWorld.translation);

                if (vectorBetween.x == 0 && vehicles.getChild(i) != this) {
                    if (vectorBetween.magnitude < 3.5) {
                        console.log(this.name + " SIEHT GERADE " + vehicles.getChild(i).name);
                        console.log(vectorBetween);

                        return true;
                    }
                }
                else if (vectorBetween.y == 0 && vehicles.getChild(i) != this) {
                    if (vectorBetween.magnitude < 3.5) {
                        console.log(this.name + " SIEHT GERADE " + vehicles.getChild(i).name);
                        console.log(vectorBetween);

                        return true;
                    }
                }

            }

            return false;
 */
            for (let i = 0; i < KreuzungsChaos.vehicles.getChildren().length; i++) {
                let vectorBetween = new fc.Vector3;
                vectorBetween = KreuzungsChaos.vehicles.getChild(i).mtxWorld.translation;
                vectorBetween.subtract(this.mtxWorld.translation);
                switch (this.currentDirection) {
                    case LOCATION.TOP:
                        if (vectorBetween.x == 0 && KreuzungsChaos.vehicles.getChild(i) != this) {
                            if (vectorBetween.y < 3.5 && vectorBetween.y > 0) {
                                // console.log(this.name + " SIEHT GERADE " + vehicles.getChild(i).name);
                                //console.log(vectorBetween);
                                //console.log("ICH NUTZE TOP");
                                return true;
                            }
                        }
                    case LOCATION.LEFT:
                        if (vectorBetween.y == 0 && KreuzungsChaos.vehicles.getChild(i) != this) {
                            if (vectorBetween.x > -3.5 && vectorBetween.x < 0) {
                                // console.log(this.name + " SIEHT GERADE " + vehicles.getChild(i).name);
                                // console.log(vectorBetween);
                                console.log("ICH NUTZE LEFT");
                                return true;
                            }
                        }
                        break;
                    case LOCATION.BOT:
                        if (vectorBetween.x == 0 && KreuzungsChaos.vehicles.getChild(i) != this) {
                            if (vectorBetween.y > -3.5 && vectorBetween.y < 0) {
                                // console.log(this.name + " SIEHT GERADE " + vehicles.getChild(i).name);
                                //console.log(vectorBetween);
                                console.log("BOT");
                                return true;
                            }
                        }
                        break;
                    case LOCATION.RIGHT:
                        if (vectorBetween.y == 0 && KreuzungsChaos.vehicles.getChild(i) != this) {
                            if (vectorBetween.x < 3.5 && vectorBetween.x > 0) {
                                // console.log(this.name + " SIEHT GERADE " + vehicles.getChild(i).name);
                                //console.log(vectorBetween);
                                console.log("RIGHT");
                                return true;
                            }
                        }
                        break;
                    default:
                        return false;
                }
            }
            return false;
        }
    }
    KreuzungsChaos.Vehicle = Vehicle;
})(KreuzungsChaos || (KreuzungsChaos = {}));
//# sourceMappingURL=vehicle.js.map