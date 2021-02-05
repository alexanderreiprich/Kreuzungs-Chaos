"use strict";
var KreuzungsChaos;
(function (KreuzungsChaos) {
    var fc = FudgeCore;
    //import fcaid = FudgeAid;
    let VEHICLE_TYPE;
    (function (VEHICLE_TYPE) {
        VEHICLE_TYPE[VEHICLE_TYPE["CAR"] = 0] = "CAR";
        VEHICLE_TYPE[VEHICLE_TYPE["TRUCK"] = 1] = "TRUCK";
        VEHICLE_TYPE[VEHICLE_TYPE["BUS"] = 2] = "BUS";
        VEHICLE_TYPE[VEHICLE_TYPE["POLICE"] = 3] = "POLICE";
        VEHICLE_TYPE[VEHICLE_TYPE["PARAMEDIC"] = 4] = "PARAMEDIC";
    })(VEHICLE_TYPE = KreuzungsChaos.VEHICLE_TYPE || (KreuzungsChaos.VEHICLE_TYPE = {}));
    window.addEventListener("load", hndLoad);
    KreuzungsChaos.root = new fc.Node("Root");
    KreuzungsChaos.vehicles = new fc.Node("Vehicles");
    KreuzungsChaos.clrWhite = fc.Color.CSS("white");
    //NOT CHANGEABLE
    KreuzungsChaos.switchCooldown = false;
    let carCounter;
    KreuzungsChaos.background = new fc.Node("Background");
    let mtrCurrentLightstate;
    let txtCross = new fc.TextureImage("../textures/cross.png");
    KreuzungsChaos.mtrCross = new fc.Material("Cross", fc.ShaderTexture, new fc.CoatTextured(KreuzungsChaos.clrWhite, txtCross));
    let txtHitbox = new fc.TextureImage("../textures/hitbox.jpg");
    KreuzungsChaos.mtrHitbox = new fc.Material("Hitbox", fc.ShaderTexture, new fc.CoatTextured(KreuzungsChaos.clrWhite, txtHitbox));
    function hndLoad(_event) {
        //Variables and Constants
        const canvas = document.querySelector("canvas");
        KreuzungsChaos.txtCurrentLightstate = new fc.TextureImage("../textures/trafficlight_states/bot_red.png");
        mtrCurrentLightstate = new fc.Material("Lightstate", fc.ShaderTexture, new fc.CoatTextured(KreuzungsChaos.clrWhite, KreuzungsChaos.txtCurrentLightstate));
        KreuzungsChaos.previousState = 1;
        KreuzungsChaos.currentState = 1;
        KreuzungsChaos.difficulty = 2000;
        carCounter = 0;
        //Camera
        let cmpCamera = new fc.ComponentCamera();
        cmpCamera.pivot.translate(new fc.Vector3(15, 15, 40));
        cmpCamera.pivot.rotateY(180);
        cmpCamera.backgroundColor = fc.Color.CSS("black");
        //Viewport
        KreuzungsChaos.viewport = new fc.Viewport;
        KreuzungsChaos.viewport.initialize("Viewport", KreuzungsChaos.root, cmpCamera, canvas);
        //Functions to load up game
        createGameEnvironment();
        createLights();
        createCar();
        hndTraffic(KreuzungsChaos.difficulty);
        //Timers
        //Initialize Loop
        fc.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, hndLoop);
        fc.Loop.start(fc.LOOP_MODE.TIME_GAME, 60);
    }
    function hndLoop(_event) {
        if (KreuzungsChaos.switchCooldown == false) {
            KreuzungsChaos.trafficlight.hndControl();
        }
        if (KreuzungsChaos.trafficlight.stateUpdate != KreuzungsChaos.currentState) {
            updateLights(KreuzungsChaos.trafficlight.stateUpdate);
            KreuzungsChaos.currentState = KreuzungsChaos.trafficlight.stateUpdate;
            console.log(KreuzungsChaos.root);
        }
        for (let i = 0; i < KreuzungsChaos.vehicles.getChildren().length; i++) {
            let currentVehicle = KreuzungsChaos.vehicles.getChild(i);
            currentVehicle.followPath();
            currentVehicle.checkOutOfBounds();
            currentVehicle.mtxWorld.translation = currentVehicle.mtxLocal.translation;
        }
        //hndCollision();
        KreuzungsChaos.viewport.draw();
    }
    function createGameEnvironment() {
        let txtBackground = new fc.TextureImage("../textures/base_clean.png");
        let mtrBackground = new fc.Material("Background", fc.ShaderTexture, new fc.CoatTextured(KreuzungsChaos.clrWhite, txtBackground));
        KreuzungsChaos.background.appendChild(new KreuzungsChaos.Background(mtrBackground, new fc.Vector2(32, 32), new fc.Vector3(15, 15, 0)));
        let txtLights = new fc.TextureImage("../textures/base_lights_only.png");
        let mtrLights = new fc.Material("Lights", fc.ShaderTexture, new fc.CoatTextured(KreuzungsChaos.clrWhite, txtLights));
        KreuzungsChaos.background.appendChild(new KreuzungsChaos.Background(mtrLights, new fc.Vector2(32, 32), new fc.Vector3(15, 15, 2)));
        let txtBorder = new fc.TextureImage("../textures/border.png");
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
        console.log("LOCAL" + newCar.mtxLocal.translation);
        console.log("WORLD" + newCar.mtxWorld.translation);
    }
    function hndTraffic(_difficulty) {
        let randomFactor = (Math.random() - 0.75) * 100;
        _difficulty = _difficulty + randomFactor;
        fc.Time.game.setTimer(_difficulty, 0, createCar);
    }
    function hndCollision() {
        for (let car of KreuzungsChaos.vehicles.getChildren()) {
            for (let i = 0; i < KreuzungsChaos.vehicles.getChildren().length; i++) {
                let currentVehicle = KreuzungsChaos.vehicles.getChild(i);
                if (currentVehicle.checkCollision(car) && currentVehicle != car) {
                    console.log("collision: " + currentVehicle.name + " with " + car.name);
                    console.log("car 1 " + currentVehicle.mtxWorld.translation + " car 2 " + car.mtxWorld.translation);
                    console.log("pos 1 " + currentVehicle.frontHitNode.mtxWorld.translation + " pos 2 " + car.mtxWorld.translation);
                    fc.Loop.stop();
                }
            }
        }
    }
    function updateLights(_number) {
        switch (_number) {
            case 0:
                KreuzungsChaos.background.removeChild(KreuzungsChaos.trafficlight);
                KreuzungsChaos.txtCurrentLightstate = new fc.TextureImage("../textures/trafficlight_states/all_red.png");
                mtrCurrentLightstate = new fc.Material("Lightstate_All_Red", fc.ShaderTexture, new fc.CoatTextured(KreuzungsChaos.clrWhite, KreuzungsChaos.txtCurrentLightstate));
                KreuzungsChaos.trafficlight = new KreuzungsChaos.Trafficlight(mtrCurrentLightstate, new fc.Vector2(32, 32), new fc.Vector3(15, 15, 3), 0);
                KreuzungsChaos.background.addChild(KreuzungsChaos.trafficlight);
                KreuzungsChaos.root.addChild(KreuzungsChaos.background);
                break;
            case 1:
                KreuzungsChaos.background.removeChild(KreuzungsChaos.trafficlight);
                KreuzungsChaos.txtCurrentLightstate = new fc.TextureImage("../textures/trafficlight_states/bot_red.png");
                mtrCurrentLightstate = new fc.Material("Lightstate_Bot_Red", fc.ShaderTexture, new fc.CoatTextured(KreuzungsChaos.clrWhite, KreuzungsChaos.txtCurrentLightstate));
                KreuzungsChaos.trafficlight = new KreuzungsChaos.Trafficlight(mtrCurrentLightstate, new fc.Vector2(32, 32), new fc.Vector3(15, 15, 3), 1);
                KreuzungsChaos.background.addChild(KreuzungsChaos.trafficlight);
                KreuzungsChaos.root.addChild(KreuzungsChaos.background);
                break;
            case 2:
                KreuzungsChaos.background.removeChild(KreuzungsChaos.trafficlight);
                KreuzungsChaos.txtCurrentLightstate = new fc.TextureImage("../textures/trafficlight_states/side_red.png");
                mtrCurrentLightstate = new fc.Material("Lightstate_Side_Red", fc.ShaderTexture, new fc.CoatTextured(KreuzungsChaos.clrWhite, KreuzungsChaos.txtCurrentLightstate));
                KreuzungsChaos.trafficlight = new KreuzungsChaos.Trafficlight(mtrCurrentLightstate, new fc.Vector2(32, 32), new fc.Vector3(15, 15, 3), 2);
                KreuzungsChaos.background.addChild(KreuzungsChaos.trafficlight);
                KreuzungsChaos.root.addChild(KreuzungsChaos.background);
                break;
            default:
                break;
        }
    }
    function colorGenerator() {
        let colorInt = Math.random();
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
    // function toggleEvent(): Events {
    //     let event: Events = new Events();
    //     return event;
    // }
})(KreuzungsChaos || (KreuzungsChaos = {}));
//# sourceMappingURL=game.js.map