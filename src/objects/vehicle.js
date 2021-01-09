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
            this.velocity = 0;
            this.speedlimit = 50;
            this.acceleration = .5;
            //Standardmap
            this.street1 = new KreuzungsChaos.Street("TOPSTREET", new fc.Vector3(13.75, 35, .1), new fc.Vector3(13.75, 18, .1), new fc.Vector3(16.25, 18, .1), new fc.Vector3(16.25, 35, .1));
            this.street2 = new KreuzungsChaos.Street("BOTSTREET", new fc.Vector3(16.25, -5, .1), new fc.Vector3(16.25, 12, .1), new fc.Vector3(13.75, 12, .1), new fc.Vector3(13.75, -5, .1));
            this.street3 = new KreuzungsChaos.Street("LEFTSTREET", new fc.Vector3(-5, 13.75, .1), new fc.Vector3(12, 13.75, .1), new fc.Vector3(12, 16.25, .1), new fc.Vector3(-5, 16.25, .1));
            this.street4 = new KreuzungsChaos.Street("RIGHTSTREET", new fc.Vector3(35, 16.25, .1), new fc.Vector3(18, 16.25, .1), new fc.Vector3(18, 13.75, .1), new fc.Vector3(35, 13.75, .1));
            this.streetList = [this.street1, this.street2, this.street3, this.street4];
            this.intersection = new KreuzungsChaos.Intersection("Intersection", this.streetList);
            this.getLocations(this.streetList);
            this.routeTargets = Vehicle.generateRoute(this.startLocation, this.endLocation);
            console.log("[Car " + this.name + "] Going " + this.startLocation.id + " -> " + this.endLocation.id);
            this.currentStatus = STATUS.STOP;
            this.getNextTarget();
            this.initCorrectCollision(Vehicle.calculateRotation(this.mtxLocal.translation, this.currentTarget));
            this.hitbox.appendChild(new KreuzungsChaos.Background(KreuzungsChaos.mtrHitbox, new fc.Vector2(1, 1), new fc.Vector3(this.frontRect.x, this.frontRect.y, .25)));
            this.hitbox.appendChild(new KreuzungsChaos.Background(KreuzungsChaos.mtrHitbox, new fc.Vector2(1, 1), new fc.Vector3(this.backRect.x, this.backRect.y, .25)));
            KreuzungsChaos.root.appendChild(this.hitbox);
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
            return vectorlist;
        }
        initCollision(_direction) {
            console.log(_direction);
            switch (_direction) {
                case 90:
                    this.frontRect = new fc.Rectangle(this.mtxLocal.translation.x + 0.25, this.mtxLocal.translation.y + 1, 2, 2, fc.ORIGIN2D.CENTER);
                    this.backRect = new fc.Rectangle(this.mtxLocal.translation.x + 1.75, this.mtxLocal.translation.y + 1, 2, 2, fc.ORIGIN2D.CENTER);
                    break;
                case -90:
                    this.frontRect = new fc.Rectangle(this.mtxLocal.translation.x + 1.75, this.mtxLocal.translation.y + 1, 2, 2, fc.ORIGIN2D.CENTER);
                    this.backRect = new fc.Rectangle(this.mtxLocal.translation.x + 0.25, this.mtxLocal.translation.y + 1, 2, 2, fc.ORIGIN2D.CENTER);
                    break;
                case -180:
                    this.frontRect = new fc.Rectangle(this.mtxLocal.translation.x + 1, this.mtxLocal.translation.y + 0.25, 2, 2, fc.ORIGIN2D.CENTER);
                    this.backRect = new fc.Rectangle(this.mtxLocal.translation.x + 1, this.mtxLocal.translation.y + 1.75, 2, 2, fc.ORIGIN2D.CENTER);
                    break;
                case -0:
                    this.frontRect = new fc.Rectangle(this.mtxLocal.translation.x + 1, this.mtxLocal.translation.y + 1.75, 2, 2, fc.ORIGIN2D.CENTER);
                    this.backRect = new fc.Rectangle(this.mtxLocal.translation.x + 1, this.mtxLocal.translation.y + 0.25, 2, 2, fc.ORIGIN2D.CENTER);
                    break;
                default:
                    console.log("ALERT - NO COLLISION INITIALIZED");
                    break;
            }
        }
        initCorrectCollision(_direction) {
            let frontVector = new fc.Vector3(1, 1.75, 0);
            let backVector = new fc.Vector3(1, 0.25, 0);
            frontVector = this.rotateVector(frontVector, _direction);
            backVector = this.rotateVector(backVector, _direction);
            frontVector.add(this.mtxLocal.translation);
            backVector.add(this.mtxLocal.translation);
            this.frontRect = new fc.Rectangle(this.mtxLocal.translation.x, this.mtxLocal.translation.y, 2, 2, fc.ORIGIN2D.CENTER);
            this.backRect = new fc.Rectangle(this.currentTarget.x, this.currentTarget.y, 2, 2, fc.ORIGIN2D.CENTER);
            //this.frontRect = new fc.Rectangle(frontVector.x, frontVector.y, 2, 2, fc.ORIGIN2D.CENTER);
            // this.backRect = new fc.Rectangle(backVector.x, backVector.y, 2, 2, fc.ORIGIN2D.CENTER);
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
            if (this.currentStatus != STATUS.STOP && this.currentStatus != STATUS.ARRIVED) {
                this.move();
                if (this.mtxLocal.translation.equals(this.currentTarget)) {
                    this.onTargetReached();
                }
            }
        }
        move() {
            this.calculateVelocity();
            this.mtxLocal.rotation = new fc.Vector3(0, 0, Vehicle.calculateRotation(this.mtxLocal.translation, this.currentTarget));
            this.mtxLocal.translateY(Vehicle.calculateMove(this.mtxLocal.translation, this.currentTarget, this.velocity));
            this.initCorrectCollision(Vehicle.calculateRotation(this.mtxLocal.translation, this.currentTarget));
            this.hitbox.getChild(0).mtxLocal.translation = new fc.Vector3(this.frontRect.position.x, this.frontRect.position.y, 0.5);
            this.hitbox.getChild(1).mtxLocal.translation = new fc.Vector3(this.backRect.position.x, this.backRect.position.y, 0.5);
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
            let intersection = this.rect.getIntersection(_target.rect);
            if (intersection == null)
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
    }
    KreuzungsChaos.Vehicle = Vehicle;
})(KreuzungsChaos || (KreuzungsChaos = {}));
//# sourceMappingURL=vehicle.js.map