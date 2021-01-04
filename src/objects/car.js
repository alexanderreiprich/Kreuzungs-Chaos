"use strict";
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
                    txtCar = new fc.TextureImage("../textures/car_0.png");
                    break;
                case 1:
                    txtCar = new fc.TextureImage("../textures/car_1.png");
                    break;
                case 2:
                    txtCar = new fc.TextureImage("../textures/car_2.png");
                    break;
                case 3:
                    txtCar = new fc.TextureImage("../textures/car_3.png");
                    break;
                case 4:
                    txtCar = new fc.TextureImage("../textures/car_4.png");
                    break;
                default:
                    break;
            }
        }
    }
    KreuzungsChaos.Car = Car;
})(KreuzungsChaos || (KreuzungsChaos = {}));
//# sourceMappingURL=car.js.map