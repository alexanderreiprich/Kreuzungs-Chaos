"use strict";
var KreuzungsChaos;
(function (KreuzungsChaos) {
    window.addEventListener("load", hndLoad);
    function hndLoad(_event) {
        document.getElementById("score").innerHTML = window.localStorage.getItem("score");
        document.getElementById("highscore").innerHTML = window.localStorage.getItem("highscore");
    }
})(KreuzungsChaos || (KreuzungsChaos = {}));
var KreuzungsChaos;
(function (KreuzungsChaos) {
    var fc = FudgeCore;
    window.addEventListener("load", hndLoad);
    KreuzungsChaos.root = new fc.Node("Root");
    KreuzungsChaos.vehicles = new fc.Node("Vehicles");
    KreuzungsChaos.clrWhite = fc.Color.CSS("white");
    KreuzungsChaos.switchCooldown = false;
    let carCounter;
    let cmpAmbientAudio;
    let cmpCrashAudio;
    let soundAmbient = new fc.Audio("assets/ambience.mp3");
    let soundCrash = new fc.Audio("assets/crash.mp3");
    KreuzungsChaos.background = new fc.Node("Background");
    let mtrCurrentLightstate;
    let txtHitbox = new fc.TextureImage("assets/hitbox.jpg");
    KreuzungsChaos.mtrHitbox = new fc.Material("Hitbox", fc.ShaderTexture, new fc.CoatTextured(KreuzungsChaos.clrWhite, txtHitbox));
    async function hndLoad(_event) {
        //Create Game and load Data
        const canvas = document.querySelector("canvas");
        await KreuzungsChaos.communicate("src/data/data.json");
        //Variables and Constants
        KreuzungsChaos.previousState = 1;
        KreuzungsChaos.currentState = 1;
        KreuzungsChaos.difficulty = KreuzungsChaos.gameSettings.difficulty;
        carCounter = 0;
        KreuzungsChaos.score = 0;
        //Textures
        KreuzungsChaos.txtCurrentLightstate = new fc.TextureImage("assets/bot_red.png");
        mtrCurrentLightstate = new fc.Material("Lightstate", fc.ShaderTexture, new fc.CoatTextured(KreuzungsChaos.clrWhite, KreuzungsChaos.txtCurrentLightstate));
        //Camera
        let cmpCamera = new fc.ComponentCamera();
        cmpCamera.pivot.translate(new fc.Vector3(15, 15, 40));
        cmpCamera.pivot.rotateY(180);
        cmpCamera.backgroundColor = fc.Color.CSS("black");
        //Audio
        cmpAmbientAudio = new fc.ComponentAudio(soundAmbient, true, true);
        cmpAmbientAudio.connect(true);
        cmpAmbientAudio.volume = 0.1;
        cmpAmbientAudio.setAudio(soundAmbient);
        cmpAmbientAudio.play(true);
        cmpCrashAudio = new fc.ComponentAudio(soundCrash, false, false);
        cmpCrashAudio.connect(true);
        cmpCrashAudio.volume = 0.25;
        cmpCrashAudio.setAudio(soundCrash);
        //Viewport
        KreuzungsChaos.viewport = new fc.Viewport;
        KreuzungsChaos.viewport.initialize("Viewport", KreuzungsChaos.root, cmpCamera, canvas);
        //Functions to load up game
        createGameEnvironment();
        createLights();
        createCar();
        hndTraffic(KreuzungsChaos.difficulty);
        window.addEventListener("click", hndClick);
        //Initialize Loop
        fc.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, hndLoop);
        fc.Loop.start(fc.LOOP_MODE.TIME_GAME, 60);
    }
    function hndLoop(_event) {
        for (let i = 0; i < KreuzungsChaos.vehicles.getChildren().length; i++) {
            let currentVehicle = KreuzungsChaos.vehicles.getChild(i);
            if (currentVehicle.angryometerInit == true && currentVehicle.angryometer == 3) {
                currentVehicle.followPathIgnoreStops();
            }
            else if (currentVehicle.angryometerInit == false && currentVehicle.velocity == 0) { // Auto hält gerade an
                currentVehicle.angryometerInit = true;
                fc.Time.game.setTimer(KreuzungsChaos.gameSettings.patience, 3, currentVehicle.hndAngryOMeter.bind(currentVehicle));
            }
            else if (currentVehicle.angryometerInit == true && currentVehicle.velocity != 0) { // Auto fährt wieder
                if (currentVehicle.checkInFront() == false && currentVehicle.angryometer != 3) { // Auto fährt vor 
                    currentVehicle.followPath();
                }
            }
            else if (currentVehicle.angryometerInit == true && currentVehicle.velocity == 0) { // Auto steht
                currentVehicle.followPath();
            }
            else {
                currentVehicle.followPath();
            }
            currentVehicle.mtxWorld.translation = currentVehicle.mtxLocal.translation;
        }
        if (KreuzungsChaos.gameSettings.collision == true) {
            hndCollision();
        }
        updateScore();
        KreuzungsChaos.viewport.draw();
    }
    function createGameEnvironment() {
        let txtBackground = new fc.TextureImage("assets/base_detail.png");
        let mtrBackground = new fc.Material("Background", fc.ShaderTexture, new fc.CoatTextured(KreuzungsChaos.clrWhite, txtBackground));
        KreuzungsChaos.background.appendChild(new KreuzungsChaos.Background(mtrBackground, new fc.Vector2(32, 32), new fc.Vector3(15, 15, 0)));
        let txtLights = new fc.TextureImage("assets/base_lights_only.png");
        let mtrLights = new fc.Material("Lights", fc.ShaderTexture, new fc.CoatTextured(KreuzungsChaos.clrWhite, txtLights));
        KreuzungsChaos.background.appendChild(new KreuzungsChaos.Background(mtrLights, new fc.Vector2(32, 32), new fc.Vector3(15, 15, 2)));
        let txtBorder = new fc.TextureImage("assets/border.png");
        let mtrBorder = new fc.Material("Border", fc.ShaderTexture, new fc.CoatTextured(KreuzungsChaos.clrWhite, txtBorder));
        KreuzungsChaos.background.appendChild(new KreuzungsChaos.Background(mtrBorder, new fc.Vector2(25, 25), new fc.Vector3(15, 15, 10)));
        return KreuzungsChaos.background;
    }
    function createLights() {
        let lightstate = new fc.Node("Lightstate");
        KreuzungsChaos.trafficlight = new KreuzungsChaos.Trafficlight(mtrCurrentLightstate, new fc.Vector2(32, 32), new fc.Vector3(15, 15, 3), KreuzungsChaos.previousState);
        KreuzungsChaos.trafficlight.appendChild(lightstate);
        KreuzungsChaos.background.appendChild(KreuzungsChaos.trafficlight);
        KreuzungsChaos.root.appendChild(KreuzungsChaos.background);
        KreuzungsChaos.previousState = KreuzungsChaos.trafficlight.state.valueOf();
        return KreuzungsChaos.trafficlight;
    }
    function createCar() {
        carCounter++;
        let newCar = new KreuzungsChaos.Car("Car_" + carCounter, new fc.Vector3(35, 35, .1), colorGenerator());
        KreuzungsChaos.vehicles.addChild(newCar);
        KreuzungsChaos.root.addChild(KreuzungsChaos.vehicles);
    }
    function hndTraffic(_difficulty) {
        let randomFactor = fc.Random.default.getRange(-750, 150);
        _difficulty = _difficulty + randomFactor;
        fc.Time.game.setTimer(_difficulty, 0, createCar);
    }
    function hndCollision() {
        for (let car of KreuzungsChaos.vehicles.getChildren()) {
            for (let i = 0; i < KreuzungsChaos.vehicles.getChildren().length; i++) {
                let currentVehicle = KreuzungsChaos.vehicles.getChild(i);
                if (currentVehicle.checkCollision(car) && currentVehicle != car) {
                    console.log("collision: " + currentVehicle.name + " with " + car.name);
                    cmpCrashAudio.play(true);
                    fc.Loop.stop();
                    hndLoss();
                }
            }
        }
    }
    function hndClick() {
        if (KreuzungsChaos.switchCooldown == false) {
            KreuzungsChaos.trafficlight.hndControl();
        }
        updateLights(KreuzungsChaos.trafficlight.stateUpdate);
        KreuzungsChaos.currentState = KreuzungsChaos.trafficlight.stateUpdate;
    }
    function hndLoss() {
        window.localStorage.setItem("score", KreuzungsChaos.score.toString());
        if (KreuzungsChaos.score > +window.localStorage.getItem("highscore")) {
            window.localStorage.setItem("highscore", KreuzungsChaos.score.toString());
        }
        setTimeout(function () {
            window.location.href = "resultscreen.html";
        }, 5000);
    }
    function updateLights(_number) {
        switch (_number) {
            case 0:
                KreuzungsChaos.background.removeChild(KreuzungsChaos.trafficlight);
                KreuzungsChaos.txtCurrentLightstate = new fc.TextureImage("assets/all_red.png");
                mtrCurrentLightstate = new fc.Material("Lightstate_All_Red", fc.ShaderTexture, new fc.CoatTextured(KreuzungsChaos.clrWhite, KreuzungsChaos.txtCurrentLightstate));
                KreuzungsChaos.trafficlight = new KreuzungsChaos.Trafficlight(mtrCurrentLightstate, new fc.Vector2(32, 32), new fc.Vector3(15, 15, 3), 0);
                KreuzungsChaos.background.addChild(KreuzungsChaos.trafficlight);
                KreuzungsChaos.root.addChild(KreuzungsChaos.background);
                break;
            case 1:
                KreuzungsChaos.background.removeChild(KreuzungsChaos.trafficlight);
                KreuzungsChaos.txtCurrentLightstate = new fc.TextureImage("assets/bot_red.png");
                mtrCurrentLightstate = new fc.Material("Lightstate_Bot_Red", fc.ShaderTexture, new fc.CoatTextured(KreuzungsChaos.clrWhite, KreuzungsChaos.txtCurrentLightstate));
                KreuzungsChaos.trafficlight = new KreuzungsChaos.Trafficlight(mtrCurrentLightstate, new fc.Vector2(32, 32), new fc.Vector3(15, 15, 3), 1);
                KreuzungsChaos.background.addChild(KreuzungsChaos.trafficlight);
                KreuzungsChaos.root.addChild(KreuzungsChaos.background);
                break;
            case 2:
                KreuzungsChaos.background.removeChild(KreuzungsChaos.trafficlight);
                KreuzungsChaos.txtCurrentLightstate = new fc.TextureImage("assets/side_red.png");
                mtrCurrentLightstate = new fc.Material("Lightstate_Side_Red", fc.ShaderTexture, new fc.CoatTextured(KreuzungsChaos.clrWhite, KreuzungsChaos.txtCurrentLightstate));
                KreuzungsChaos.trafficlight = new KreuzungsChaos.Trafficlight(mtrCurrentLightstate, new fc.Vector2(32, 32), new fc.Vector3(15, 15, 3), 2);
                KreuzungsChaos.background.addChild(KreuzungsChaos.trafficlight);
                KreuzungsChaos.root.addChild(KreuzungsChaos.background);
                break;
            default:
                break;
        }
    }
    function updateScore() {
        let divScore = document.querySelector("div#scoreNumber");
        divScore.innerHTML = KreuzungsChaos.score.toString();
    }
    function colorGenerator() {
        let colorInt = Math.random();
        if (KreuzungsChaos.gameSettings.color != 6) {
            return KreuzungsChaos.gameSettings.color;
        }
        else {
            if (colorInt <= 0.2) {
                return 0;
            }
            else if (colorInt > 0.2 && colorInt <= 0.4) {
                return 1;
            }
            else if (colorInt > 0.24 && colorInt <= 0.6) {
                return 2;
            }
            else if (colorInt > 0.6 && colorInt <= 0.8) {
                return 3;
            }
            else {
                return 4;
            }
        }
    }
})(KreuzungsChaos || (KreuzungsChaos = {}));
var KreuzungsChaos;
(function (KreuzungsChaos) {
    var fc = FudgeCore;
    let GameObject = /** @class */ (() => {
        class GameObject extends fc.Node {
            constructor(_name, _size, _position) {
                super(_name);
                //this.rect = new fc.Rectangle(_position.x, _position.y, _size.x, _size.y, fc.ORIGIN2D.CENTER);
                this.addComponent(new fc.ComponentTransform(fc.Matrix4x4.TRANSLATION(_position)));
                let cmpQuad = new fc.ComponentMesh(GameObject.meshQuad);
                this.addComponent(cmpQuad);
                cmpQuad.pivot.scale(_size.toVector3(0));
            }
        }
        GameObject.meshQuad = new fc.MeshQuad();
        return GameObject;
    })();
    KreuzungsChaos.GameObject = GameObject;
})(KreuzungsChaos || (KreuzungsChaos = {}));
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
            this.angryometer = 0;
            this.angryometerInit = false;
            this.abortTimer = false;
            this.soundHorn = new fc.Audio("assets/carhorn.mp3");
            this.soundHorn2 = new fc.Audio("assets/carhorn2.mp3");
            this.frontHitNode = new fc.Node("FrontHitNode");
            this.backHitNode = new fc.Node("FrontBackNode");
            this.velocity = 1;
            this.speedlimit = KreuzungsChaos.gameSettings.speedlimit;
            this.acceleration = KreuzungsChaos.gameSettings.acceleration;
            //Standardmap
            this.street1 = new KreuzungsChaos.Street("TOPSTREET", new fc.Vector3(13.75, 35, .1), new fc.Vector3(13.75, 18, .1), new fc.Vector3(16.25, 18, .1), new fc.Vector3(16.25, 35, .1), new fc.Vector3(13.75, 22, .1));
            this.street2 = new KreuzungsChaos.Street("RIGHTSTREET", new fc.Vector3(35, 16.25, .1), new fc.Vector3(18, 16.25, .1), new fc.Vector3(18, 13.75, .1), new fc.Vector3(35, 13.75, .1), new fc.Vector3(22, 16.25, .1));
            this.street3 = new KreuzungsChaos.Street("BOTSTREET", new fc.Vector3(16.25, -5, .1), new fc.Vector3(16.25, 12, .1), new fc.Vector3(13.75, 12, .1), new fc.Vector3(13.75, -5, .1), new fc.Vector3(16.25, 8, .1));
            this.street4 = new KreuzungsChaos.Street("LEFTSTREET", new fc.Vector3(-5, 13.75, .1), new fc.Vector3(12, 13.75, .1), new fc.Vector3(12, 16.25, .1), new fc.Vector3(-5, 16.25, .1), new fc.Vector3(8, 13.75, .1));
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
            this.frontHitNode.mtxLocal.translateY(0.85); // Translating hitbox to corresponding car parts
            this.backHitNode.mtxLocal.translateY(-0.85);
            this.appendChild(this.frontHitNode);
            this.appendChild(this.backHitNode);
            this.frontRect = new fc.Rectangle(this.frontHitNode.mtxLocal.translation.x, this.frontHitNode.mtxLocal.translation.y, 2, 2, fc.ORIGIN2D.CENTER);
            this.backRect = new fc.Rectangle(this.backHitNode.mtxLocal.translation.x, this.backHitNode.mtxLocal.translation.y, 2, 2, fc.ORIGIN2D.CENTER);
            this.frontRect.position = this.frontHitNode.mtxLocal.translation.toVector2();
            this.backRect.position = this.backHitNode.mtxLocal.translation.toVector2();
            this.cmpAudio = new fc.ComponentAudio(this.soundHorn, false, false);
            this.cmpAudio.connect(true);
            this.cmpAudio.volume = 0.1;
            if (KreuzungsChaos.gameSettings.drawHitboxes) {
                this.hitbox.appendChild(new KreuzungsChaos.Background(KreuzungsChaos.mtrHitbox, new fc.Vector2(1, 1), new fc.Vector3(this.frontHitNode.mtxLocal.translation.x, this.frontHitNode.mtxLocal.translation.y, .25)));
                this.hitbox.appendChild(new KreuzungsChaos.Background(KreuzungsChaos.mtrHitbox, new fc.Vector2(1, 1), new fc.Vector3(this.backHitNode.mtxLocal.translation.x, this.backHitNode.mtxLocal.translation.y, .25)));
            }
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
            this.startLocation = _streetlist[rngStartlocation];
            this.startLocationID = rngStartlocation;
            this.endLocation = _streetlist[rngEndlocation];
            this.endLocationID = rngEndlocation;
            if (rngEndlocation == rngStartlocation + 1) {
                this.getLocations(this.streetList);
            }
            else if (rngStartlocation == 3 && rngEndlocation == 0) {
                this.getLocations(this.streetList);
            }
        }
        getNextTarget() {
            if (this.routeTargets.length == 0) {
                this.currentStatus = STATUS.ARRIVED;
                this.getParent().removeChild(this);
                KreuzungsChaos.score += 1000;
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
            if (this.startLocationID == 0 || this.startLocationID == 2) {
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
        followPathIgnoreStops() {
            this.mtxWorld.translation = this.mtxLocal.translation;
            this.frontRect.position = this.frontHitNode.mtxWorld.translation.toVector2();
            this.backRect.position = this.backHitNode.mtxWorld.translation.toVector2();
            this.move();
            if (this.mtxLocal.translation.equals(this.currentTarget)) {
                this.onTargetReached();
            }
        }
        move() {
            if (this.currentStatus != STATUS.DRIVING) {
                this.currentStatus = STATUS.DRIVING;
            }
            this.calculateVelocity();
            this.mtxLocal.rotation = new fc.Vector3(0, 0, Vehicle.calculateRotation(this.mtxLocal.translation, this.currentTarget));
            switch (Vehicle.calculateRotation(this.mtxLocal.translation, this.currentTarget)) {
                case 0:
                    this.currentDirection = LOCATION.TOP;
                    break;
                case -0:
                    this.currentDirection = LOCATION.TOP;
                    break;
                case -90:
                    this.currentDirection = LOCATION.RIGHT;
                    break;
                case -180:
                    this.currentDirection = LOCATION.BOT;
                    break;
                case 90:
                    this.currentDirection = LOCATION.LEFT;
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
            this.velocity = 0;
            if (this.currentStatus != STATUS.STOP) {
                this.currentStatus = STATUS.STOP;
            }
        }
        hndEvent() {
            this.moveAside();
            //if event over
            this.moveBack();
        }
        hndAngryOMeter() {
            if (this.velocity == 0) {
                if (this.angryometer != 3) {
                    this.cmpAudio.setAudio(this.soundHorn);
                    this.cmpAudio.play(true);
                    this.angryometer++;
                }
            }
        }
        rotateVector(_vector, _rotation) {
            _vector.transform(fc.Matrix4x4.ROTATION_Z(_rotation));
            return _vector;
        }
        checkOutOfBounds() {
            if (this.mtxWorld.translation.x < -10 || this.mtxWorld.translation.x > 40 || this.mtxWorld.translation.y < -10 || this.mtxWorld.translation.y > 40) {
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
                    return true;
                }
                else {
                    return false;
                }
            }
        }
        checkInFront() {
            for (let i = 0; i < KreuzungsChaos.vehicles.getChildren().length; i++) {
                let currentchild = KreuzungsChaos.vehicles.getChild(i);
                if (!(currentchild.name === this.name)) {
                    let vectorBetween = fc.Vector3.DIFFERENCE(currentchild.mtxWorld.translation, this.mtxWorld.translation).toVector2();
                    let vectorTarget = fc.Vector3.DIFFERENCE(this.currentTarget, this.mtxWorld.translation).toVector2();
                    let v = fc.Vector2.DOT(vectorBetween, vectorTarget) / (vectorBetween.magnitude * vectorTarget.magnitude);
                    let rotation = 180 * Math.acos(v) / Math.PI;
                    if (vectorBetween.magnitude <= 3.5 && rotation < 10) {
                        return true;
                    }
                }
            }
            return false;
        }
    }
    KreuzungsChaos.Vehicle = Vehicle;
})(KreuzungsChaos || (KreuzungsChaos = {}));
///<reference path= "gameobject.ts"/>
///<reference path= "vehicle.ts"/>
var KreuzungsChaos;
///<reference path= "gameobject.ts"/>
///<reference path= "vehicle.ts"/>
(function (KreuzungsChaos) {
    var fc = FudgeCore;
    class Background extends KreuzungsChaos.GameObject {
        constructor(_material, _size, _position) {
            super("Background", _size, _position);
            let cmpMaterial = new fc.ComponentMaterial(_material);
            this.addComponent(cmpMaterial);
        }
    }
    KreuzungsChaos.Background = Background;
})(KreuzungsChaos || (KreuzungsChaos = {}));
var KreuzungsChaos;
(function (KreuzungsChaos) {
    var fc = FudgeCore;
    let txtCar;
    class Car extends KreuzungsChaos.Vehicle {
        constructor(_name, _position, _color) {
            super(_name, new fc.Vector2(2, 3), _position);
            this.chooseColor(_color);
            let mtrCar = new fc.Material("Car", fc.ShaderTexture, new fc.CoatTextured(KreuzungsChaos.clrWhite, txtCar));
            let cmpMaterial = new fc.ComponentMaterial(mtrCar);
            this.addComponent(cmpMaterial);
        }
        chooseColor(_color) {
            switch (_color) {
                case 0:
                    txtCar = new fc.TextureImage("assets/car_0.png");
                    break;
                case 1:
                    txtCar = new fc.TextureImage("assets/car_1.png");
                    break;
                case 2:
                    txtCar = new fc.TextureImage("assets/car_2.png");
                    break;
                case 3:
                    txtCar = new fc.TextureImage("assets/car_3.png");
                    break;
                case 4:
                    txtCar = new fc.TextureImage("assets/car_4.png");
                    break;
                case 5:
                    txtCar = new fc.TextureImage("assets/police.png");
                    break;
                default:
                    break;
            }
        }
    }
    KreuzungsChaos.Car = Car;
})(KreuzungsChaos || (KreuzungsChaos = {}));
var KreuzungsChaos;
(function (KreuzungsChaos) {
    async function communicate(_url) {
        let response = await fetch(_url);
        let settingsJSON = await response.json();
        KreuzungsChaos.gameSettings = settingsJSON;
    }
    KreuzungsChaos.communicate = communicate;
})(KreuzungsChaos || (KreuzungsChaos = {}));
var KreuzungsChaos;
(function (KreuzungsChaos) {
    class Intersection {
        constructor(_id, _streetlist) {
            this.id = _id;
            this.streetlist = _streetlist;
        }
    }
    KreuzungsChaos.Intersection = Intersection;
})(KreuzungsChaos || (KreuzungsChaos = {}));
var KreuzungsChaos;
(function (KreuzungsChaos) {
    class Street {
        constructor(_id, _startInt, _endInt, _startAway, _endAway, _stop) {
            this.id = _id;
            this.startInt = _startInt;
            this.endInt = _endInt;
            this.startAway = _startAway;
            this.endAway = _endAway;
            this.stop = _stop;
        }
    }
    KreuzungsChaos.Street = Street;
})(KreuzungsChaos || (KreuzungsChaos = {}));
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
            fc.Time.game.setTimer(KreuzungsChaos.gameSettings.lightswitchCooldown, 0, function changeBoolean() {
                KreuzungsChaos.switchCooldown = false;
            });
            return this.stateUpdate;
        }
    }
    KreuzungsChaos.Trafficlight = Trafficlight;
})(KreuzungsChaos || (KreuzungsChaos = {}));
//# sourceMappingURL=main.js.map