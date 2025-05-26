"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTextGrid = exports.getTextBox = exports.getVerticalTextLabel = exports.getTextLabel = exports.getTextWidth = void 0;
const canvas_1 = require("canvas");
const util_1 = require("./util");
// Dummy canvas to be reused when measuring text width (creating a new one each time may be costly)
let dummyCanvas = undefined;
/**
 * Given some text and font, computes how wide the resulting text would be.
 * @param text Text to measure
 * @param font Font of the text to be measured
 * @returns The width in pixels
 */
function getTextWidth(text, font) {
    // If the global dummy canvas doesn't exist, initialize it now
    if (!dummyCanvas) {
        dummyCanvas = (0, canvas_1.createCanvas)(1, 1);
    }
    const context = dummyCanvas.getContext('2d');
    context.font = font;
    return context.measureText(text).width;
}
exports.getTextWidth = getTextWidth;
/**
 * Generates a canvas containing the specified text with optional parameters specifying the width, height, alignment, color, etc.
 * The width of the label will be just big enough to contain the text, but it can be overridden if a specific size is desired.
 * The size of the text will be automatically determined unless specified otherwise. The background of the label will be transparent.
 * @param text The text used to generate the label
 * @param options.width Desired width of the resulting label image (defaults to fit to the width of the text)
 * @param options.height Desired height of the resulting label image (defaults to 20px)
 * @param options.align How to align the text horizontally (defaults to center-aligned)
 * @param options.font Font to for the text (defaults to an auto-sized sans-serif)
 * @param options.style Style to use for the text (defaults to white)
 * @param options.alpha Alpha to use for the text (defaults to opaque)
 * @param options.margin Optional horizontal margin (defaults to none)
 * @returns New canvas containing the specified text
 */
function getTextLabel(text, options) {
    var _a, _b, _c, _d, _e, _f, _g;
    const HEIGHT = (_a = options === null || options === void 0 ? void 0 : options.height) !== null && _a !== void 0 ? _a : 20;
    const FONT = (_b = options === null || options === void 0 ? void 0 : options.font) !== null && _b !== void 0 ? _b : `${HEIGHT * 0.6}px sans-serif`;
    const WIDTH = (_c = options === null || options === void 0 ? void 0 : options.width) !== null && _c !== void 0 ? _c : getTextWidth(text, FONT);
    const ALIGN = (_d = options === null || options === void 0 ? void 0 : options.align) !== null && _d !== void 0 ? _d : 'center';
    if (!text) {
        throw new Error('Cannot create a text label with no text');
    }
    const canvas = (0, canvas_1.createCanvas)(WIDTH, HEIGHT);
    const context = canvas.getContext('2d');
    context.font = FONT;
    context.fillStyle = (_e = options === null || options === void 0 ? void 0 : options.style) !== null && _e !== void 0 ? _e : 'white';
    context.globalAlpha = (_f = options === null || options === void 0 ? void 0 : options.alpha) !== null && _f !== void 0 ? _f : 1;
    const ascent = context.measureText(text).actualBoundingBoxAscent;
    const verticalMargin = (HEIGHT - ascent) / 2;
    if (ALIGN === 'center') {
        const textWidth = context.measureText(text).width;
        const margin = (_g = options === null || options === void 0 ? void 0 : options.margin) !== null && _g !== void 0 ? _g : 0;
        const usableWidth = WIDTH - (2 * margin);
        if (textWidth > usableWidth) {
            // If the text is too wide for the label, compress it
            context.fillText(text, Math.floor(margin), verticalMargin + ascent, usableWidth);
        }
        else {
            // If the text is smaller than the label, center it
            context.fillText(text, Math.floor(margin + (usableWidth - textWidth) / 2), verticalMargin + ascent);
        }
    }
    else if (ALIGN === 'right') {
        context.fillText(text, Math.floor(WIDTH - context.measureText(text).width), verticalMargin + ascent, WIDTH);
    }
    else {
        context.fillText(text, 0, verticalMargin + ascent, WIDTH);
    }
    context.restore();
    return canvas;
}
exports.getTextLabel = getTextLabel;
/**
 * Generates a canvas containing the specified text displayed vertically (top-to-bottom) with optional parameters.
 * The options are the same as in {@link getTextLabel}, and have the sam effect.
 */
function getVerticalTextLabel(text, options) {
    if (!text) {
        throw new Error('Cannot create a vertical text label with no text');
    }
    const characters = text.trim().split('');
    const canvases = characters.map(c => getTextLabel(c, options));
    return (0, util_1.joinCanvasesVertical)(canvases, { align: options === null || options === void 0 ? void 0 : options.align });
}
exports.getVerticalTextLabel = getVerticalTextLabel;
/**
 * Generates a canvas containing the specified text automatically separated into multiple lines to match the desired resulting text box width.
 * Text will be justified using the horizontal alignment option, and any word too large to be printed on one single line will be stretched to fit.
 * The background of the text box will be transparent.
 * @param text The text used to generate the text box
 * @param width Desired width of the resulting text box
 * @param rowHeight Desired height of each row of text
 * @param options.align How to align the text horizontally (defaults to center-aligned)
 * @param options.font Font to for the text (defaults to an auto-sized sans-serif)
 * @param options.style Style to use for the text (defaults to white)
 * @param options.alpha Alpha to use for the text (defaults to opaque)
 * @param options.margin Optional horizontal margin (defaults to none)
 * @returns New canvas containing the specified text
 */
function getTextBox(text, width, rowHeight, options) {
    var _a;
    const dummyCanvas = (0, canvas_1.createCanvas)(1, 1);
    const context = dummyCanvas.getContext('2d');
    context.font = (_a = options === null || options === void 0 ? void 0 : options.font) !== null && _a !== void 0 ? _a : `${rowHeight * 0.6}px sans-serif`;
    // TODO: Ensure this list isn't empty
    const words = text.split(' ');
    const rows = [];
    while (words.length > 0) {
        // Keep adding words to this row until we exceed the width or run out of words
        const wordsThisRow = [words.shift()];
        let reachedEnd = false;
        while (context.measureText(wordsThisRow.join(' ')).width < width) {
            const nextWord = words.shift();
            if (nextWord) {
                wordsThisRow.push(nextWord);
            }
            else {
                reachedEnd = true;
                break;
            }
        }
        // If we exceeded the width (and have more than one word), insert the last word back into the queue
        if (!reachedEnd && wordsThisRow.length > 1) {
            words.unshift(wordsThisRow.pop());
        }
        // Render this row and add it to the list of canvases to join
        // TODO: This makes the big assumption that the font will be the same. Can we guarantee this? Helper utility for default font or something?
        rows.push(getTextLabel(wordsThisRow.join(' '), Object.assign({ width, height: rowHeight }, options)));
    }
    return (0, util_1.joinCanvasesVertical)(rows);
}
exports.getTextBox = getTextBox;
/**
 * Generates a canvas containing a spreadsheet-like grid of text labels, with each column being automatically sized to fit the text of all its cells.
 * The background of the text grid will be transparent.
 * @param cells A grid of objects specifying the text to be printed in the cell (and optionally the text's style and font)
 * @param options.rowHeight The height of each row in the grid (defaults to 20)
 * @param options.spacing Optional horizontal spacing between each column (defaults to none)
 * @returns New canvas containing the specified grid of text
 */
function getTextGrid(cells, options) {
    const rows = cells.length;
    const cols = cells[0].length;
    const columns = [];
    for (let c = 0; c < cols; c++) {
        const canvases = [];
        for (let r = 0; r < rows; r++) {
            const cell = cells[r][c];
            // Avoid creating empty text labels by replacing empty cells with whitespace
            canvases.push(getTextLabel(cell.text || ' ', { style: cell.style, font: cell.font, height: options === null || options === void 0 ? void 0 : options.rowHeight }));
        }
        columns.push((0, util_1.joinCanvasesVertical)(canvases, { align: 'left' }));
    }
    return (0, util_1.joinCanvasesHorizontal)(columns, { align: 'top', spacing: options === null || options === void 0 ? void 0 : options.spacing });
}
exports.getTextGrid = getTextGrid;
//# sourceMappingURL=text.js.map