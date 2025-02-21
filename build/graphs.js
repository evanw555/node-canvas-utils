"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBarGraph = void 0;
const canvas_1 = __importDefault(require("canvas"));
const constants_1 = require("./constants");
const text_1 = require("./text");
const util_1 = require("./util");
function createBarGraph(entries, options) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        const ROW_HEIGHT = (_a = options === null || options === void 0 ? void 0 : options.rowHeight) !== null && _a !== void 0 ? _a : 40;
        const WIDTH = (_b = options === null || options === void 0 ? void 0 : options.width) !== null && _b !== void 0 ? _b : 480;
        const SHOW_NAMES = (_c = options === null || options === void 0 ? void 0 : options.showNames) !== null && _c !== void 0 ? _c : true;
        const PALETTE = (_d = options === null || options === void 0 ? void 0 : options.palette) !== null && _d !== void 0 ? _d : constants_1.DEFAULT_GRAPH_PALETTE;
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
            try {
                image = yield canvas_1.default.loadImage(entry.imageUrl);
            }
            catch (err) {
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
            canvases.push((0, text_1.getTextLabel)(options === null || options === void 0 ? void 0 : options.title, WIDTH, ROW_HEIGHT, { align: 'center', style: PALETTE.text, margin: MARGIN }));
        }
        // If it has a subtitle, add it
        if (options === null || options === void 0 ? void 0 : options.subtitle) {
            canvases.push((0, text_1.getTextLabel)(options === null || options === void 0 ? void 0 : options.subtitle, WIDTH, Math.round(ROW_HEIGHT * 0.66), { align: 'center', style: PALETTE.text, margin: MARGIN }));
        }
        // Add the actual graph
        canvases.push(c);
        // Return all components joined with a background
        return (0, util_1.fillBackground)((0, util_1.joinCanvasesVertical)(canvases), PALETTE);
    });
}
exports.createBarGraph = createBarGraph;
//# sourceMappingURL=graphs.js.map