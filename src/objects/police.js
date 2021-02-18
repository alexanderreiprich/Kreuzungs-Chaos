"use strict";
var KreuzungsChaos;
(function (KreuzungsChaos) {
    var fc = FudgeCore;
    let txtPolice = new fc.TextureImage("../textures/police.png");
    let startStreet;
    let endStreet;
    class Police extends KreuzungsChaos.Vehicle {
        constructor(_name, _position) {
            super(_name, new fc.Vector2(2, 3), _position);
            let mtrPolice = new fc.Material("Police", fc.ShaderTexture, new fc.CoatTextured(KreuzungsChaos.clrWhite, txtPolice));
            let cmpMaterial = new fc.ComponentMaterial(mtrPolice);
            this.addComponent(cmpMaterial);
            this.decideStreets();
            this.mtxWorld.translation = startStreet.startInt;
            this.routeTargets = [startStreet.startInt, endStreet.endAway];
            this.followPathIgnoreStops();
        }
        decideStreets() {
            let start = fc.Random.default.getRange(0, 3);
            switch (start) {
                case 0:
                    startStreet = this.street1;
                    endStreet = this.street3;
                    break;
                case 1:
                    startStreet = this.street2;
                    endStreet = this.street4;
                    break;
                case 2:
                    startStreet = this.street3;
                    endStreet = this.street1;
                    break;
                case 3:
                    startStreet = this.street4;
                    endStreet = this.street2;
                    break;
                default:
                    break;
            }
        }
    }
    KreuzungsChaos.Police = Police;
})(KreuzungsChaos || (KreuzungsChaos = {}));
//# sourceMappingURL=police.js.map