import { Canvas, createCanvas, Image, registerFont } from "canvas";
import { getTextLabel, getVerticalTextLabel } from "./text";
import { crop, getRotated, joinCanvasesVertical, resize, superimpose, withDropShadow } from "./util";

interface WheelOfFortuneTileRenderData {
    content: number | string | Image | WheelOfFortuneTileRenderData[],
    fillStyle?: string,
    textStyle?: string,
    /** If true, text will be render horizontally rather than vertically. */
    horizontal?: true
}

// TODO: Clean up and document
export function createWheelOfFortune(tiles: WheelOfFortuneTileRenderData[]): Canvas {
    const N = tiles.length;
    const R = 300;
    const canvases: Canvas[] = [];
    for (let i = 0; i < N; i++) {
        const tile = tiles[i];
        const tileStyle = tile.fillStyle ?? 'red';
        const textStyle = tile.textStyle ?? 'white';
        const tileImage = createWheelOfFortuneTile(tile.content, { n: N, tileStyle, textStyle, horizontal: tile.horizontal });
        const expanded = createCanvas(2 * R, 2 * R);
        const c = expanded.getContext('2d');
        c.drawImage(tileImage, (expanded.width - tileImage.width) / 2, 0);
        const rotated = getRotated(expanded, 2 * Math.PI * (i / N));
        canvases.push(rotated);
    }
    return superimpose(canvases);
}

// TODO: Clean up and document
export function createWheelOfFortuneTile(content: number | string | Image | WheelOfFortuneTileRenderData[], options?: { r?: number, n?: number, tileStyle?: string, textStyle?: string, horizontal?: true }): Canvas {
    const R = options?.r ?? 300;
    const N = options?.n ?? 24;
    const HORIZONTAL = options?.horizontal ?? false;

    const theta = 2 * Math.PI / N;
    const phi = (Math.PI - theta) / 2;
    const midphi = (Math.PI / 2) - (theta / 4);

    const x = R * Math.cos(phi);

    const WIDTH = x * 2;
    const HEIGHT = R;
    
    // First thing's first, if it's a call to make a tile recursively from subtiles
    if (content.constructor === Array) {
        const subtileImages: Canvas[] = [];
        const M = content.length;
        for (let i = 0; i < M; i++) {
            const subtile = content[i];
            const subtileImage = createWheelOfFortuneTile(subtile.content, { r: R, n: N * M, tileStyle: subtile.fillStyle, textStyle: subtile.textStyle });
            // Rotate the subtile to the appropriate relative angle
            const expanded = createCanvas(2 * R, 2 * R);
            const c = expanded.getContext('2d');
            c.drawImage(subtileImage, (expanded.width - subtileImage.width) / 2, 0);
            const rot = theta * (M - 1 - 2 * i) / (2 * M);
            const rotated = getRotated(expanded, rot);
            subtileImages.push(rotated);
        }
        // Superimpose all the subtiles together, then crop to just the tile
        const combined = superimpose(subtileImages);
        return crop(combined, { width: WIDTH, height: HEIGHT, vertical: 'top', horizontal: 'center' });
    }

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
        const fn = HORIZONTAL ? getTextLabel : getVerticalTextLabel;
        const text = fn(content.toString(), { height: unit, align: 'center', font: `${unit * 1.25}px "Clarendon LT Std"`, style: options?.textStyle ?? 'white' });
        const joined = withDropShadow(joinCanvasesVertical([cent, text], { align: 'center' }), { expandCanvas: true, distance: unit / 15 });
        c.drawImage(joined, (WIDTH - joined.width) / 2, 0);
    }
    // If it's a string, write as a label
    if (typeof content === 'string') {
        const fn = HORIZONTAL ? getTextLabel : getVerticalTextLabel;
        const text = fn(content.toString(), { height: unit * 0.9, align: 'center', font: `${unit}px "Clarendon LT Std"`, style: options?.textStyle ?? 'white' });
        const label = withDropShadow(text, { expandCanvas: true, distance: unit / 15 });
        c.drawImage(label, (WIDTH - label.width) / 2, unit / 10, label.width, Math.min(label.height, canvas.height * 0.6));
    }
    // Else, assume it's a custom icon
    else if (content instanceof Image) {
        const ew = Math.min(WIDTH, HEIGHT / 2);
        const iconWidth = ew * 0.75;
        const icon = withDropShadow(resize(content, { width: ew }), { expandCanvas: true, distance: unit / 15 })
        c.drawImage(icon, (WIDTH - iconWidth) / 2, ew / 8, iconWidth, iconWidth);
    }


    return canvas;
}