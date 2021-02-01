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
        STATUS[STATUS["ARRIVED"] = 3] = "ARRIVED";
    })(STATUS = KreuzungsChaos.STATUS || (KreuzungsChaos.STATUS = {}));
    class Vehicle extends KreuzungsChaos.GameObject {
        constructor(_name, _size, _position) {
            super(_name, _size, _position);
            this.hitbox = new fc.Node("Hitbox");
            this.turned = false;
            this.frontHitNode = new fc.Node("FrontHitNode");
            this.backHitNode = new fc.Node("FrontBackNode");
            this.velocity = 0;
            this.speedlimit = 50;
            this.acceleration = .5;
            //Standardmap
            this.street1 = new KreuzungsChaos.Street("TOPSTREET", new fc.Vector3(13.75, 35, .1), new fc.Vector3(13.75, 18, .1), new fc.Vector3(16.25, 18, .1), new fc.Vector3(16.25, 35, .1), new fc.Vector3(13.75, 21, .1));
            this.street2 = new KreuzungsChaos.Street("BOTSTREET", new fc.Vector3(16.25, -5, .1), new fc.Vector3(16.25, 12, .1), new fc.Vector3(13.75, 12, .1), new fc.Vector3(13.75, -5, .1), new fc.Vector3(16.25, 9, .1));
            this.street3 = new KreuzungsChaos.Street("LEFTSTREET", new fc.Vector3(-5, 13.75, .1), new fc.Vector3(12, 13.75, .1), new fc.Vector3(12, 16.25, .1), new fc.Vector3(-5, 16.25, .1), new fc.Vector3(9, 13.75, .1));
            this.street4 = new KreuzungsChaos.Street("RIGHTSTREET", new fc.Vector3(35, 16.25, .1), new fc.Vector3(18, 16.25, .1), new fc.Vector3(18, 13.75, .1), new fc.Vector3(35, 13.75, .1), new fc.Vector3(21, 16.25, .1));
            this.streetList = [this.street1, this.street2, this.street3, this.street4];
            this.intersection = new KreuzungsChaos.Intersection("Intersection", this.streetList);
            this.getLocations(this.streetList);
            this.routeTargets = Vehicle.generateRoute(this.startLocation, this.endLocation);
            console.log("[Car " + this.name + "] Going " + this.startLocation.id + " -> " + this.endLocation.id);
            this.currentStatus = STATUS.STOP;
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
            this.frontRect.position = this.frontHitNode.mtxWorld.translation.toVector2();
            this.backRect.position = this.backHitNode.mtxWorld.translation.toVector2();
            // this.hitbox.appendChild(new Background(mtrHitbox, new fc.Vector2(1, 1), new fc.Vector3(this.frontHitNode.mtxLocal.translation.x, this.frontHitNode.mtxLocal.translation.y, .25)));
            // this.hitbox.appendChild(new Background(mtrHitbox, new fc.Vector2(1, 1), new fc.Vector3(this.backHitNode.mtxLocal.translation.x, this.backHitNode.mtxLocal.translation.y, .25)));
            // root.appendChild(this.hitbox);
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
            this.startLocation = _streetlist[rngStartlocation];
            this.endLocation = _streetlist[rngEndlocation];
        }
        getNextTarget() {
            if (this.routeTargets.length == 0) {
                console.log("TARGET REACHED");
                this.currentStatus = STATUS.ARRIVED;
                this.getParent().removeChild(this);
            }
            else if (this.currentStatus == STATUS.STOP) {
                this.mtxLocal.translation = this.startLocation.startInt;
                this.currentTarget = this.routeTargets.pop();
                this.currentStatus = STATUS.DRIVING;
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
            this.frontRect.position = this.frontHitNode.mtxWorld.translation.toVector2();
            this.backRect.position = this.backHitNode.mtxWorld.translation.toVector2();
            if (KreuzungsChaos.trafficlight.state == KreuzungsChaos.STATE.SIDE_RED || KreuzungsChaos.trafficlight.state == KreuzungsChaos.STATE.ALL_RED) {
                this.stop();
            }
            else {
                this.move();
            }
            if (this.mtxLocal.translation.equals(this.currentTarget)) {
                this.onTargetReached();
            }
        }
        move() {
            this.calculateVelocity();
            this.mtxLocal.rotation = new fc.Vector3(0, 0, Vehicle.calculateRotation(this.mtxLocal.translation, this.currentTarget));
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
            if (this.routeTargets.length == 2) {
                this.velocity = 0;
                this.currentStatus = STATUS.STOP;
            }
            else {
                this.currentStatus = STATUS.DRIVING;
                this.move();
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
            for (let i = 0; i < KreuzungsChaos.vehicles.getChildren().length; i++) {
                let vectorBetween = new fc.Vector3;
                vectorBetween = KreuzungsChaos.vehicles.getChild(i).mtxLocal.translation;
                vectorBetween.subtract(this.mtxLocal.translation);
                if (vectorBetween.x == 0 && KreuzungsChaos.vehicles.getChild(i) != this) {
                    if (vectorBetween.y < 10 && vectorBetween.y > 0) {
                        console.log(this.name + "SIEHT GERADE " + KreuzungsChaos.vehicles.getChild(i).name);
                        console.log(vectorBetween);
                    }
                }
            }
        }
    }
    KreuzungsChaos.Vehicle = Vehicle;
})(KreuzungsChaos || (KreuzungsChaos = {}));
//# sourceMappingURL=vehicle.js.map