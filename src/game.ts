namespace KreuzungsChaos {

    import fc = FudgeCore;
    //import fcaid = FudgeAid;

    export enum VEHICLE_TYPE {

        CAR, TRUCK, BUS, POLICE, PARAMEDIC

    }

    window.addEventListener("load", hndLoad);

    export let currentState: number;
    export let previousState: number;
    export let viewport: fc.Viewport;
    export let txtCurrentLightstate: fc.TextureImage;
    export let root: fc.Node = new fc.Node("Root");
    export let vehicles: fc.Node = new fc.Node("Vehicles");
    export const clrWhite: fc.Color = fc.Color.CSS("white");

    //CHANGEABLE
    export let difficulty: number;

    //NOT CHANGEABLE
    export let switchCooldown: boolean = false;
    let carCounter: number;

    let background: fc.Node = new fc.Node("Background");
    let mtrCurrentLightstate: fc.Material;
    let trafficlight: Trafficlight;


    function hndLoad(_event: Event): void {

        //Variables and Constants
        const canvas: HTMLCanvasElement = document.querySelector("canvas");
        txtCurrentLightstate = new fc.TextureImage("../textures/trafficlight_states/bot_red.png");
        mtrCurrentLightstate = new fc.Material("Lightstate", fc.ShaderTexture, new fc.CoatTextured(clrWhite, txtCurrentLightstate));
        previousState = 1;
        currentState = 1;
        difficulty = 750;
        carCounter = 0;

        //Camera
        let cmpCamera: fc.ComponentCamera = new fc.ComponentCamera();
        cmpCamera.pivot.translate(new fc.Vector3(15, 15, 40));
        cmpCamera.pivot.rotateY(180);
        cmpCamera.backgroundColor = fc.Color.CSS("black");

        //Viewport
        viewport = new fc.Viewport;
        viewport.initialize("Viewport", root, cmpCamera, canvas);

        //Functions to load up game
        createGameEnvironment();
        createLights();
        createCar();
        hndTraffic(difficulty);
        
        //Timers

        //Initialize Loop
        fc.Loop.addEventListener(fc.EVENT.LOOP_FRAME, hndLoop);
        fc.Loop.start(fc.LOOP_MODE.TIME_GAME, 60);

        console.log(vehicles.getChildren().length);

    }

    function hndLoop(_event: Event): void {

        if (switchCooldown == false) {
            trafficlight.hndControl();
        }
        

        if (trafficlight.stateUpdate != currentState) {
            updateLights(trafficlight.stateUpdate);
            currentState = trafficlight.stateUpdate;
        }
        
        for (let i: number = 0; i < vehicles.getChildren().length; i++) {
            let currentVehicle: Vehicle = <Vehicle> vehicles.getChild(i);
            currentVehicle.followPath(currentVehicle.endLocation);
            currentVehicle.checkOutOfBounds();
            //console.log(currentVehicle.mtxLocal.translation);
            
        }

        viewport.draw();

    }

    function createGameEnvironment(): fc.Node { //Creates background/"playingfield" of the game

        let txtBackground: fc.TextureImage = new fc.TextureImage("../textures/base_clean.png");
        let mtrBackground: fc.Material = new fc.Material("Background", fc.ShaderTexture, new fc.CoatTextured(clrWhite, txtBackground));

        background.appendChild(new Background(mtrBackground, new fc.Vector2(32, 32), new fc.Vector3(15, 15, 0)));

        let txtLights: fc.TextureImage = new fc.TextureImage("../textures/base_lights_only.png");
        let mtrLights: fc.Material = new fc.Material("Lights", fc.ShaderTexture, new fc.CoatTextured(clrWhite, txtLights));
        
        background.appendChild(new Background(mtrLights, new fc.Vector2(32, 32), new fc.Vector3(15, 15, 2)));

        let txtBorder: fc.TextureImage = new fc.TextureImage("../textures/border.png");
        let mtrBorder: fc.Material = new fc.Material("Border", fc.ShaderTexture, new fc.CoatTextured(clrWhite, txtBorder));

        background.appendChild(new Background(mtrBorder, new fc.Vector2(25, 25), new fc.Vector3(15, 15, 10)));

        /* let txtCross: fc.TextureImage = new fc.TextureImage("../textures/cross.png");
        let mtrCross: fc.Material = new fc.Material("Cross", fc.ShaderTexture, new fc.CoatTextured(clrWhite, txtCross));

        background.appendChild(new Background(mtrCross, new fc.Vector2(1, 1), new fc.Vector3(0, 13.75, .1))); */

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

    function createCar(): void {

        carCounter++;

        let startlocation: LOCATION;

        let decideRandomLocation: number = Math.random() * 10;

        if (decideRandomLocation <= 2.5) {
            startlocation = LOCATION.BOT;
        }
        else if (decideRandomLocation > 2.5 && decideRandomLocation < 5) {
            startlocation = LOCATION.RIGHT;
        }
        else if (decideRandomLocation > 5 && decideRandomLocation < 7.5) {
            startlocation = LOCATION.TOP;
        }
        else {
            startlocation = LOCATION.LEFT;
        }

        let newCar: Car = new Car("Car_" + carCounter, new fc.Vector3(50, 50, .1), startlocation, colorGenerator());
        newCar.mtxLocal.translation = newCar.translateLocation(startlocation);
        
        vehicles.addChild(newCar);
        root.addChild(vehicles);
        
    }

    function hndTraffic(_difficulty: number): void {

        let randomFactor: number = (Math.random() - 0.5) * 100;

        _difficulty = _difficulty + randomFactor;

        fc.Time.game.setTimer(_difficulty, 0, createCar);

    }

    function updateLights(_number: number): void { // Updates lights after input

        switch (_number) {
            case 0:
                background.removeChild(trafficlight);

                txtCurrentLightstate = new fc.TextureImage("../textures/trafficlight_states/all_red.png");
                mtrCurrentLightstate = new fc.Material("Lightstate_All_Red", fc.ShaderTexture, new fc.CoatTextured(clrWhite, txtCurrentLightstate));
                trafficlight = new Trafficlight(mtrCurrentLightstate, new fc.Vector2(32, 32), new fc.Vector3(15, 15, 3), 0);
                
                background.addChild(trafficlight);
                root.addChild(background);
                break;

            case 1:
                background.removeChild(trafficlight);

                txtCurrentLightstate = new fc.TextureImage("../textures/trafficlight_states/bot_red.png");
                mtrCurrentLightstate = new fc.Material("Lightstate_Bot_Red", fc.ShaderTexture, new fc.CoatTextured(clrWhite, txtCurrentLightstate));
                trafficlight = new Trafficlight(mtrCurrentLightstate, new fc.Vector2(32, 32), new fc.Vector3(15, 15, 3), 1);

                background.addChild(trafficlight);
                root.addChild(background);
                
                break;

            case 2:
                background.removeChild(trafficlight);

                txtCurrentLightstate = new fc.TextureImage("../textures/trafficlight_states/side_red.png");
                mtrCurrentLightstate = new fc.Material("Lightstate_Side_Red", fc.ShaderTexture, new fc.CoatTextured(clrWhite, txtCurrentLightstate));
                trafficlight = new Trafficlight(mtrCurrentLightstate, new fc.Vector2(32, 32), new fc.Vector3(15, 15, 3), 2);

                background.addChild(trafficlight);
                root.addChild(background);

                break;

            default:
                break;
                
        }

    }

    function colorGenerator(): number {

        let colorInt: number = Math.random();

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