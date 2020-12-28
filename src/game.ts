namespace KreuzungsChaos {

    import fc = FudgeCore;
    //import fcaid = FudgeAid;

    window.addEventListener("load", hndLoad);

    const clrWhite: fc.Color = fc.Color.CSS("white");
    let trafficlight: Trafficlight;
    let previousState: number;

    export let viewport: fc.Viewport;
    export let root: fc.Node = new fc.Node("Root");
    let background: fc.Node = new fc.Node("Background");
    export let txtCurrentLightstate: fc.TextureImage;
    let mtrCurrentLightstate: fc.Material;

    function hndLoad(_event: Event): void {

        //Variables and Constants
        const canvas: HTMLCanvasElement = document.querySelector("canvas");
        txtCurrentLightstate = new fc.TextureImage("../textures/trafficlight_states/all_red.png");
        mtrCurrentLightstate = new fc.Material("Lightstate", fc.ShaderTexture, new fc.CoatTextured(clrWhite, txtCurrentLightstate));

        //Camera
        let cmpCamera: fc.ComponentCamera = new fc.ComponentCamera();
        cmpCamera.pivot.translateZ(40);
        cmpCamera.pivot.rotateY(180);
        cmpCamera.backgroundColor = fc.Color.CSS("black");

        //Viewport
        viewport = new fc.Viewport;
        viewport.initialize("Viewport", root, cmpCamera, canvas);

        //Functions to load up game
        createGameEnvironment();
        createLights();

        //Initialize Loop
        fc.Loop.addEventListener(fc.EVENT.LOOP_FRAME, hndLoop);
        fc.Loop.start(fc.LOOP_MODE.TIME_GAME, 60);

    }

    function hndLoop(_event: Event): void {

        trafficlight.hndControl();
        if (trafficlight.stateUpdate != previousState) {
            updateLights(trafficlight.stateUpdate);
        }
        viewport.draw();

    }

    function createGameEnvironment(): fc.Node { //Creates background/"playingfield" of the game

        
        let txtBackground: fc.TextureImage = new fc.TextureImage("../textures/base_lights.png");
        let mtrBackground: fc.Material = new fc.Material("Background", fc.ShaderTexture, new fc.CoatTextured(clrWhite, txtBackground));

        background.appendChild(new Background(mtrBackground, new fc.Vector2(32, 32), new fc.Vector3(0, 0, 0)));
        console.log(root);
        
        return background;

    }

    function createLights(): fc.Node {
        
        let lightstate: fc.Node = new fc.Node("Lightstate");

        trafficlight = new Trafficlight(mtrCurrentLightstate, new fc.Vector2(32, 32), new fc.Vector3(0, 0, 1), 0);

        console.log(trafficlight.state);

        trafficlight.appendChild(lightstate);
        background.appendChild(trafficlight);
        root.appendChild(background);

        previousState = trafficlight.state.valueOf();

        return trafficlight;

    }

    function updateLights(_number: number): void {

        switch (_number) {
            case 0:
                txtCurrentLightstate = new fc.TextureImage("../textures/trafficlight_states/all_red.png");
                mtrCurrentLightstate = new fc.Material("Lightstate_All_Red", fc.ShaderTexture, new fc.CoatTextured(clrWhite, txtCurrentLightstate));
                trafficlight = new Trafficlight(mtrCurrentLightstate, new fc.Vector2(32, 32), new fc.Vector3(0, 0, 1), 0);
                console.log(trafficlight);
                break;

            case 1:
                txtCurrentLightstate = new fc.TextureImage("../textures/trafficlight_states/bot_red.png");
                mtrCurrentLightstate = new fc.Material("Lightstate_Bot_Red", fc.ShaderTexture, new fc.CoatTextured(clrWhite, txtCurrentLightstate));
                trafficlight = new Trafficlight(mtrCurrentLightstate, new fc.Vector2(32, 32), new fc.Vector3(0, 0, 1), 1);
                console.log(trafficlight);
                break;

            case 2:
                txtCurrentLightstate = new fc.TextureImage("../textures/trafficlight_states/side_red.png");
                mtrCurrentLightstate = new fc.Material("Lightstate_Side_Red", fc.ShaderTexture, new fc.CoatTextured(clrWhite, txtCurrentLightstate));
                trafficlight = new Trafficlight(mtrCurrentLightstate, new fc.Vector2(32, 32), new fc.Vector3(0, 0, 1), 2);
                console.log(trafficlight);
                break;

            default:
                break;  
        }
    }


}