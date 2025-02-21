import { Canvas } from "canvas";
/**
 * Generates a canvas containing the specified text with the specified width and height.
 * The size of the text will be automatically determined unless specified otherwise.
 * The background of the label will be transparent.
 * @param text The text used to generate the label
 * @param width Desired width of the resulting label image
 * @param height Desired height of the resulting label image
 * @param options.align How to align the text horizontally
 * @param options.font Font to for the text (defaults to an auto-sized sans-serif)
 * @param options.style Style to use for the text (defaults to white)
 * @param options.alpha Alpha to use for the text (defaults to opaque)
 * @param options.margin Optional horizontal margin (defaults to none)
 * @returns New canvas containing the specified text
 */
export declare function getTextLabel(text: string, width: number, height: number, options?: {
    align?: 'center' | 'left' | 'right';
    font?: string;
    style?: string;
    alpha?: number;
    margin?: number;
}): Canvas;
export declare function getTextBox(text: string, width: number, rowHeight: number, options?: {
    align?: 'center' | 'left' | 'right';
    font?: string;
    style?: string;
    alpha?: number;
    margin?: number;
}): Canvas;
//# sourceMappingURL=text.d.ts.map