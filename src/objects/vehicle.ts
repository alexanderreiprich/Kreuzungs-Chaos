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

        STOP, DRIVING, TURNING, ARRIVED

    }

    export class Vehicle extends GameObject {

        public startLocation: Street;
        public endLocation: Street;
        public currentStatus: STATUS;
        public currentTarget: fc.Vector3;
        public routeTargets: fc.Vector3[];
        public hitbox: fc.Node = new fc.Node("Hitbox");
        public frontRect: fc.Rectangle;
        public backRect: fc.Rectangle;
        public turned: boolean = false;

        public frontHitNode: fc.Node = new fc.Node("FrontHitNode");
        public backHitNode: fc.Node = new fc.Node("FrontBackNode");

        public velocity: number = 0;
        public speedlimit: number = 50;
        public acceleration: number = .5;

        //Standardmap
        street1: Street = new Street("TOPSTREET", new fc.Vector3(13.75, 35, .1), new fc.Vector3(13.75, 18, .1), new fc.Vector3(16.25, 18, .1), new fc.Vector3(16.25, 35, .1), new fc.Vector3(13.75, 21, .1));
        street2: Street = new Street("BOTSTREET", new fc.Vector3(16.25, -5, .1), new fc.Vector3(16.25, 12, .1), new fc.Vector3(13.75, 12, .1), new fc.Vector3(13.75, -5, .1), new fc.Vector3(16.25, 9, .1));
        street3: Street = new Street("LEFTSTREET", new fc.Vector3(-5, 13.75, .1), new fc.Vector3(12, 13.75, .1), new fc.Vector3(12, 16.25, .1), new fc.Vector3(-5, 16.25, .1), new fc.Vector3(9, 13.75, .1));
        street4: Street = new Street("RIGHTSTREET", new fc.Vector3(35, 16.25, .1), new fc.Vector3(18, 16.25, .1), new fc.Vector3(18, 13.75, .1), new fc.Vector3(35, 13.75, .1), new fc.Vector3(21, 16.25, .1));
        streetList: Street[] = [this.street1, this.street2, this.street3, this.street4];
        intersection: Intersection = new Intersection("Intersection", this.streetList);

        public constructor(_name: string, _size: fc.Vector2, _position: fc.Vector3) {

            super(_name, _size, _position);

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

            this.hitbox.appendChild(new Background(mtrHitbox, new fc.Vector2(1, 1), new fc.Vector3(this.frontHitNode.mtxLocal.translation.x, this.frontHitNode.mtxLocal.translation.y, .25)));
            this.hitbox.appendChild(new Background(mtrHitbox, new fc.Vector2(1, 1), new fc.Vector3(this.backHitNode.mtxLocal.translation.x, this.backHitNode.mtxLocal.translation.y, .25)));

            root.appendChild(this.hitbox);
        }

        public static calculateRotation(_currentPos: fc.Vector3, _targetPos: fc.Vector3): number { // Calculates Rotation towards next target

            let directionalVector: fc.Vector2 = fc.Vector3.DIFFERENCE(_targetPos, _currentPos).toVector2();

            directionalVector = new fc.Vector2(directionalVector.y, -directionalVector.x); // Turn 90 deg to match texture

            let angleInRad: number = Math.atan2(directionalVector.y, directionalVector.x);

            return 180 * angleInRad / Math.PI; // Angle in Degrees

        }

        public static calculateMove(_currentPos: fc.Vector3, _targetPos: fc.Vector3, _velocity: number): number { // Calculates movelength

            let directionalVector: fc.Vector2 = fc.Vector3.DIFFERENCE(_targetPos, _currentPos).toVector2();
            let directionalVectorLength: number = directionalVector.magnitude;

            if (directionalVectorLength >= _velocity / 400) {

                return _velocity / 400;

            }
            else {

                return directionalVectorLength;

            }

        }

        public static generateRoute(_startlocation: Street, _endlocation: Street): fc.Vector3[] { // Insert Dijkstra??

            let vectorlist: fc.Vector3[] = [];

            vectorlist.push(_endlocation.endAway);
            vectorlist.push(_endlocation.startAway);
            vectorlist.push(_startlocation.endInt);
            vectorlist.push(_startlocation.stop);

            return vectorlist;

        }

        public getLocations(_streetlist: Street[]): void { // Randomly chooses start and end location

            let rngStartlocation: number = Math.floor(Math.random() * _streetlist.length);
            let rngEndlocation: number;

            do {
                rngEndlocation = Math.floor(Math.random() * _streetlist.length);
            } while (rngStartlocation == rngEndlocation);

            this.startLocation = _streetlist[rngStartlocation];
            this.endLocation = _streetlist[rngEndlocation];

        }

        public getNextTarget(): void { // Changes Target after initialization/reached destination

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

        public onTargetReached(): void { // Listener -> New target

            this.getNextTarget();

        }

        public followPath(): void { // Makes the Vehicle follow the Path     
            

            this.frontRect.position = this.frontHitNode.mtxWorld.translation.toVector2();
            this.backRect.position = this.backHitNode.mtxWorld.translation.toVector2();
            

            if (trafficlight.state == STATE.SIDE_RED || trafficlight.state == STATE.ALL_RED) {
                this.stop();
            }
            else {
                this.move();
            }


            if (this.mtxLocal.translation.equals(this.currentTarget)) {

                this.onTargetReached();

            }

        }

        public move(): void { // Main function that moves the vehicle



            this.calculateVelocity();

            this.mtxLocal.rotation = new fc.Vector3(0, 0, Vehicle.calculateRotation(this.mtxLocal.translation, this.currentTarget));
            this.mtxLocal.translateY(Vehicle.calculateMove(this.mtxLocal.translation, this.currentTarget, this.velocity));

            this.hitbox.getChild(0).mtxLocal.translation = new fc.Vector3(this.frontRect.position.x, this.frontRect.position.y, 0.5);
            this.hitbox.getChild(1).mtxLocal.translation = new fc.Vector3(this.backRect.position.x, this.backRect.position.y, 0.5);

        }

        public stop(): void {

            if (this.routeTargets.length == 2) {
                this.velocity = 0;
                this.currentStatus = STATUS.STOP;
            }
            else {
                this.currentStatus = STATUS.DRIVING;
                this.move();
            }

        }

        public rotateVector(_vector: fc.Vector3, _rotation: number): fc.Vector3 {

            _vector.transform(fc.Matrix4x4.ROTATION_Z(_rotation));
            return _vector;

        }

        public checkOutOfBounds(): boolean { // Checks location and removes once out of canvas

            if (this.mtxLocal.translation.x < -10 || this.mtxLocal.translation.x > 40 || this.mtxLocal.translation.y < -10 || this.mtxLocal.translation.y > 40) {

                this.getParent().removeChild(this);
                console.log("REMOVED");
                return true;

            }
            else {

                return false;

            }

        }

        public calculateVelocity(): void {

            if (this.velocity < this.speedlimit) {

                this.velocity += this.acceleration;

            }

        }

        public checkCollision(_target: Vehicle): boolean {

            let intersectionFront: fc.Rectangle = this.frontRect.getIntersection(_target.frontRect);
            let intersectionBack: fc.Rectangle = this.frontRect.getIntersection(_target.backRect);
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

        public checkInFront(): boolean {

            let frontRay: fc.Ray = new fc.Ray(this.mtxLocal.getY(), this.mtxWorld.translation, 5);

            frontRay.getDistance()

        }

    }

}