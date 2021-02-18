namespace KreuzungsChaos {

    import fc = FudgeCore;

    export interface GameSettings {

        difficulty: number;
        score: number;
        speedlimit: number;
        acceleration: number;
        patience: number;

        street1: Street;
        street2: Street;
        street3: Street;
        street4: Street;
        lightswitchCooldown: number;

        collision: boolean;
        drawHitboxes: boolean;
        color: number;

    }

    export interface StreetInterface {

        id: string;
        startInt: fc.Vector3;
        endInt: fc.Vector3;
        startAway: fc.Vector3;
        endAway: fc.Vector3;
        stop: fc.Vector3;

    }

    export let gameSettings: GameSettings;
    export let streetInterface: StreetInterface;

    export async function communicate(_url: string): Promise<void> {
        
        let response: Response = await fetch(_url);
        let settingsJSON: GameSettings = await response.json();
        gameSettings = settingsJSON;

    }

}