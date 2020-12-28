"use strict";
var KreuzungsChaos;
(function (KreuzungsChaos) {
    var fc = FudgeCore;
    class Background extends KreuzungsChaos.GameObject {
        constructor(_material, _size, _position) {
            super("Background", _size, _position);
            let cmpMaterial = new fc.ComponentMaterial(_material);
            //cmpMaterial.pivot.scale(fc.Vector2.ONE(1));
            this.addComponent(cmpMaterial);
        }
    }
    KreuzungsChaos.Background = Background;
})(KreuzungsChaos || (KreuzungsChaos = {}));
//# sourceMappingURL=background.js.map