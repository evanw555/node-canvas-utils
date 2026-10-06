"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderCalendar = exports.createBarGraph = void 0;
const canvas_1 = __importStar(require("canvas"));
const constants_1 = require("./constants");
const text_1 = require("./text");
const util_1 = require("./util");
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
function createBarGraph(entries, options) {
    var _a, _b, _c, _d, _e, _f, _g;
    return __awaiter(this, void 0, void 0, function* () {
        const ROW_HEIGHT = (_a = options === null || options === void 0 ? void 0 : options.rowHeight) !== null && _a !== void 0 ? _a : 40;
        const WIDTH = (_b = options === null || options === void 0 ? void 0 : options.width) !== null && _b !== void 0 ? _b : 480;
        const SHOW_NAMES = (_c = options === null || options === void 0 ? void 0 : options.showNames) !== null && _c !== void 0 ? _c : true;
        const SHOW_ICONS = (_d = options === null || options === void 0 ? void 0 : options.showIcons) !== null && _d !== void 0 ? _d : true;
        const PALETTE = (_e = options === null || options === void 0 ? void 0 : options.palette) !== null && _e !== void 0 ? _e : constants_1.DEFAULT_GRAPH_PALETTE;
        const DECIMAL_PRECISION = (_f = options === null || options === void 0 ? void 0 : options.decimalPrecision) !== null && _f !== void 0 ? _f : 1;
        // Margin between elements and around the edge of the canvas
        const MARGIN = 8;
        // Padding within boxes
        const PADDING = 4;
        const TOTAL_ROWS = entries.length;
        const HEIGHT = TOTAL_ROWS * ROW_HEIGHT + (TOTAL_ROWS + 1) * MARGIN;
        const c = canvas_1.default.createCanvas(WIDTH, HEIGHT);
        const context = c.getContext('2d');
        // The font for all text in the graph itself is the same
        context.font = `${Math.floor(ROW_HEIGHT * 0.6)}px sans-serif`;
        // Determine the largest entry value
        const maxEntryValue = Math.max(...entries.map(e => e.value));
        // Draw each row
        let baseY = MARGIN;
        for (const entry of entries) {
            // TODO: Use image loader with cache
            let image = undefined;
            if (entry.icon) {
                if (typeof entry.icon === 'string') {
                    try {
                        image = yield canvas_1.default.loadImage(entry.icon);
                    }
                    catch (err) {
                        // TODO: Use broken image
                    }
                }
                else {
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
                context.fillStyle = (_g = entry.color) !== null && _g !== void 0 ? _g : PALETTE.highlight;
                context.fillRect(baseX + PADDING, baseY + PADDING, barWidth - 2 * PADDING, ROW_HEIGHT - 2 * PADDING);
            }
            // If an arrow is specified, draw accordingly
            // TODO: This feature sucks and should be better
            if (entry.arrow) {
                context.fillStyle = entry.arrow === 'up' ? 'darkgreen' : 'darkred';
                context.fillText(entry.arrow === 'up' ? '⬆' : '⬇', baseX + 2 * PADDING, baseY + 0.75 * ROW_HEIGHT);
            }
            // Write the number value
            const valueText = parseFloat(entry.value.toFixed(DECIMAL_PRECISION)).toString();
            const valueTextWidth = context.measureText(valueText).width;
            context.fillStyle = PALETTE.text;
            if (valueTextWidth + 4 * PADDING < barWidth) {
                // If it's small enough, write it inside the bar
                context.fillText(valueText, baseX + barWidth - valueTextWidth - 2 * PADDING, baseY + 0.75 * ROW_HEIGHT);
            }
            else {
                // Else, write it outside the bar
                context.fillText(valueText, baseX + barWidth + MARGIN, baseY + 0.75 * ROW_HEIGHT);
            }
            // Advance vertical offset
            baseY += ROW_HEIGHT + MARGIN;
        }
        const canvases = [];
        // If it has a title, add it
        if (options === null || options === void 0 ? void 0 : options.title) {
            canvases.push((0, text_1.getTextLabel)(options === null || options === void 0 ? void 0 : options.title, { width: WIDTH, height: ROW_HEIGHT, align: 'center', style: PALETTE.text, margin: MARGIN }));
        }
        // If it has a subtitle, add it
        if (options === null || options === void 0 ? void 0 : options.subtitle) {
            canvases.push((0, text_1.getTextLabel)(options === null || options === void 0 ? void 0 : options.subtitle, { width: WIDTH, height: Math.round(ROW_HEIGHT * 0.66), align: 'center', style: PALETTE.text, margin: MARGIN }));
        }
        // Add the actual graph
        canvases.push(c);
        // Return all components joined with a background
        return (0, util_1.fillBackground)((0, util_1.joinCanvasesVertical)(canvases), PALETTE);
    });
}
exports.createBarGraph = createBarGraph;
function renderCalendar(date, events, options) {
    var _a, _b, _c, _d;
    const TILE_WIDTH = (_a = options === null || options === void 0 ? void 0 : options.tileWidth) !== null && _a !== void 0 ? _a : 160;
    const TILE_HEIGHT = (_b = options === null || options === void 0 ? void 0 : options.tileHeight) !== null && _b !== void 0 ? _b : 120;
    const firstDay = new Date(date);
    firstDay.setDate(1);
    const endOn = new Date(firstDay);
    endOn.setMonth(endOn.getMonth() + 1);
    const month = date.getMonth();
    const tiles = [];
    const current = new Date(firstDay);
    current.setDate(current.getDate() - current.getDay());
    while (current.toDateString() !== endOn.toDateString() && current.getTime() < endOn.getTime()) {
        const tile = (0, canvas_1.createCanvas)(TILE_WIDTH, TILE_HEIGHT);
        const c = tile.getContext('2d');
        c.fillStyle = '#f1f1f1';
        c.fillRect(0, 0, tile.width, tile.height);
        if (current.getMonth() === month) {
            // Draw any events for this day
            const event = (_c = events[current.getDate().toString()]) !== null && _c !== void 0 ? _c : events[`${month + 1}/${current.getDate().toString()}`];
            // Draw background first
            if (event && event.background) {
                const image = event.background;
                // Stretch so that it covers everything
                const scale = Math.max(tile.width / image.width, tile.height / image.height);
                const scaled = (0, util_1.resize)(image, { width: image.width * scale, height: image.height * scale });
                c.drawImage(scaled, Math.round((tile.width - scaled.width) / 2), Math.round((tile.height - scaled.height) / 2));
            }
            // Draw foreground
            if (event && event.foreground) {
                const image = event.foreground;
                // Squeeze so that it fits inside
                const scale = Math.min(tile.width / image.width, tile.height / image.height);
                const scaled = (0, util_1.resize)(image, { width: image.width * scale, height: image.height * scale });
                c.drawImage(scaled, Math.round((tile.width - scaled.width) / 2), Math.round((tile.height - scaled.height) / 2));
            }
            // Draw DOTM
            const dotm = (0, util_1.withOutline)((0, text_1.getTextLabel)(current.getDate().toString(), { height: tile.height / 5, font: `bold ${Math.round(tile.height / 5)}px sans-serif`, style: 'black' }), { expandCanvas: true, thickness: Math.round(tile.height / 60), style: '#f1f1f1' });
            c.drawImage(dotm, 5, 5);
            // Draw text overlay
            if (event && event.text) {
                const text = event.text;
                const height = Math.round(tile.height / (3 + (text.length / 15)));
                const image = (0, text_1.getTextBox)(text, tile.width - 10, height, { font: `bold ${Math.round(0.85 * height)}px sans-serif`, style: 'black' });
                // Squeeze so that it fits inside
                const scale = Math.min((tile.width - 10) / image.width, (tile.height - 10) / image.height);
                const scaled = (0, util_1.resize)(image, { width: image.width * scale, height: image.height * scale });
                const outlined = (0, util_1.withOutline)(scaled, { expandCanvas: true, thickness: Math.round(tile.height / 90), style: '#f1f1f1' });
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
    const grid = (0, util_1.joinCanvasesAsEvenGrid)(tiles, { columns: 7 });
    let title = (0, util_1.withOutline)((0, text_1.getTextLabel)((_d = options === null || options === void 0 ? void 0 : options.title) !== null && _d !== void 0 ? _d : `Month ${month.toString()}`, { width: grid.width, height: TILE_HEIGHT, style: 'white' }), { style: 'black', thickness: 5 });
    const tbg = options === null || options === void 0 ? void 0 : options.titleBackground;
    if (tbg) {
        title = (0, util_1.withBackground)(title, tbg);
    }
    return (0, util_1.fillBackground)((0, util_1.joinCanvasesVertical)([title, grid], { align: 'center' }), { background: 'white' });
}
exports.renderCalendar = renderCalendar;
//# sourceMappingURL=graphs.js.map