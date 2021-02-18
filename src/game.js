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
    KreuzungsChaos.events = new fc.Node("Events");
    KreuzungsChaos.clrWhite = fc.Color.CSS("white");
    //NOT CHANGEABLE
    KreuzungsChaos.switchCooldown = false;
    let carCounter;
    let cmpAmbientAudio;
    let cmpCrashAudio;
    let soundAmbient = new fc.Audio("assets/ambience.mp3");
    let soundCrash = new fc.Audio("assets/crash.mp3");
    KreuzungsChaos.background = new fc.Node("Background");
    let mtrCurrentLightstate;
    let txtCross = new fc.TextureImage("assets/cross.png");
    KreuzungsChaos.mtrCross = new fc.Material("Cross", fc.ShaderTexture, new fc.CoatTextured(KreuzungsChaos.clrWhite, txtCross));
    let txtHitbox = new fc.TextureImage("assets/hitbox.jpg");
    KreuzungsChaos.mtrHitbox = new fc.Material("Hitbox", fc.ShaderTexture, new fc.CoatTextured(KreuzungsChaos.clrWhite, txtHitbox));
    async function hndLoad(_event) {
        //Create Game and load Data
        const canvas = document.querySelector("canvas");
        await KreuzungsChaos.communicate("src/data/data.json");
        console.log(KreuzungsChaos.gameSettings.difficulty);
        //Variables and Constants
        KreuzungsChaos.previousState = 1;
        KreuzungsChaos.currentState = 1;
        KreuzungsChaos.difficulty = KreuzungsChaos.gameSettings.difficulty;
        carCounter = 0;
        KreuzungsChaos.score = 0;
        //Textures
        KreuzungsChaos.txtCurrentLightstate = new fc.TextureImage("assets/trafficlight_states/bot_red.png");
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
        //Timers
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
        hndEmergency();
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
        console.log("LOCAL" + newCar.mtxLocal.translation);
        console.log("WORLD" + newCar.mtxWorld.translation);
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
                    console.log("car 1 " + currentVehicle.mtxWorld.translation + " car 2 " + car.mtxWorld.translation);
                    console.log("pos 1 " + currentVehicle.frontHitNode.mtxWorld.translation + " pos 2 " + car.mtxWorld.translation);
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
    function hndEmergency() {
        KreuzungsChaos.trafficlight.checkForEmergency();
    }
    function hndLoss() {
        setTimeout(function () {
            window.location.href = "resultscreen.html";
        }, 5000);
    }
    function updateLights(_number) {
        switch (_number) {
            case 0:
                KreuzungsChaos.background.removeChild(KreuzungsChaos.trafficlight);
                KreuzungsChaos.txtCurrentLightstate = new fc.TextureImage("assets/trafficlight_states/all_red.png");
                mtrCurrentLightstate = new fc.Material("Lightstate_All_Red", fc.ShaderTexture, new fc.CoatTextured(KreuzungsChaos.clrWhite, KreuzungsChaos.txtCurrentLightstate));
                KreuzungsChaos.trafficlight = new KreuzungsChaos.Trafficlight(mtrCurrentLightstate, new fc.Vector2(32, 32), new fc.Vector3(15, 15, 3), 0);
                KreuzungsChaos.background.addChild(KreuzungsChaos.trafficlight);
                KreuzungsChaos.root.addChild(KreuzungsChaos.background);
                break;
            case 1:
                KreuzungsChaos.background.removeChild(KreuzungsChaos.trafficlight);
                KreuzungsChaos.txtCurrentLightstate = new fc.TextureImage("assets/trafficlight_states/bot_red.png");
                mtrCurrentLightstate = new fc.Material("Lightstate_Bot_Red", fc.ShaderTexture, new fc.CoatTextured(KreuzungsChaos.clrWhite, KreuzungsChaos.txtCurrentLightstate));
                KreuzungsChaos.trafficlight = new KreuzungsChaos.Trafficlight(mtrCurrentLightstate, new fc.Vector2(32, 32), new fc.Vector3(15, 15, 3), 1);
                KreuzungsChaos.background.addChild(KreuzungsChaos.trafficlight);
                KreuzungsChaos.root.addChild(KreuzungsChaos.background);
                break;
            case 2:
                KreuzungsChaos.background.removeChild(KreuzungsChaos.trafficlight);
                KreuzungsChaos.txtCurrentLightstate = new fc.TextureImage("assets/trafficlight_states/side_red.png");
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
    // function toggleEvent(): Events {
    //     let event: Events = new Events();
    //     return event;
    // }
})(KreuzungsChaos || (KreuzungsChaos = {}));
//# sourceMappingURL=game.js.map