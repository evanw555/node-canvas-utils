import canvas, { Canvas, Image, createCanvas } from 'canvas';
import { GraphPalette } from './types';
import { DEFAULT_GRAPH_PALETTE } from './constants';
import { getTextBox, getTextLabel } from './text';
import { crop, fillBackground, rectangle, getRotated, joinCanvasesAsEvenGrid, joinCanvasesHorizontal, joinCanvasesVertical, resize, superimpose, withBackground, withBorder, withDropShadow, withOutline } from './util';

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

export function renderCalendar(date: Date, events: Record<string, { background?: Image | Canvas, foreground?: Image | Canvas, text?: string }>, options?: { title?: string, tileWidth?: number, tileHeight?: number, titleBackground?: Image | Canvas, footer?: string }): Canvas {
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

        c.fillStyle = '#f1f1f1';
        c.fillRect(0, 0, tile.width, tile.height);

        if (current.getMonth() === month) {
            // Draw any events for this day
            const event = events[current.getDate().toString()] ?? events[`${month + 1}/${current.getDate().toString()}`];

            // Draw background first
            if (event && event.background) {
                const image = event.background;
                // Stretch so that it covers everything
                const scale = Math.max(tile.width / image.width, tile.height / image.height);
                const scaled = resize(image, { width: image.width * scale, height: image.height * scale });
                c.drawImage(scaled, Math.round((tile.width - scaled.width) / 2), Math.round((tile.height - scaled.height) / 2));
            }

            // Draw foreground
            if (event && event.foreground) {
                const image = event.foreground;
                // Squeeze so that it fits inside
                const scale = Math.min(tile.width / image.width, tile.height / image.height);
                const scaled = resize(image, { width: image.width * scale, height: image.height * scale });
                c.drawImage(scaled, Math.round((tile.width - scaled.width) / 2), Math.round((tile.height - scaled.height) / 2));
            }

            // Draw DOTM
            const dotm = withOutline(getTextLabel(current.getDate().toString(), { height: tile.height / 5, font: `bold ${Math.round(tile.height / 5)}px sans-serif`, style: 'black' }), { expandCanvas: true, thickness: Math.round(tile.height / 60), style: '#f1f1f1' });
            c.drawImage(dotm, 5, 5);

            // Draw text overlay
            if (event && event.text) {
                const text = event.text;
                const height = Math.round(tile.height / (3 + (text.length / 15)))
                const image = getTextBox(text, tile.width - 10, height, { font: `bold ${Math.round(0.85 * height)}px sans-serif`, style: 'black' });
                // Squeeze so that it fits inside
                const scale = Math.min((tile.width - 10) / image.width, (tile.height - 10) / image.height);
                const scaled = resize(image, { width: image.width * scale, height: image.height * scale });
                const outlined = withOutline(scaled, { expandCanvas: true, thickness: Math.round(tile.height / 90), style: '#f1f1f1' });
                c.drawImage(outlined, Math.round((tile.width - outlined.width) / 2), Math.round((tile.height - outlined.height) / 2));
            }

            // Cross the day off if it's in the past
            if (current.getDate() < date.getDate()) {
                c.strokeStyle = 'rgba(255,0,0,0.5)';
                c.lineWidth = 8;
                c.setLineDash([]);
                c.beginPath();
                c.moveTo(0, 0);
                c.lineTo(tile.width, tile.height);
                c.moveTo(tile.width, 0);
                c.lineTo(0, tile.height);
                c.stroke();
            }
        }

        // Draw the border last to frame everything
        c.strokeStyle = 'black';
        c.lineWidth = 5;
        c.setLineDash([]);
        c.strokeRect(0, 0, tile.width, tile.height);

        tiles.push(tile);

        current.setDate(current.getDate() + 1);
    }

    const grid = joinCanvasesAsEvenGrid(tiles, { columns: 7 });

    let title = withOutline(getTextLabel(options?.title ?? `Month ${month.toString()}`, { width: grid.width, height: TILE_HEIGHT, style: 'white' }), { style: 'black', thickness: 5 });

    const tbg = options?.titleBackground;
    if (tbg) {
        title = withBackground(title, tbg);
    }

    const canvases: Canvas[] = [title, grid];

    // Add footer if specified
    if (options?.footer) {
        if (tbg) {
            canvases.push(withBackground(withOutline(getTextLabel(options?.footer, { width: grid.width, height: TILE_HEIGHT / 4, font: `bold ${Math.round(TILE_HEIGHT / 5)}px sans-serif`, style: 'white', align: 'center' }), { style: 'black', thickness: 3 }), tbg));
        } else {
            canvases.push(getTextLabel(options?.footer, { height: TILE_HEIGHT / 5, font: `bold ${Math.round(TILE_HEIGHT / 5)}px sans-serif`, style: 'black', align: 'center' }));
        }
        let footer = getTextLabel(options?.footer, { height: TILE_HEIGHT / 5, font: `bold ${Math.round(TILE_HEIGHT / 5)}px sans-serif`, style: 'black', align: 'center' });
        if (tbg) {
            footer = withBackground(withOutline(footer, { style: 'black', thickness: 5 }), tbg);
        }
    }

    return fillBackground(joinCanvasesVertical(canvases, { align: 'center' }), { background: 'white' });
}

interface LineGraphAxisOptions {
    label?: string,
    scale?: number,
    min?: number,
    max?: number,
    stringify?: (value: number) => string
}

export async function createLineGraph(data: { x: number, y: number }[], options?: { title?: string, x?: LineGraphAxisOptions, y?: LineGraphAxisOptions, showMin?: boolean, showMax?: boolean }): Promise<Canvas> {
    const WIDTH = 640;
    const HEIGHT = 480;

    const TITLE = options?.title ?? 'Line Graph';
    const title = withDropShadow(getTextLabel(TITLE, { font: `${Math.round(HEIGHT / 8)}px sans-serif`, height: Math.round(HEIGHT / 8), align: 'center' }), { expandCanvas: true });

    const xAxisName = options?.x?.label ?? 'X Axis';
    const xLabel = withDropShadow(getTextLabel(xAxisName, { font: `${Math.round(HEIGHT / 16)}px sans-serif`, height: Math.round(HEIGHT / 16), align: 'center' }), { expandCanvas: true });

    const yAxisName = options?.y?.label ?? 'Y Axis';
    const yLabel = withDropShadow(getTextLabel(yAxisName, { font: `${Math.round(HEIGHT / 16)}px sans-serif`, height: Math.round(HEIGHT / 16), align: 'center' }), { expandCanvas: true });
    const rotatedYLabel = getRotated(yLabel, 3 * Math.PI / 2);

    // Render the data
    const BORDER_WIDTH = 2;
    const DATA_WIDTH = WIDTH - rotatedYLabel.width - 2 * BORDER_WIDTH;
    const DATA_HEIGHT = HEIGHT - title.height - xLabel.height - 2 * BORDER_WIDTH;
    const canvas = createCanvas(DATA_WIDTH, DATA_HEIGHT);
    const c = canvas.getContext('2d');

    c.fillStyle = 'white';
    c.fillRect(0, 0, DATA_WIDTH, DATA_HEIGHT);

    const sortedData = data.sort((x, y) => x.x - y.x);
    const minX = Math.min(...sortedData.map(d => d.x));
    const maxX = Math.max(...sortedData.map(d => d.x));
    const xRange = maxX - minX;
    const realMinY = Math.min(...sortedData.map(d => d.y));
    const realMaxY = Math.max(...sortedData.map(d => d.y));
    const realYRange = realMaxY - realMinY;
    const minY = options?.y?.min ?? (realMinY - 0.15 * realYRange);
    const maxY = options?.y?.max ?? (realMaxY + 0.075 * realYRange);
    const yRange = maxY - minY;

    const toChartX = (x: number) => Math.round(DATA_WIDTH * (x - minX) / xRange);
    const toChartY = (y: number) => Math.round(DATA_HEIGHT - DATA_HEIGHT * (y - minY) / yRange);

    const stringifyX = options?.x?.stringify ?? ((value: number) => value.toString());
    const stringifyY = options?.y?.stringify ?? ((value: number) => value.toString());

    // Draw the grid lines
    const X_SCALE = options?.x?.scale ?? 1;
    for (let x = X_SCALE * Math.round(minX / X_SCALE); x < maxX; x += X_SCALE) {
        c.strokeStyle = 'lightgray';
        c.lineWidth = 2;
        c.setLineDash([]);
        c.beginPath();
        c.moveTo(toChartX(x), 0);
        c.lineTo(toChartX(x), DATA_HEIGHT);
        c.stroke();
    }
    const Y_SCALE = options?.y?.scale ?? 1;
    for (let y = Y_SCALE * Math.round(minY / Y_SCALE); y < maxY; y += Y_SCALE) {
        c.strokeStyle = 'lightgray';
        c.lineWidth = 2;
        c.setLineDash([]);
        c.beginPath();
        c.moveTo(0, toChartY(y));
        c.lineTo(DATA_WIDTH, toChartY(y));
        c.stroke();
    }

    // Draw the data line
    c.strokeStyle = 'blue';
    c.lineWidth = 3;
    c.setLineDash([]);
    c.beginPath();
    for (const {x, y} of sortedData) {
        c.lineTo(toChartX(x), toChartY(y));
    }
    c.stroke();

    // Draw the axis scale labels
    const SCALE_HEIGHT = Math.round(HEIGHT / 24);
    for (let x = X_SCALE * Math.round(minX / X_SCALE); x < maxX; x += X_SCALE) {
        const label = withBackground(getTextLabel(stringifyX(x), { font: `bold ${SCALE_HEIGHT}px sans-serif`, height: SCALE_HEIGHT, style: 'black' }), 'white');
        c.drawImage(label, toChartX(x) - label.width / 2, DATA_HEIGHT - label.height);
    }
    let maxScaleWidth = 0;
    for (let y = Y_SCALE * Math.round(minY / Y_SCALE); y < maxY; y += Y_SCALE) {
        const label = withBackground(getTextLabel(stringifyY(y), { font: `bold ${SCALE_HEIGHT}px sans-serif`, height: SCALE_HEIGHT, style: 'black' }), 'white');
        c.drawImage(label, 0, toChartY(y) - label.height / 2);
        // Keep track of the widest label on this axis
        if (label.width > maxScaleWidth) {
            maxScaleWidth = label.width;
        }
    }

    const POINT_LABEL_HEIGHT = Math.round(HEIGHT / 36);

    // Draw the min point
    if (options?.showMin) {
        let minPoint: { x: number, y: number } | undefined = undefined;
        for (const point of data) {
            const knownMin = minPoint?.y ?? Number.MAX_SAFE_INTEGER;
            if (point.y < knownMin) {
                minPoint = point;
            }
        }
        if (minPoint) {
            const { x, y } = minPoint;
            // const text = `(${stringifyX(x)}, ${stringifyY(y)})`;
            const text = `▼ ${stringifyY(y)}`;
            const label = withBackground(getTextLabel(text, { font: `bold ${POINT_LABEL_HEIGHT}px sans-serif`, height: POINT_LABEL_HEIGHT, style: 'black' }), 'white');
            const clampedChartX = Math.min(Math.max(maxScaleWidth, toChartX(x) - label.width / 2), DATA_WIDTH - label.width);
            const clampedChartY = Math.min(Math.max(0, toChartY(y) + 4), DATA_HEIGHT - label.height);
            c.drawImage(label, clampedChartX, clampedChartY);
        }
    }

    // Draw the max point
    if (options?.showMax) {
        let maxPoint: { x: number, y: number } | undefined = undefined;
        for (const point of data) {
            const knownMax = maxPoint?.y ?? Number.MIN_SAFE_INTEGER;
            if (point.y > knownMax) {
                maxPoint = point;
            }
        }
        if (maxPoint) {
            const { x, y } = maxPoint;
            // const text = `(${stringifyX(x)}, ${stringifyY(y)})`;
            const text = `▲ ${stringifyY(y)}`;
            const label = withBackground(getTextLabel(text, { font: `bold ${POINT_LABEL_HEIGHT}px sans-serif`, height: POINT_LABEL_HEIGHT, style: 'black' }), 'white');
            const clampedChartX = Math.min(Math.max(maxScaleWidth, toChartX(x) - label.width / 2), DATA_WIDTH - label.width);
            const clampedChartY = Math.min(Math.max(0, toChartY(y) - 1.5 * label.height), DATA_HEIGHT - label.height);
            c.drawImage(label, clampedChartX, clampedChartY);
        }
    }

    return joinCanvasesVertical([
        title,
        joinCanvasesHorizontal([
            rotatedYLabel,
            withBorder(canvas, { thickness: BORDER_WIDTH, style: 'lightgray' })
        ], { align: 'center' }),
        xLabel
    ], { align: 'center' });
}

export function createPieChart(data: { value: number, label: string, style?: string }[], options?: { height?: number, title?: string }): Canvas {
    const HEIGHT = options?.height ?? 256;

    // Render the title first
    let title: Canvas | undefined;
    if (options?.title) {
        const px = Math.round(HEIGHT / 6);
        title = getTextLabel(options.title, { width: HEIGHT, height: px, font: `${px}px sans-serif`, style: 'white', align: 'center' });
    }

    const PIE_HEIGHT = HEIGHT - (title?.height ?? 0);
    const RADIUS = Math.round(PIE_HEIGHT / 2);
    const canvas = createCanvas(PIE_HEIGHT, PIE_HEIGHT);
    const c = canvas.getContext('2d');

    const totalValue = data.map(d => d.value).reduce((x, y) => x + y);
    const radiansPerValue = (Math.PI * 2) / totalValue;

    const sortedData = [...data].sort((x, y) => y.value - x.value);

    // Draw each slice of the pie
    let angle = -Math.PI / 2;
    for (const { value, label, style } of sortedData) {
        const nextAngle = angle + value * radiansPerValue;
        c.moveTo(RADIUS, RADIUS);
        c.beginPath();
        c.arc(RADIUS, RADIUS, RADIUS - 2, angle, nextAngle);
        c.lineTo(RADIUS, RADIUS);
        c.closePath();
        c.fillStyle = style ?? `rgb(${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)})`;
        c.fill();
        c.lineWidth = 2;
        c.strokeStyle = 'white';
        c.stroke();
        angle = nextAngle;
    }

    const MARGIN = Math.round(HEIGHT / 32);

    // Construct the legend on the side
    // TODO: This possibly exceeds the requested height. Fix this.
    const rows: Canvas[] = [];
    const rowHeight = Math.round(PIE_HEIGHT / Math.max(8, sortedData.length));
    for (const { value, label, style } of sortedData) {
        const box = rectangle({ width: rowHeight, height: rowHeight, fillStyle: style });
        const textLabel = getTextLabel(label, { margin: 4, height: rowHeight, font: `bold ${rowHeight * 0.9}px sans-serif`, style: 'white', align: 'left' });
        rows.push(joinCanvasesHorizontal([
            box,
            textLabel
        ], { spacing: MARGIN }));
    }

    // TODO: Expanding the canvas may affect the final size, making it not match the specified height
    return withDropShadow(joinCanvasesHorizontal([
        joinCanvasesVertical([
            // TODO: Creating a dummy 1x1 rectangle is not the answer here
            title ?? rectangle(),
            canvas
        ], { align: 'center', spacing: MARGIN }),
        joinCanvasesVertical(rows, { align: 'left', spacing: MARGIN })
    ], { align: 'center', spacing: MARGIN }), { expandCanvas: true });
}