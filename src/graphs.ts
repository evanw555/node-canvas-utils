import canvas, { Canvas } from 'canvas';
import { GraphPalette } from './types';
import { DEFAULT_GRAPH_PALETTE } from './constants';
import { getTextLabel } from './text';
import { fillBackground, joinCanvasesVertical } from './util';

export async function createBarGraph(entries: { name: string, value: number, imageUrl: string }[], options?: { showNames?: boolean, title?: string, subtitle?: string, rowHeight?: number, width?: number, palette?: GraphPalette }): Promise<Canvas> {
    const ROW_HEIGHT = options?.rowHeight ?? 40;
    const WIDTH = options?.width ?? 480
    const SHOW_NAMES = options?.showNames ?? true;
    const PALETTE = options?.palette ?? DEFAULT_GRAPH_PALETTE;

    // Margin between elements and around the edge of the canvas
    const MARGIN = 8;
    // Padding within boxes
    const PADDING = 4;

    const TOTAL_ROWS = entries.length;
    const HEIGHT = TOTAL_ROWS * ROW_HEIGHT + (TOTAL_ROWS + 1) * MARGIN;

    const c = canvas.createCanvas(WIDTH, HEIGHT);
    const context = c.getContext('2d');

    // The font for all text in the graph itself is the same
    context.font = `${Math.floor(ROW_HEIGHT * 0.6)}px sans-serif`;

    // Determine the largest entry value
    const maxEntryValue = Math.max(...entries.map(e => e.value));

    // Draw each row
    let baseY = MARGIN;
    for (const entry of entries) {
        // TODO: Use image loader with cache
        let image: canvas.Image | undefined = undefined;
        try {
            image = await canvas.loadImage(entry.imageUrl);
        } catch (err) {
            // TODO: Use broken image
        }
        let baseX = MARGIN;
        // Write the name to the left of the image
        if (SHOW_NAMES) {
            context.fillStyle = PALETTE.padding;
            context.fillRect(baseX, baseY, ROW_HEIGHT * 2, ROW_HEIGHT);
            context.fillStyle = PALETTE.text;
            context.fillText(entry.name, baseX + PADDING, baseY + 0.75 * ROW_HEIGHT, (ROW_HEIGHT - PADDING) * 2);
            baseX += ROW_HEIGHT * 2 + MARGIN;
        }
        // Draw the image
        context.fillStyle = PALETTE.padding;
        context.fillRect(baseX, baseY, ROW_HEIGHT, ROW_HEIGHT);
        // TODO: Once using image loader, image should always be defined
        if (image) {
            context.drawImage(image, baseX + PADDING, baseY + PADDING, ROW_HEIGHT - 2 * PADDING, ROW_HEIGHT - 2 * PADDING);
        }
        baseX += ROW_HEIGHT + MARGIN;
        // Draw the bar
        const MAX_BAR_WIDTH = WIDTH - baseX - MARGIN;
        const barWidth = Math.floor(MAX_BAR_WIDTH * entry.value / maxEntryValue);
        context.fillStyle = PALETTE.padding;
        context.fillRect(baseX, baseY, barWidth, ROW_HEIGHT);
        if (barWidth > PADDING * 2) {
            context.fillStyle = PALETTE.highlight;
            context.fillRect(baseX + PADDING, baseY + PADDING, barWidth - 2 * PADDING, ROW_HEIGHT - 2 * PADDING);
        }
        // Write the number value
        const valueText = `${entry.value}`;
        const valueTextWidth = context.measureText(valueText).width;
        context.fillStyle = PALETTE.text;
        if (valueTextWidth + 4 * PADDING < barWidth) {
            // If it's small enough, write it inside the bar
            context.fillText(valueText, baseX + barWidth - valueTextWidth - 2 * PADDING, baseY + 0.75 * ROW_HEIGHT);
        } else {
            // Else, write it outside the bar
            context.fillText(valueText, baseX + barWidth + MARGIN, baseY + 0.75 * ROW_HEIGHT);
        }
        // Advance vertical offset
        baseY += ROW_HEIGHT + MARGIN;
    }

    const canvases: Canvas[] = [];

    // If it has a title, add it
    if (options?.title) {
        canvases.push(getTextLabel(options?.title, WIDTH, ROW_HEIGHT, { align: 'center', style: PALETTE.text, margin: MARGIN }));
    }

    // If it has a subtitle, add it
    if (options?.subtitle) {
        canvases.push(getTextLabel(options?.subtitle, WIDTH, Math.round(ROW_HEIGHT * 0.66), { align: 'center', style: PALETTE.text, margin: MARGIN }));
    }

    // Add the actual graph
    canvases.push(c);

    // Return all components joined with a background
    return fillBackground(joinCanvasesVertical(canvases), PALETTE);
}