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
        const tileImage = createWheelOfFortuneTile(tile.content, { tileStyle, textStyle });
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
    var _a, _b, _c, _d;
    const R = 300;
    const N = 24;
    const theta = 2 * Math.PI / N;
    const phi = (Math.PI - theta) / 2;
    const midphi = (Math.PI / 2) - (theta / 4);
    const x = R * Math.cos(phi);
    const y = R * Math.sin(phi);
    const WIDTH = x * 2;
    const HEIGHT = R;
    const canvas = (0, canvas_1.createCanvas)(WIDTH, HEIGHT);
    const c = canvas.getContext('2d');
    c.strokeStyle = 'black';
    c.lineWidth = 2;
    c.fillStyle = (_a = options === null || options === void 0 ? void 0 : options.tileStyle) !== null && _a !== void 0 ? _a : 'red';
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
        const cent = (0, text_1.getTextLabel)('¢', { height: WIDTH / 2, align: 'center', font: `${WIDTH / 2}px "Clarendon LT Std"`, style: (_b = options === null || options === void 0 ? void 0 : options.textStyle) !== null && _b !== void 0 ? _b : 'white' });
        const text = (0, text_1.getVerticalTextLabel)(content.toString(), { height: WIDTH * 0.6, align: 'center', font: `${WIDTH * 0.75}px "Clarendon LT Std"`, style: (_c = options === null || options === void 0 ? void 0 : options.textStyle) !== null && _c !== void 0 ? _c : 'white' });
        const joined = (0, util_1.withDropShadow)((0, util_1.joinCanvasesVertical)([cent, text], { align: 'center' }), { expandCanvas: true, distance: WIDTH / 20 });
        c.drawImage(joined, (WIDTH - joined.width) / 2, 0);
    }
    // If it's a string, write as a label
    if (typeof content === 'string') {
        const text = (0, text_1.getVerticalTextLabel)(content.toString(), { height: WIDTH * 0.45, align: 'center', font: `${WIDTH * 0.5}px "Clarendon LT Std"`, style: (_d = options === null || options === void 0 ? void 0 : options.textStyle) !== null && _d !== void 0 ? _d : 'white' });
        const label = (0, util_1.withDropShadow)(text, { expandCanvas: true, distance: WIDTH / 20 });
        c.drawImage(label, (WIDTH - label.width) / 2, WIDTH / 20, label.width, Math.min(label.height, canvas.height * 0.6));
    }
    // Else, assume it's a custom icon
    else if (content instanceof canvas_1.Image) {
        c.drawImage(content, WIDTH / 8, WIDTH / 16, WIDTH * 0.75, WIDTH * 0.75);
    }
    return canvas;
}
exports.createWheelOfFortuneTile = createWheelOfFortuneTile;
//# sourceMappingURL=games.js.map