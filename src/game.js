"use strict";
var KreuzungsChaos;
(function (KreuzungsChaos) {
    var fc = FudgeCore;
    //import fcaid = FudgeAid;
    window.addEventListener("load", hndLoad);
    const clrWhite = fc.Color.CSS("white");
    let trafficlight;
    let previousState;
    KreuzungsChaos.root = new fc.Node("Root");
    let background = new fc.Node("Background");
    let mtrCurrentLightstate;
    function hndLoad(_event) {
        //Variables and Constants
        const canvas = document.querySelector("canvas");
        KreuzungsChaos.txtCurrentLightstate = new fc.TextureImage("../textures/trafficlight_states/all_red.png");
        mtrCurrentLightstate = new fc.Material("Lightstate", fc.ShaderTexture, new fc.CoatTextured(clrWhite, KreuzungsChaos.txtCurrentLightstate));
        //Camera
        let cmpCamera = new fc.ComponentCamera();
        cmpCamera.pivot.translateZ(40);
        cmpCamera.pivot.rotateY(180);
        cmpCamera.backgroundColor = fc.Color.CSS("black");
        //Viewport
        KreuzungsChaos.viewport = new fc.Viewport;
        KreuzungsChaos.viewport.initialize("Viewport", KreuzungsChaos.root, cmpCamera, canvas);
        //Functions to load up game
        createGameEnvironment();
        createLights();
        //Initialize Loop
        fc.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, hndLoop);
        fc.Loop.start(fc.LOOP_MODE.TIME_GAME, 60);
    }
    function hndLoop(_event) {
        trafficlight.hndControl();
        if (trafficlight.stateUpdate != previousState) {
            updateLights(trafficlight.stateUpdate);
        }
        KreuzungsChaos.viewport.draw();
    }
    function createGameEnvironment() {
        let txtBackground = new fc.TextureImage("../textures/base_lights.png");
        let mtrBackground = new fc.Material("Background", fc.ShaderTexture, new fc.CoatTextured(clrWhite, txtBackground));
        background.appendChild(new KreuzungsChaos.Background(mtrBackground, new fc.Vector2(32, 32), new fc.Vector3(0, 0, 0)));
        console.log(KreuzungsChaos.root);
        return background;
    }
    function createLights() {
        let lightstate = new fc.Node("Lightstate");
        trafficlight = new KreuzungsChaos.Trafficlight(mtrCurrentLightstate, new fc.Vector2(32, 32), new fc.Vector3(0, 0, 1), 0);
        console.log(trafficlight.state);
        trafficlight.appendChild(lightstate);
        background.appendChild(trafficlight);
        KreuzungsChaos.root.appendChild(background);
        previousState = trafficlight.state.valueOf();
        return trafficlight;
    }
    function updateLights(_number) {
        switch (_number) {
            case 0:
                KreuzungsChaos.txtCurrentLightstate = new fc.TextureImage("../textures/trafficlight_states/all_red.png");
                mtrCurrentLightstate = new fc.Material("Lightstate_All_Red", fc.ShaderTexture, new fc.CoatTextured(clrWhite, KreuzungsChaos.txtCurrentLightstate));
                trafficlight = new KreuzungsChaos.Trafficlight(mtrCurrentLightstate, new fc.Vector2(32, 32), new fc.Vector3(0, 0, 1), 0);
                console.log(trafficlight);
                break;
            case 1:
                KreuzungsChaos.txtCurrentLightstate = new fc.TextureImage("../textures/trafficlight_states/bot_red.png");
                mtrCurrentLightstate = new fc.Material("Lightstate_Bot_Red", fc.ShaderTexture, new fc.CoatTextured(clrWhite, KreuzungsChaos.txtCurrentLightstate));
                trafficlight = new KreuzungsChaos.Trafficlight(mtrCurrentLightstate, new fc.Vector2(32, 32), new fc.Vector3(0, 0, 1), 1);
                console.log(trafficlight);
                break;
            case 2:
                KreuzungsChaos.txtCurrentLightstate = new fc.TextureImage("../textures/trafficlight_states/side_red.png");
                mtrCurrentLightstate = new fc.Material("Lightstate_Side_Red", fc.ShaderTexture, new fc.CoatTextured(clrWhite, KreuzungsChaos.txtCurrentLightstate));
                trafficlight = new KreuzungsChaos.Trafficlight(mtrCurrentLightstate, new fc.Vector2(32, 32), new fc.Vector3(0, 0, 1), 2);
                console.log(trafficlight);
                break;
            default:
                break;
        }
    }
})(KreuzungsChaos || (KreuzungsChaos = {}));
//# sourceMappingURL=game.js.map