import { Canvas, Image, createCanvas, loadImage } from "canvas";
import { joinCanvasesHorizontal, joinCanvasesVertical, resize } from "./util";

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

// TODO: This util needs a ton of optimization
export async function getMarkdownTextLabel(text: string, options?: { height?: number, fontFamily?: string, style?: string, inlineImages?: Record<string, (match: RegExpMatchArray) => Promise<Canvas | Image | undefined>> }): Promise<Canvas> {
    const HEIGHT = options?.height ?? 24;

    const canvases: (Canvas | Image)[] = [];

    let bold = false;
    let italic = false;
    // TODO: Support this somewhow
    let underline = false;
    let strikethrough = false;

    let i = 0;
    let textBuffer = '';
    const renderTextBuffer = () => {
        const font = (bold ? 'bold ' : '') + (italic ? 'italic ' : '') + (strikethrough ? 'strikethrough ' : '') + `${Math.round(0.85 * HEIGHT)}px` + (options?.fontFamily ?? 'sans-serif'); 
        const label = getTextLabel(textBuffer, { height: options?.height, style: options?.style, font });
        return label;
    };
    const processTextBuffer = () => {
        if (textBuffer.length > 0) {
            canvases.push(renderTextBuffer());
            textBuffer = '';
        }
    };
    while (i < text.length) {
        // If it starts with a custom image pattern
        const inlineImages = options?.inlineImages ?? {};
        let imageFound = false;
        for (const rawPattern of Object.keys(inlineImages)) {
            const pattern = new RegExp('^' + rawPattern);
            const match = text.substring(i).match(pattern);
            if (match) {
                const fn = inlineImages[rawPattern];
                const image = await fn(match);
                if (image) {
                    processTextBuffer();
                    canvases.push(resize(image, { height: HEIGHT }));
                    i += match[0].length;
                    imageFound = true;
                    break;
                }
            }
        }
        if (imageFound) {
            continue;
        }
        // If starts with an emoji
        // NOTE: The emoji must start with normal emoji characters, not e.g. ZWJ
        const emojiMatch = text.substring(i).match(/^\p{Extended_Pictographic}[\p{Extended_Pictographic}\u{200D}\u{FE0F}\u{1F3FB}-\u{1F3FF}\u{1F1E6}-\u{1F1FF}\u{20E3}]*/u);
        if (emojiMatch) {
            processTextBuffer();
            const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
            const segments = segmenter.segment(emojiMatch[0]);
            for (const segment of segments) {
                // Convert each code point of the emoji into a raw hex string
                const codePoints = [...segment.segment].map(s => s.codePointAt(0)?.toString(16));
                // Unless the zero-width joiner is included (200d), strip out the variant code point (fe0f)
                // See this thread for context: https://github.com/twitter/twemoji/issues/419
                const contains200d = codePoints.includes('200d');
                const identifier = codePoints.filter(cp => contains200d || cp !== 'fe0f').join('-');
                let image: Image | Canvas;
                try {
                    image = await loadImage(`https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/${identifier}.png`);
                } catch (err) {
                    try {
                        image = await loadImage(`https://www.emojiall.com/images/120/apple/ios-17.4/${identifier}.png`);
                    } catch (err2) {
                        image = getTextLabel(`ERROR_EMOJI_${identifier}`);
                    }
                }
                canvases.push(resize(image, { height: HEIGHT }));
            }
            i += emojiMatch[0].length;
        } else if (text.substring(i, i + 2) === '**' && (bold || text.includes('**', i + 2))) {
            processTextBuffer();
            bold = !bold;
            i += 2;
        } else if (text.substring(i, i + 2) === '__' && (strikethrough || text.includes('__', i + 2))) {
            // TODO: This doesn't actually work, will need to manually underline it
            processTextBuffer();
            underline = !underline;
            i += 2;
        } else if (text.substring(i, i + 1) === '_' && (italic || text.includes('_', i + 1))) {
            processTextBuffer();
            italic = !italic;
            i++;
        } else if (text.substring(i, i + 2) === '~~' && (strikethrough || text.includes('~~', i + 2))) {
            // TODO: This doesn't actually work, will need to manually strike it out
            processTextBuffer();
            strikethrough = !strikethrough;
            i += 2;
        } else {
            textBuffer += text.substring(i, i + 1);
            i++;
        }
    }
    processTextBuffer();
    return joinCanvasesHorizontal(canvases);
}

/**
 * Generates a canvas containing the specified text displayed vertically (top-to-bottom) with optional parameters.
 * The options are the same as in {@link getTextLabel}, and have the sam effect.
 */
export function getVerticalTextLabel(text: string, options?: { width?: number, height?: number, align?: 'center' | 'left' | 'right', font?: string, style?: string, alpha?: number, margin?: number }): Canvas {
    if (!text) {
        throw new Error('Cannot create a vertical text label with no text');
    }

    const characters = text.trim().split('');

    const canvases = characters.map(c => getTextLabel(c, options));

    return joinCanvasesVertical(canvases, { align: options?.align });
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