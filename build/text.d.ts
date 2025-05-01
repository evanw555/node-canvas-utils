import { Canvas } from "canvas";
/**
 * Given some text and font, computes how wide the resulting text would be.
 * @param text Text to measure
 * @param font Font of the text to be measured
 * @returns The width in pixels
 */
export declare function getTextWidth(text: string, font: string): number;
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
export declare function getTextLabel(text: string, options?: {
    width?: number;
    height?: number;
    align?: 'center' | 'left' | 'right';
    font?: string;
    style?: string;
    alpha?: number;
    margin?: number;
}): Canvas;
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
export declare function getTextBox(text: string, width: number, rowHeight: number, options?: {
    align?: 'center' | 'left' | 'right';
    font?: string;
    style?: string;
    alpha?: number;
    margin?: number;
}): Canvas;
/**
 * Generates a canvas containing a spreadsheet-like grid of text labels, with each column being automatically sized to fit the text of all its cells.
 * The background of the text grid will be transparent.
 * @param cells A grid of objects specifying the text to be printed in the cell (and optionally the text's style and font)
 * @param options.rowHeight The height of each row in the grid (defaults to 20)
 * @param options.spacing Optional horizontal spacing between each column (defaults to none)
 * @returns New canvas containing the specified grid of text
 */
export declare function getTextGrid(cells: {
    text: string;
    style?: string;
    font?: string;
}[][], options?: {
    rowHeight?: number;
    spacing?: number;
}): Canvas;
//# sourceMappingURL=text.d.ts.map