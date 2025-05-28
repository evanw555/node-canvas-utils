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
        const tileImage = createWheelOfFortuneTile(tile.content, { n: N, tileStyle, textStyle });
        const expanded = createCanvas(2 * R, 2 * R);
        const c = expanded.getContext('2d');
        c.drawImage(tileImage, (expanded.width - tileImage.width) / 2, 0);
        const rotated = getRotated(expanded, 2 * Math.PI * (i / N));
        canvases.push(rotated);
    }
    return superimpose(canvases);
}

// TODO: Clean up and document
export function createWheelOfFortuneTile(content: number | string | Image, options?: { r?: number, n?: number, tileStyle?: string, textStyle?: string }): Canvas {
    const R = options?.r ?? 300;
    const N = options?.n ?? 24;

    const theta = 2 * Math.PI / N;
    const phi = (Math.PI - theta) / 2;
    const midphi = (Math.PI / 2) - (theta / 4);

    const x = R * Math.cos(phi);

    const WIDTH = x * 2;
    const HEIGHT = R;

    const canvas = createCanvas(WIDTH, HEIGHT);
    const c = canvas.getContext('2d');

    const unit = Math.min(WIDTH * 0.55, HEIGHT * 0.3);
    const lineWidth = Math.round(unit / 12);
    const ER = R - (lineWidth / 2);

    c.strokeStyle = 'black';
    c.lineWidth = lineWidth;
    c.fillStyle = options?.tileStyle ?? 'red';
    c.beginPath();
    // Bottom center
    c.moveTo(WIDTH / 2, HEIGHT);
    // Top left
    c.lineTo(0, HEIGHT - ER * Math.sin(phi));
    // Move along the crown
    c.lineTo((WIDTH / 2) - ER * Math.cos(midphi), HEIGHT - ER * Math.sin(midphi));
    c.lineTo(WIDTH / 2, R - ER);
    c.lineTo((WIDTH / 2) + ER * Math.cos(midphi), HEIGHT - ER * Math.sin(midphi));
    // Top right
    c.lineTo(WIDTH, HEIGHT - ER * Math.sin(phi));
    // Back to bottom center
    c.lineTo(WIDTH / 2, HEIGHT);
    c.fill();
    c.stroke();

    // If it's a number, draw as a cent amount
    if (typeof content === 'number') {
        // TODO: Can we always assume cents? Should we add an option for dollars?
        const cent = getTextLabel('¢', { height: unit * 0.6, align: 'center', font: `${unit * 0.6}px "Clarendon LT Std"`, style: options?.textStyle ?? 'white' });
        const text = getVerticalTextLabel(content.toString(), { height: unit, align: 'center', font: `${unit * 1.25}px "Clarendon LT Std"`, style: options?.textStyle ?? 'white' });
        const joined = withDropShadow(joinCanvasesVertical([cent, text], { align: 'center' }), { expandCanvas: true, distance: unit / 15 });
        c.drawImage(joined, (WIDTH - joined.width) / 2, 0);
    }
    // If it's a string, write as a label
    if (typeof content === 'string') {
        const text = getVerticalTextLabel(content.toString(), { height: unit * 0.9, align: 'center', font: `${unit}px "Clarendon LT Std"`, style: options?.textStyle ?? 'white' });
        const label = withDropShadow(text, { expandCanvas: true, distance: unit / 15 });
        c.drawImage(label, (WIDTH - label.width) / 2, unit / 10, label.width, Math.min(label.height, canvas.height * 0.6));
    }
    // Else, assume it's a custom icon
    else if (content instanceof Image) {
        const ew = Math.min(WIDTH, HEIGHT / 2);
        const iconWidth = ew * 0.75;
        c.drawImage(content, (WIDTH - iconWidth) / 2, ew / 8, iconWidth, iconWidth);
    }


    return canvas;
}