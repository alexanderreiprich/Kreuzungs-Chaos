namespace KreuzungsChaos {

    import fc = FudgeCore;

    let txtPolice: fc.TextureImage = new fc.TextureImage("../textures/police.png");
    let startStreet: Street;
    let endStreet: Street;

    export class Police extends Vehicle { 

        public constructor(_name: string, _position: fc.Vector3) {

            super(_name, new fc.Vector2(2, 3), _position);

            let mtrPolice: fc.Material = new fc.Material("Police", fc.ShaderTexture, new fc.CoatTextured(clrWhite, txtPolice));
            let cmpMaterial: fc.ComponentMaterial = new fc.ComponentMaterial(mtrPolice);
            this.addComponent(cmpMaterial);

            this.decideStreets();
            this.mtxWorld.translation = startStreet.startInt;
            this.routeTargets = [startStreet.startInt, endStreet.endAway];
            this.followPathIgnoreStops();

        }

        public decideStreets(): void {

            let start: number = fc.Random.default.getRange(0, 3);
            
            
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

}