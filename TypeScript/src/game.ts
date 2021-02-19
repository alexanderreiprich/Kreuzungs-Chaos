namespace KreuzungsChaos {

    import fc = FudgeCore;

    window.addEventListener("load", hndLoad);

    export let currentState: number;
    export let previousState: number;
    export let viewport: fc.Viewport;
    export let txtCurrentLightstate: fc.TextureImage;
    export let root: fc.Node = new fc.Node("Root");
    export let vehicles: fc.Node = new fc.Node("Vehicles");
    export const clrWhite: fc.Color = fc.Color.CSS("white");

    export let difficulty: number;

    export let switchCooldown: boolean = false;
    let carCounter: number;

    export let score: number;

    let cmpAmbientAudio: fc.ComponentAudio;
    let cmpCrashAudio: fc.ComponentAudio;
    let soundAmbient: fc.Audio = new fc.Audio("assets/ambience.mp3");
    let soundCrash: fc.Audio = new fc.Audio("assets/crash.mp3");

    export let background: fc.Node = new fc.Node("Background");
    let mtrCurrentLightstate: fc.Material;
    export let trafficlight: Trafficlight;

    let txtHitbox: fc.TextureImage = new fc.TextureImage("assets/hitbox.jpg");
    export let mtrHitbox: fc.Material = new fc.Material("Hitbox", fc.ShaderTexture, new fc.CoatTextured(clrWhite, txtHitbox));

    async function hndLoad(_event: Event): Promise <void> {

        //Create Game and load Data
        const canvas: HTMLCanvasElement = document.querySelector("canvas");
        await communicate("src/data/data.json");

        //Variables and Constants
        previousState = 1;
        currentState = 1;
        difficulty = gameSettings.difficulty;
        carCounter = 0;
        score = 0;

        //Textures
        txtCurrentLightstate = new fc.TextureImage("assets/bot_red.png");
        mtrCurrentLightstate = new fc.Material("Lightstate", fc.ShaderTexture, new fc.CoatTextured(clrWhite, txtCurrentLightstate));

        //Camera
        let cmpCamera: fc.ComponentCamera = new fc.ComponentCamera();
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
        viewport = new fc.Viewport;
        viewport.initialize("Viewport", root, cmpCamera, canvas);

        //Functions to load up game
        createGameEnvironment();
        createLights();
        createCar();
        hndTraffic(difficulty);
        window.addEventListener("click", hndClick);

        //Initialize Loop
        fc.Loop.addEventListener(fc.EVENT.LOOP_FRAME, hndLoop);
        fc.Loop.start(fc.LOOP_MODE.TIME_GAME, 60);

    }

    function hndLoop(_event: Event): void {

        for (let i: number = 0; i < vehicles.getChildren().length; i++) {
            let currentVehicle: Vehicle = <Vehicle>vehicles.getChild(i);

            if (currentVehicle.angryometerInit == true && currentVehicle.angryometer == 3) {
                currentVehicle.followPathIgnoreStops();
            }
            else if (currentVehicle.angryometerInit == false && currentVehicle.velocity == 0) { // Auto hält gerade an

                currentVehicle.angryometerInit = true;
                fc.Time.game.setTimer(gameSettings.patience, 3, currentVehicle.hndAngryOMeter.bind(currentVehicle));

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

        if (gameSettings.collision == true) {
            hndCollision();
        }

        updateScore();

        viewport.draw();

    }

    function createGameEnvironment(): fc.Node { //Creates background/"playingfield" of the game

        let txtBackground: fc.TextureImage = new fc.TextureImage("assets/base_detail.png");
        let mtrBackground: fc.Material = new fc.Material("Background", fc.ShaderTexture, new fc.CoatTextured(clrWhite, txtBackground));

        background.appendChild(new Background(mtrBackground, new fc.Vector2(32, 32), new fc.Vector3(15, 15, 0)));

        let txtLights: fc.TextureImage = new fc.TextureImage("assets/base_lights_only.png");
        let mtrLights: fc.Material = new fc.Material("Lights", fc.ShaderTexture, new fc.CoatTextured(clrWhite, txtLights));

        background.appendChild(new Background(mtrLights, new fc.Vector2(32, 32), new fc.Vector3(15, 15, 2)));

        let txtBorder: fc.TextureImage = new fc.TextureImage("assets/border.png");
        let mtrBorder: fc.Material = new fc.Material("Border", fc.ShaderTexture, new fc.CoatTextured(clrWhite, txtBorder));

        background.appendChild(new Background(mtrBorder, new fc.Vector2(25, 25), new fc.Vector3(15, 15, 10)));

        return background;

    }

    function createLights(): fc.Node { // Initializes lights

        let lightstate: fc.Node = new fc.Node("Lightstate");

        trafficlight = new Trafficlight(mtrCurrentLightstate, new fc.Vector2(32, 32), new fc.Vector3(15, 15, 3), previousState);

        trafficlight.appendChild(lightstate);
        background.appendChild(trafficlight);
        root.appendChild(background);

        previousState = trafficlight.state.valueOf();

        return trafficlight;

    }

    function createCar(): void { // Creates a single car

        carCounter++;

        let newCar: Car = new Car("Car_" + carCounter, new fc.Vector3(35, 35, .1), colorGenerator());

        vehicles.addChild(newCar);
        root.addChild(vehicles);

    }

    function hndTraffic(_difficulty: number): void { // Loop that creates a car after a random amount of time

        let randomFactor: number = fc.Random.default.getRange(-750, 150);

        _difficulty = _difficulty + randomFactor;

        fc.Time.game.setTimer(_difficulty, 0, createCar);

    }

    function hndCollision(): void { // Handles collisions

        for (let car of vehicles.getChildren()) {

            for (let i: number = 0; i < vehicles.getChildren().length; i++) {

                let currentVehicle: Vehicle = <Vehicle>vehicles.getChild(i);
                if (currentVehicle.checkCollision(<Vehicle>car) && currentVehicle != <Vehicle>car) {

                    console.log("collision: " + currentVehicle.name + " with " + car.name);
                    cmpCrashAudio.play(true);
                    fc.Loop.stop();
                    hndLoss();

                }

            }

        }

    }

    function hndClick(): void { // Handler -> Click

        if (switchCooldown == false) {
            trafficlight.hndControl();
        }

        updateLights(trafficlight.stateUpdate);
        currentState = trafficlight.stateUpdate;

    }

    function hndLoss(): void { // Handler -> Loss
        window.localStorage.setItem("score", score.toString());
        if (score > +window.localStorage.getItem("highscore")) {
            window.localStorage.setItem("highscore", score.toString());
        }

        setTimeout(function (): void {
            window.location.href = "resultscreen.html";
        },         5000);

    }


    function updateLights(_number: number): void { // Updates lights after input

        switch (_number) {
            case 0:
                background.removeChild(trafficlight);

                txtCurrentLightstate = new fc.TextureImage("assets/all_red.png");
                mtrCurrentLightstate = new fc.Material("Lightstate_All_Red", fc.ShaderTexture, new fc.CoatTextured(clrWhite, txtCurrentLightstate));
                trafficlight = new Trafficlight(mtrCurrentLightstate, new fc.Vector2(32, 32), new fc.Vector3(15, 15, 3), 0);

                background.addChild(trafficlight);
                root.addChild(background);
                break;

            case 1:
                background.removeChild(trafficlight);

                txtCurrentLightstate = new fc.TextureImage("assets/bot_red.png");
                mtrCurrentLightstate = new fc.Material("Lightstate_Bot_Red", fc.ShaderTexture, new fc.CoatTextured(clrWhite, txtCurrentLightstate));
                trafficlight = new Trafficlight(mtrCurrentLightstate, new fc.Vector2(32, 32), new fc.Vector3(15, 15, 3), 1);

                background.addChild(trafficlight);
                root.addChild(background);

                break;

            case 2:
                background.removeChild(trafficlight);

                txtCurrentLightstate = new fc.TextureImage("assets/side_red.png");
                mtrCurrentLightstate = new fc.Material("Lightstate_Side_Red", fc.ShaderTexture, new fc.CoatTextured(clrWhite, txtCurrentLightstate));
                trafficlight = new Trafficlight(mtrCurrentLightstate, new fc.Vector2(32, 32), new fc.Vector3(15, 15, 3), 2);

                background.addChild(trafficlight);
                root.addChild(background);

                break;

            default:
                break;

        }

    }

    function updateScore(): void { // Update Score on HUD

        let divScore: HTMLDivElement = document.querySelector("div#scoreNumber");
        divScore.innerHTML = score.toString();

    }

    function colorGenerator(): number { // Chooses a random color for the car

        let colorInt: number = Math.random();

        if (gameSettings.color != 6) {
            return gameSettings.color;
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

}