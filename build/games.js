"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWheelOfFortuneTile = exports.createWheelOfFortune = void 0;
const canvas_1 = require("canvas");
const text_1 = require("./text");
const util_1 = require("./util");
// TODO: Clean up and document
function createWheelOfFortune(tiles) {
    var _a, _b;
    const N = tiles.length;
    const R = 300;
    const canvases = [];
    for (let i = 0; i < N; i++) {
        const tile = tiles[i];
        const tileStyle = (_a = tile.fillStyle) !== null && _a !== void 0 ? _a : 'red';
        const textStyle = (_b = tile.textStyle) !== null && _b !== void 0 ? _b : 'white';
        const tileImage = createWheelOfFortuneTile(tile.content, { n: N, tileStyle, textStyle });
        const expanded = (0, canvas_1.createCanvas)(2 * R, 2 * R);
        const c = expanded.getContext('2d');
        c.drawImage(tileImage, (expanded.width - tileImage.width) / 2, 0);
        const rotated = (0, util_1.getRotated)(expanded, 2 * Math.PI * (i / N));
        canvases.push(rotated);
    }
    return (0, util_1.superimpose)(canvases);
}
exports.createWheelOfFortune = createWheelOfFortune;
// TODO: Clean up and document
function createWheelOfFortuneTile(content, options) {
    var _a, _b, _c, _d, _e, _f;
    const R = (_a = options === null || options === void 0 ? void 0 : options.r) !== null && _a !== void 0 ? _a : 300;
    const N = (_b = options === null || options === void 0 ? void 0 : options.n) !== null && _b !== void 0 ? _b : 24;
    const theta = 2 * Math.PI / N;
    const phi = (Math.PI - theta) / 2;
    const midphi = (Math.PI / 2) - (theta / 4);
    const x = R * Math.cos(phi);
    const WIDTH = x * 2;
    const HEIGHT = R;
    // First thing's first, if it's a call to make a tile recursively from subtiles
    if (content.constructor === Array) {
        const subtileImages = [];
        const M = content.length;
        for (let i = 0; i < M; i++) {
            const subtile = content[i];
            const subtileImage = createWheelOfFortuneTile(subtile.content, { r: R, n: N * M, tileStyle: subtile.fillStyle, textStyle: subtile.textStyle });
            // Rotate the subtile to the appropriate relative angle
            const expanded = (0, canvas_1.createCanvas)(2 * R, 2 * R);
            const c = expanded.getContext('2d');
            c.drawImage(subtileImage, (expanded.width - subtileImage.width) / 2, 0);
            const rot = theta * (M - 1 - 2 * i) / (2 * M);
            const rotated = (0, util_1.getRotated)(expanded, rot);
            subtileImages.push(rotated);
        }
        // Superimpose all the subtiles together, then crop to just the tile
        const combined = (0, util_1.superimpose)(subtileImages);
        return (0, util_1.crop)(combined, { width: WIDTH, height: HEIGHT, vertical: 'top', horizontal: 'center' });
    }
    const canvas = (0, canvas_1.createCanvas)(WIDTH, HEIGHT);
    const c = canvas.getContext('2d');
    const unit = Math.min(WIDTH * 0.55, HEIGHT * 0.3);
    const lineWidth = Math.round(unit / 12);
    const ER = R - (lineWidth / 2);
    c.strokeStyle = 'black';
    c.lineWidth = lineWidth;
    c.fillStyle = (_c = options === null || options === void 0 ? void 0 : options.tileStyle) !== null && _c !== void 0 ? _c : 'red';
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
        const cent = (0, text_1.getTextLabel)('¢', { height: unit * 0.6, align: 'center', font: `${unit * 0.6}px "Clarendon LT Std"`, style: (_d = options === null || options === void 0 ? void 0 : options.textStyle) !== null && _d !== void 0 ? _d : 'white' });
        const text = (0, text_1.getVerticalTextLabel)(content.toString(), { height: unit, align: 'center', font: `${unit * 1.25}px "Clarendon LT Std"`, style: (_e = options === null || options === void 0 ? void 0 : options.textStyle) !== null && _e !== void 0 ? _e : 'white' });
        const joined = (0, util_1.withDropShadow)((0, util_1.joinCanvasesVertical)([cent, text], { align: 'center' }), { expandCanvas: true, distance: unit / 15 });
        c.drawImage(joined, (WIDTH - joined.width) / 2, 0);
    }
    // If it's a string, write as a label
    if (typeof content === 'string') {
        const text = (0, text_1.getVerticalTextLabel)(content.toString(), { height: unit * 0.9, align: 'center', font: `${unit}px "Clarendon LT Std"`, style: (_f = options === null || options === void 0 ? void 0 : options.textStyle) !== null && _f !== void 0 ? _f : 'white' });
        const label = (0, util_1.withDropShadow)(text, { expandCanvas: true, distance: unit / 15 });
        c.drawImage(label, (WIDTH - label.width) / 2, unit / 10, label.width, Math.min(label.height, canvas.height * 0.6));
    }
    // Else, assume it's a custom icon
    else if (content instanceof canvas_1.Image) {
        const ew = Math.min(WIDTH, HEIGHT / 2);
        const iconWidth = ew * 0.75;
        const icon = (0, util_1.withDropShadow)((0, util_1.resize)(content, { width: ew }), { expandCanvas: true, distance: unit / 15 });
        c.drawImage(icon, (WIDTH - iconWidth) / 2, ew / 8, iconWidth, iconWidth);
    }
    return canvas;
}
exports.createWheelOfFortuneTile = createWheelOfFortuneTile;
//# sourceMappingURL=games.js.map