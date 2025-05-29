import { Canvas, Image } from "canvas";
interface WheelOfFortuneTileRenderData {
    content: number | string | Image | WheelOfFortuneTileRenderData[];
    fillStyle?: string;
    textStyle?: string;
}
export declare function createWheelOfFortune(tiles: WheelOfFortuneTileRenderData[]): Canvas;
export declare function createWheelOfFortuneTile(content: number | string | Image | WheelOfFortuneTileRenderData[], options?: {
    r?: number;
    n?: number;
    tileStyle?: string;
    textStyle?: string;
}): Canvas;
export {};
//# sourceMappingURL=games.d.ts.map