import canvas, { Canvas, Image, createCanvas } from 'canvas';
import { GraphPalette } from './types';
import { DEFAULT_GRAPH_PALETTE } from './constants';
import { getTextBox, getTextLabel } from './text';
import { crop, fillBackground, joinCanvasesAsEvenGrid, joinCanvasesHorizontal, joinCanvasesVertical, resize, superimpose, withBackground, withOutline } from './util';

/**
 * Generates a canvas containing a bar graph from the provided data entries in the order provided.
 * @param entries Data representing one row of the graph (with string name, number value, and optional icon)
 * @param options.showNames Whether to show name labels for each row (defaults to true)
 * @param options.showIcons Whether to show icons for each row (defaults to true)
 * @param options.title Title to render above the graph (defaults to none)
 * @param options.subtitle Subtitle to render below the title (defaults to none)
 * @param options.rowHeight Height of each bar, including padding (defaults to 40px)
 * @param options.width Width of the entire resulting graph (defaults to 480)
 * @param options.palette Palette to use when drawing the graph (defaults to default graph palette)
 * @param options.decimalPrecision Number of decimal places to show on row number values
 * @returns New canvas containing the rendered bar graph
 */
export async function createBarGraph(entries: { name: string, value: number, icon?: string | Canvas | Image, color?: string, arrow?: 'up' | 'down' }[], options?: { showNames?: boolean, showIcons?: boolean, title?: string, subtitle?: string, rowHeight?: number, width?: number, palette?: GraphPalette, decimalPrecision?: number }): Promise<Canvas> {
    const ROW_HEIGHT = options?.rowHeight ?? 40;
    const WIDTH = options?.width ?? 480
    const SHOW_NAMES = options?.showNames ?? true;
    const SHOW_ICONS = options?.showIcons ?? true;
    const PALETTE = options?.palette ?? DEFAULT_GRAPH_PALETTE;
    const DECIMAL_PRECISION = options?.decimalPrecision ?? 1;

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
        let image: Image | Canvas | undefined = undefined;
        if (entry.icon) {
            if (typeof entry.icon === 'string') {
                try {
                    image = await canvas.loadImage(entry.icon);
                } catch (err) {
                    // TODO: Use broken image
                }
            } else {
                image = entry.icon;
            }
        }
        let baseX = MARGIN;
        // Write the name to the left of the icon
        if (SHOW_NAMES) {
            context.fillStyle = PALETTE.padding;
            context.fillRect(baseX, baseY, ROW_HEIGHT * 2, ROW_HEIGHT);
            context.fillStyle = PALETTE.text;
            context.fillText(entry.name, baseX + PADDING, baseY + 0.75 * ROW_HEIGHT, (ROW_HEIGHT - PADDING) * 2);
            baseX += ROW_HEIGHT * 2 + MARGIN;
        }
        // Draw the icon
        if (SHOW_ICONS) {
            context.fillStyle = PALETTE.padding;
            context.fillRect(baseX, baseY, ROW_HEIGHT, ROW_HEIGHT);
            // TODO: Once using image loader, image should always be defined
            if (image) {
                context.drawImage(image, baseX + PADDING, baseY + PADDING, ROW_HEIGHT - 2 * PADDING, ROW_HEIGHT - 2 * PADDING);
            }
            baseX += ROW_HEIGHT + MARGIN;
        }
        // Draw the bar
        const MAX_BAR_WIDTH = WIDTH - baseX - MARGIN;
        const barWidth = Math.floor(MAX_BAR_WIDTH * entry.value / maxEntryValue);
        context.fillStyle = PALETTE.padding;
        context.fillRect(baseX, baseY, barWidth, ROW_HEIGHT);
        if (barWidth > PADDING * 2) {
            // Use the color override if it exists, else use the palette highlight color
            context.fillStyle = entry.color ?? PALETTE.highlight;
            context.fillRect(baseX + PADDING, baseY + PADDING, barWidth - 2 * PADDING, ROW_HEIGHT - 2 * PADDING);
        }
        // If an arrow is specified, draw accordingly
        // TODO: This feature sucks and should be better
        if (entry.arrow) {
            context.fillStyle = entry.arrow === 'up' ? 'darkgreen' : 'darkred';
            context.fillText(entry.arrow === 'up' ? '⬆' : '⬇', baseX + 2 * PADDING, baseY + 0.75 * ROW_HEIGHT)
        }
        // Write the number value
        const valueText = parseFloat(entry.value.toFixed(DECIMAL_PRECISION)).toString();
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
        canvases.push(getTextLabel(options?.title, { width: WIDTH, height: ROW_HEIGHT, align: 'center', style: PALETTE.text, margin: MARGIN }));
    }

    // If it has a subtitle, add it
    if (options?.subtitle) {
        canvases.push(getTextLabel(options?.subtitle, { width: WIDTH, height: Math.round(ROW_HEIGHT * 0.66), align: 'center', style: PALETTE.text, margin: MARGIN }));
    }

    // Add the actual graph
    canvases.push(c);

    // Return all components joined with a background
    return fillBackground(joinCanvasesVertical(canvases), PALETTE);
}

export function renderCalendar(date: Date, events: Record<string, Image | Canvas | string>, options?: { title?: string, tileWidth?: number, tileHeight?: number, titleBackground?: Image | Canvas }): Canvas {
    const TILE_WIDTH = options?.tileWidth ?? 160;
    const TILE_HEIGHT = options?.tileHeight ?? 120;

    const firstDay = new Date(date);
    firstDay.setDate(1);
    const endOn = new Date(firstDay);
    endOn.setMonth(endOn.getMonth() + 1);
    const month = date.getMonth();
    const tiles: Canvas[] = [];
    const current = new Date(firstDay);
    current.setDate(current.getDate() - current.getDay());
    while (current.toDateString() !== endOn.toDateString() && current.getTime() < endOn.getTime()) {
        const tile = createCanvas(TILE_WIDTH, TILE_HEIGHT);
        const c = tile.getContext('2d');

        c.fillStyle = 'white';
        c.fillRect(0, 0, tile.width, tile.height);
        c.strokeStyle = 'black';
        c.lineWidth = 5;
        c.strokeRect(0, 0, tile.width, tile.height);

        let overlay: Image | Canvas | undefined;

        if (current.getMonth() === month) {
            // Draw DOTM
            c.drawImage(getTextLabel(current.getDate().toString(), { height: tile.height / 5, font: `bold ${Math.round(tile.height / 5)}px sans-serif`, style: 'black' }), 5, 5);

            // Draw any events for this day
            const event: Image | Canvas | string | undefined = events[current.getDate().toString()] ?? events[`${month + 1}/${current.getDate().toString()}`];
            if (event) {
                // If it's an image to be drawn
                if (event instanceof Image || event instanceof Canvas) {
                    overlay = event;
                    // c.drawImage(event, Math.round((tile.width - event.width) / 2), Math.round((tile.height - event.height) / 2));
                }
                // If it's a string
                else if (typeof event === 'string') {
                    overlay = getTextBox(event, tile.width - 10, Math.round(tile.height / 5), { font: `${Math.round(tile.height / 6)}px sans-serif`, style: 'black' });
                }
            }

            // Cross the day off if it's in the past
            if (current.getDate() < date.getDate()) {
                c.strokeStyle = 'rgba(255,0,0,0.5)';
                c.beginPath();
                c.moveTo(0, 0);
                c.lineTo(tile.width, tile.height);
                c.moveTo(tile.width, 0);
                c.lineTo(0, tile.height);
                c.stroke();
            }
        }

        if (overlay) {
            const scale = Math.min(tile.width / overlay.width, tile.height / overlay.height);
            tiles.push(superimpose([
                tile,
                resize(overlay, { width: overlay.width * scale, height: overlay.height * scale })
            ]));
        } else {
            tiles.push(tile);
        }

        current.setDate(current.getDate() + 1);
    }

    const grid = joinCanvasesAsEvenGrid(tiles, { columns: 7 });

    let title = withOutline(getTextLabel(options?.title ?? `Month ${month.toString()}`, { width: grid.width, height: TILE_HEIGHT, style: 'white' }), { style: 'black', thickness: 5 });

    const tbg = options?.titleBackground;
    if (tbg) {
        title = withBackground(title, tbg);
    }

    return fillBackground(joinCanvasesVertical([title, grid], { align: 'center' }), { background: 'white' });
}