import { Canvas, createCanvas } from "canvas";
import { joinCanvasesHorizontal, joinCanvasesVertical } from "./util";

// Dummy canvas to be reused when measuring text width (creating a new one each time may be costly)
let dummyCanvas: Canvas | undefined = undefined;

/**
 * Given some text and font, computes how wide the resulting text would be.
 * @param text Text to measure
 * @param font Font of the text to be measured
 * @returns The width in pixels
 */
export function getTextWidth(text: string, font: string): number {
    // If the global dummy canvas doesn't exist, initialize it now
    if (!dummyCanvas) {
        dummyCanvas = createCanvas(1, 1);
    }
    const context = dummyCanvas.getContext('2d');
    context.font = font;
    return context.measureText(text).width;
}

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
export function getTextLabel(text: string, options?: { width?: number, height?: number, align?: 'center' | 'left' | 'right', font?: string, style?: string, alpha?: number, margin?: number }): Canvas {
    const HEIGHT = options?.height ?? 20;
    const FONT = options?.font ?? `${HEIGHT * 0.6}px sans-serif`;
    const WIDTH = options?.width ?? getTextWidth(text, FONT);
    const ALIGN = options?.align ?? 'center';

    if (!text) {
        throw new Error('Cannot create a text label with no text');
    }

    const canvas = createCanvas(WIDTH, HEIGHT);
    const context = canvas.getContext('2d');

    context.font = FONT;
    context.fillStyle = options?.style ?? 'white';
    context.globalAlpha = options?.alpha ?? 1;

    const ascent = context.measureText(text).actualBoundingBoxAscent;
    const verticalMargin = (HEIGHT - ascent) / 2;

    if (ALIGN === 'center') {
        const textWidth = context.measureText(text).width;
        const margin = options?.margin ?? 0;
        const usableWidth = WIDTH - (2 * margin);
        if (textWidth > usableWidth) {
            // If the text is too wide for the label, compress it
            context.fillText(text, Math.floor(margin), verticalMargin + ascent, usableWidth);
        } else {
            // If the text is smaller than the label, center it
            context.fillText(text, Math.floor(margin + (usableWidth - textWidth) / 2), verticalMargin + ascent);
        }
    } else if (ALIGN === 'right') {
        context.fillText(text, Math.floor(WIDTH - context.measureText(text).width), verticalMargin + ascent, WIDTH);
    } else {
        context.fillText(text, 0, verticalMargin + ascent, WIDTH);
    }

    context.restore();

    return canvas;
}

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
export function getTextBox(text: string, width: number, rowHeight: number, options?: { align?: 'center' | 'left' | 'right', font?: string, style?: string, alpha?: number, margin?: number }): Canvas {
    const dummyCanvas = createCanvas(1, 1);
    const context = dummyCanvas.getContext('2d');

    context.font = options?.font ?? `${rowHeight * 0.6}px sans-serif`;

    // TODO: Ensure this list isn't empty
    const words: string[] = text.split(' ');
    const rows: Canvas[] = [];
    while (words.length > 0) {
        // Keep adding words to this row until we exceed the width or run out of words
        const wordsThisRow: string[] = [words.shift() as string];
        let reachedEnd = false;
        while (context.measureText(wordsThisRow.join(' ')).width < width) {
            const nextWord = words.shift();
            if (nextWord) {
                wordsThisRow.push(nextWord);
            } else {
                reachedEnd = true;
                break;
            }
        }
        // If we exceeded the width (and have more than one word), insert the last word back into the queue
        if (!reachedEnd && wordsThisRow.length > 1) {
            words.unshift(wordsThisRow.pop() as string);
        }
        // Render this row and add it to the list of canvases to join
        // TODO: This makes the big assumption that the font will be the same. Can we guarantee this? Helper utility for default font or something?
        rows.push(getTextLabel(wordsThisRow.join(' '), { width, height: rowHeight, ...options }));
    }

    return joinCanvasesVertical(rows);
}

/**
 * Generates a canvas containing a spreadsheet-like grid of text labels, with each column being automatically sized to fit the text of all its cells.
 * The background of the text grid will be transparent.
 * @param cells A grid of objects specifying the text to be printed in the cell (and optionally the text's style and font)
 * @param options.rowHeight The height of each row in the grid (defaults to 20)
 * @param options.spacing Optional horizontal spacing between each column (defaults to none)
 * @returns New canvas containing the specified grid of text
 */
export function getTextGrid(cells: { text: string, style?: string, font?: string }[][], options?: { rowHeight?: number, spacing?: number }): Canvas {
    const rows = cells.length;
    const cols = cells[0].length;
    const columns: Canvas[] = [];
    for (let c = 0; c < cols; c++) {
        const canvases: Canvas[] = [];
        for (let r = 0; r < rows; r++) {
            const cell = cells[r][c];
            // Avoid creating empty text labels by replacing empty cells with whitespace
            canvases.push(getTextLabel(cell.text || ' ', { style: cell.style, font: cell.font, height: options?.rowHeight }));
        }
        columns.push(joinCanvasesVertical(canvases, { align: 'left' }));
    }
    return joinCanvasesHorizontal(columns, { align: 'top', spacing: options?.spacing });
}