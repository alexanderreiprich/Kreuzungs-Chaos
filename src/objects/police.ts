namespace KreuzungsChaos {

    import fc = FudgeCore;

    let txtPolice: fc.TextureImage = new fc.TextureImage("../textures/police.png");
    let startStreet: Street;

    export class Police extends Vehicle { 

        public constructor(_name: string, _position: fc.Vector3) {

            super(_name, new fc.Vector2(2, 3), _position);

            let mtrPolice: fc.Material = new fc.Material("Police", fc.ShaderTexture, new fc.CoatTextured(clrWhite, txtPolice));
            let cmpMaterial: fc.ComponentMaterial = new fc.ComponentMaterial(mtrPolice);
            this.addComponent(cmpMaterial);

        }

        private decideStartStreet(): Street {

            let rngStartlocation: number = Math.floor(Math.random() * this.streetList.length);

        }

    }

}