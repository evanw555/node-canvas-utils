import { Canvas, createCanvas, Image, registerFont } from "canvas";
import { getTextLabel, getVerticalTextLabel } from "./text";
import { getRotated, joinCanvasesVertical, superimpose, withDropShadow } from "./util";

// TODO: Clean up and document
export function createWheelOfFortune(tiles: { content: number | string | Image, fillStyle?: string, textStyle?: string }[]): Canvas {
    const N = tiles.length;
    const R = 300;
    const canvases: Canvas[] = [];
    for (let i = 0; i < N; i++) {
        const tile = tiles[i];
        const tileStyle = tile.fillStyle ?? 'red';
        const textStyle = tile.textStyle ?? 'white';
        const tileImage = createWheelOfFortuneTile(tile.content, { tileStyle, textStyle });
        const expanded = createCanvas(2 * R, 2 * R);
        const c = expanded.getContext('2d');
        c.drawImage(tileImage, (expanded.width - tileImage.width) / 2, 0);
        const rotated = getRotated(expanded, 2 * Math.PI * (i / N));
        canvases.push(rotated);
    }
    return superimpose(canvases);
}

// TODO: Clean up and document
export function createWheelOfFortuneTile(content: number | string | Image, options?: { tileStyle?: string, textStyle?: string }): Canvas {
    const R = 300;
    const N = 24;

    const theta = 2 * Math.PI / N;
    const phi = (Math.PI - theta) / 2;
    const midphi = (Math.PI / 2) - (theta / 4);

    const x = R * Math.cos(phi);
    const y = R * Math.sin(phi);

    const WIDTH = x * 2;
    const HEIGHT = R;

    const canvas = createCanvas(WIDTH, HEIGHT);
    const c = canvas.getContext('2d');

    c.strokeStyle = 'black';
    c.lineWidth = 2;
    c.fillStyle = options?.tileStyle ?? 'red';
    c.beginPath();
    // Bottom center
    c.moveTo(WIDTH / 2, HEIGHT);
    // Top left
    c.lineTo(0, HEIGHT - y);
    // Move along the crown
    c.lineTo((WIDTH / 2) - R * Math.cos(midphi), HEIGHT - R * Math.sin(midphi));
    c.lineTo(WIDTH / 2, 0);
    c.lineTo((WIDTH / 2) + R * Math.cos(midphi), HEIGHT - R * Math.sin(midphi));
    // Top right
    c.lineTo(WIDTH, HEIGHT - y);
    // Back to bottom center
    c.lineTo(WIDTH / 2, HEIGHT);
    c.fill();
    c.stroke();

    // If it's a number, draw as a cent amount
    if (typeof content === 'number') {
        // TODO: Can we always assume cents? Should we add an option for dollars?
        const cent = getTextLabel('¢', { height: WIDTH / 2, align: 'center', font: `${WIDTH / 2}px "Clarendon LT Std"`, style: options?.textStyle ?? 'white' });
        const text = getVerticalTextLabel(content.toString(), { height: WIDTH * 0.6, align: 'center', font: `${WIDTH * 0.75}px "Clarendon LT Std"`, style: options?.textStyle ?? 'white' });
        const joined = withDropShadow(joinCanvasesVertical([cent, text], { align: 'center' }), { expandCanvas: true, distance: WIDTH / 20 });
        c.drawImage(joined, (WIDTH - joined.width) / 2, 0);
    }
    // If it's a string, write as a label
    if (typeof content === 'string') {
        const text = getVerticalTextLabel(content.toString(), { height: WIDTH * 0.45, align: 'center', font: `${WIDTH * 0.5}px "Clarendon LT Std"`, style: options?.textStyle ?? 'white' });
        const label = withDropShadow(text, { expandCanvas: true, distance: WIDTH / 20 });
        c.drawImage(label, (WIDTH - label.width) / 2, WIDTH / 20, label.width, Math.min(label.height, canvas.height * 0.6));
    }
    // Else, assume it's a custom icon
    else if (content instanceof Image) {
        c.drawImage(content, WIDTH / 8, WIDTH / 16, WIDTH * 0.75, WIDTH * 0.75);
    }


    return canvas;
}