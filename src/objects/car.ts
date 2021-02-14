namespace KreuzungsChaos {

    import fc = FudgeCore;

    let txtCar: fc.TextureImage;

    export class Car extends Vehicle {

        public constructor(_name: string, _position: fc.Vector3, _color: number) {

            super(_name, new fc.Vector2(2, 3), _position);

            this.chooseColor(_color);

            let mtrCar: fc.Material = new fc.Material("Car", fc.ShaderTexture, new fc.CoatTextured(clrWhite, txtCar));
            let cmpMaterial: fc.ComponentMaterial = new fc.ComponentMaterial(mtrCar);
            this.addComponent(cmpMaterial);

        }

        private chooseColor(_color: number): void {

            switch (_color) {

                case 0:
                    txtCar = new fc.TextureImage("assets/car_0.png");
                    break;
                case 1:
                    txtCar = new fc.TextureImage("assets/car_1.png");
                    break;
                case 2:
                    txtCar = new fc.TextureImage("assets/car_2.png");
                    break;
                case 3:
                    txtCar = new fc.TextureImage("assets/car_3.png");
                    break;
                case 4:
                    txtCar = new fc.TextureImage("assets/car_4.png");
                    break;

                default:
                    break;

            }

        }

    }

}