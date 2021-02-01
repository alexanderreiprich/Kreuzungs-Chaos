"use strict";
var KreuzungsChaos;
(function (KreuzungsChaos) {
    var fc = FudgeCore;
    let txtPolice = new fc.TextureImage("../textures/police.png");
    let startStreet;
    class Police extends KreuzungsChaos.Vehicle {
        constructor(_name, _position) {
            super(_name, new fc.Vector2(2, 3), _position);
            let mtrPolice = new fc.Material("Police", fc.ShaderTexture, new fc.CoatTextured(KreuzungsChaos.clrWhite, txtPolice));
            let cmpMaterial = new fc.ComponentMaterial(mtrPolice);
            this.addComponent(cmpMaterial);
        }
        decideStartStreet() {
            let rngStartlocation = Math.floor(Math.random() * this.streetList.length);
        }
    }
    KreuzungsChaos.Police = Police;
})(KreuzungsChaos || (KreuzungsChaos = {}));
//# sourceMappingURL=police.js.map