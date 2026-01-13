"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cropToSquare = exports.cropAroundPoints = exports.crop = exports.getRotated = exports.setHue = exports.superimpose = exports.withOutline = exports.withDropShadow = exports.fillWithMask = exports.applyMask = exports.toCircle = exports.fillBackground = exports.withMargin = exports.joinCanvasesVertical = exports.joinCanvasesHorizontal = exports.resize = void 0;
const canvas_1 = require("canvas");
/**
 * Resizes the provided canvas/image to the specified dimensions.
 * If only one dimension is specified, the aspect ratio will be locked and the other dimension will be inferred.
 * If no action is required, the provided image/canvas will be returned as-is, else a new canvas will be returned.
 * @param image The source canvas/image
 * @param options The specified width and/or height
 * @returns The provided image resized as a new canvas (or the original canvas/image if not resized)
 */
function resize(image, options) {
    var _a, _b;
    if ((options === null || options === void 0 ? void 0 : options.width) === undefined && (options === null || options === void 0 ? void 0 : options.height) === undefined) {
        throw new Error('Width and/or height must be specified when resizing');
    }
    if (options.width !== undefined && options.width <= 0) {
        throw new Error(`Expected positive width option but got ${options.width}`);
    }
    if (options.height !== undefined && options.height <= 0) {
        throw new Error(`Expected positive height option but got ${options.width}`);
    }
    // We know that if one of these is undefined, the other must be defined
    const WIDTH = (_a = options === null || options === void 0 ? void 0 : options.width) !== null && _a !== void 0 ? _a : ((options === null || options === void 0 ? void 0 : options.height) * image.width / image.height);
    const HEIGHT = (_b = options === null || options === void 0 ? void 0 : options.height) !== null && _b !== void 0 ? _b : ((options === null || options === void 0 ? void 0 : options.width) * image.height / image.width);
    // Optimization just in case no work needs to be done
    if (WIDTH === image.width && HEIGHT === image.height) {
        return image;
    }
    const canvas = (0, canvas_1.createCanvas)(WIDTH, HEIGHT);
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, WIDTH, HEIGHT);
    return canvas;
}
exports.resize = resize;
/**
 * Joins a list of canvases together horizontally.
 */
function joinCanvasesHorizontal(canvases, options) {
    var _a, _b;
    const ALIGN = (_a = options === null || options === void 0 ? void 0 : options.align) !== null && _a !== void 0 ? _a : 'top';
    const SPACING = (_b = options === null || options === void 0 ? void 0 : options.spacing) !== null && _b !== void 0 ? _b : 0;
    if (!canvases || canvases.length === 0) {
        throw new Error('Cannot join an empty list of canvases');
    }
    // First, find the target height if needed
    let targetHeight = undefined;
    if (ALIGN === 'resize-to-first') {
        targetHeight = canvases[0].height;
    }
    else if (ALIGN === 'resize-to-shortest') {
        targetHeight = Math.min(...canvases.map(c => c.height));
    }
    else if (ALIGN === 'resize-to-tallest') {
        targetHeight = Math.max(...canvases.map(c => c.height));
    }
    // Resize all canvases as needed
    const resizedCanvases = canvases.map(c => resize(c, { height: targetHeight !== null && targetHeight !== void 0 ? targetHeight : c.height }));
    // Prepare the composite canvas as per the resized canvas dimensions
    const WIDTH = resizedCanvases.map(c => c.width).reduce((a, b) => a + b) + SPACING * (resizedCanvases.length - 1);
    const HEIGHT = Math.max(...resizedCanvases.map(c => c.height));
    const compositeCanvas = (0, canvas_1.createCanvas)(WIDTH, HEIGHT);
    const compositeContext = compositeCanvas.getContext('2d');
    let baseX = 0;
    for (const resizedCanvas of resizedCanvases) {
        // Draw the resized canvas at the proper vertical alignment
        let y;
        if (ALIGN === 'bottom') {
            y = HEIGHT - resizedCanvas.height;
        }
        else if (ALIGN === 'center') {
            y = (HEIGHT - resizedCanvas.height) / 2;
        }
        else {
            // Top or resize-aligned
            y = 0;
        }
        compositeContext.drawImage(resizedCanvas, baseX, y);
        // Advance the horizontal offset
        baseX += resizedCanvas.width + SPACING;
    }
    return compositeCanvas;
}
exports.joinCanvasesHorizontal = joinCanvasesHorizontal;
/**
 * Joins a list of canvases together vertically.
 */
function joinCanvasesVertical(canvases, options) {
    var _a, _b;
    const ALIGN = (_a = options === null || options === void 0 ? void 0 : options.align) !== null && _a !== void 0 ? _a : 'left';
    const SPACING = (_b = options === null || options === void 0 ? void 0 : options.spacing) !== null && _b !== void 0 ? _b : 0;
    if (!canvases || canvases.length === 0) {
        throw new Error('Cannot join an empty list of canvases');
    }
    // First, find the target width if needed
    let targetWidth = undefined;
    if (ALIGN === 'resize-to-first') {
        targetWidth = canvases[0].width;
    }
    else if (ALIGN === 'resize-to-thinnest') {
        targetWidth = Math.min(...canvases.map(c => c.width));
    }
    else if (ALIGN === 'resize-to-widest') {
        targetWidth = Math.max(...canvases.map(c => c.width));
    }
    // Resize all canvases as needed
    const resizedCanvases = canvases.map(c => resize(c, { width: targetWidth !== null && targetWidth !== void 0 ? targetWidth : c.width }));
    // Prepare the composite canvas as per the resized canvas dimensions
    const WIDTH = Math.max(...resizedCanvases.map(c => c.width));
    const HEIGHT = resizedCanvases.map(c => c.height).reduce((a, b) => a + b) + SPACING * (resizedCanvases.length - 1);
    const compositeCanvas = (0, canvas_1.createCanvas)(WIDTH, HEIGHT);
    const compositeContext = compositeCanvas.getContext('2d');
    let baseY = 0;
    for (const resizedCanvas of resizedCanvases) {
        // Draw the resized canvas at the proper horizontal alignment
        let x;
        if (ALIGN === 'right') {
            x = WIDTH - resizedCanvas.width;
        }
        else if (ALIGN === 'center') {
            x = (WIDTH - resizedCanvas.width) / 2;
        }
        else {
            // Left or resize-aligned
            x = 0;
        }
        compositeContext.drawImage(resizedCanvas, x, baseY);
        // Advance the vertical offset
        baseY += resizedCanvas.height + SPACING;
    }
    return compositeCanvas;
}
exports.joinCanvasesVertical = joinCanvasesVertical;
/**
 * Returns a new canvas containing the source canvas/image with added margins of a specified size (or sizes).
 * @param canvas The source image/canvas
 * @param margin Width of the margin for all four sides if numeric, else the width of each particular margin
 * @returns The source canvas with added margin as a new canvas
 */
function withMargin(canvas, margin) {
    var _a, _b, _c, _d;
    const TOP = (typeof margin === 'number') ? margin : ((_a = margin === null || margin === void 0 ? void 0 : margin.top) !== null && _a !== void 0 ? _a : 0);
    const LEFT = (typeof margin === 'number') ? margin : ((_b = margin === null || margin === void 0 ? void 0 : margin.left) !== null && _b !== void 0 ? _b : 0);
    const RIGHT = (typeof margin === 'number') ? margin : ((_c = margin === null || margin === void 0 ? void 0 : margin.right) !== null && _c !== void 0 ? _c : 0);
    const BOTTOM = (typeof margin === 'number') ? margin : ((_d = margin === null || margin === void 0 ? void 0 : margin.bottom) !== null && _d !== void 0 ? _d : 0);
    const WIDTH = canvas.width + LEFT + RIGHT;
    const HEIGHT = canvas.height + TOP + BOTTOM;
    // Create the expanded canvas expanded to fit all margins
    const expandedCanvas = (0, canvas_1.createCanvas)(WIDTH, HEIGHT);
    const context = expandedCanvas.getContext('2d');
    // Draw the source canvas inside all the margins
    context.drawImage(canvas, LEFT, TOP);
    return expandedCanvas;
}
exports.withMargin = withMargin;
/**
 * Given some source image, fills the background using the given palette's background color.
 * @param image Source image
 * @param palette Palette with a specified background style
 * @returns New canvas containing the source image with the desired background
 */
function fillBackground(image, palette) {
    const compositeCanvas = (0, canvas_1.createCanvas)(image.width, image.height);
    const compositeContext = compositeCanvas.getContext('2d');
    // Fill the background
    compositeContext.fillStyle = palette.background;
    compositeContext.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height);
    // Draw the original image
    compositeContext.drawImage(image, 0, 0);
    return compositeCanvas;
}
exports.fillBackground = fillBackground;
/**
 * Given some image/canvas, return a canvas of that image/canvas trimmed to a circle.
 * @param image The source image/canvas
 * @param options.alpha Optional alpha value of the returned circle
 * @returns The source image/canvas as a circle
 */
function toCircle(image, options) {
    var _a;
    const canvas = (0, canvas_1.createCanvas)(image.width, image.height);
    const context = canvas.getContext('2d');
    // Set the global alpha
    context.globalAlpha = (_a = options === null || options === void 0 ? void 0 : options.alpha) !== null && _a !== void 0 ? _a : 1;
    // Save the context so we can undo the clipping region at a later time
    context.save();
    // Define the clipping region as an 360 degrees arc at point x and y
    const centerX = image.width / 2;
    const centerY = image.height / 2;
    const radius = Math.min(centerX, centerY);
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2, false);
    // Clip!
    context.clip();
    // Draw the image at imageX, imageY
    context.drawImage(image, centerX - radius, centerY - radius, radius * 2, radius * 2);
    // Restore the context to undo the clipping
    context.restore();
    context.globalAlpha = 1;
    return canvas;
}
exports.toCircle = toCircle;
/**
 * Given a source image and a mask image, return a new canvas including only the parts of the source image
 * that intersect with the provided mask. The mask will be stretched to the size of the source image, if needed.
 * @param image Source image (or canvas)
 * @param mask Mask image (or canvas)
 * @returns The source image with the mask applied
 */
function applyMask(image, mask) {
    // Create a canvas in the size of the image
    const canvas = (0, canvas_1.createCanvas)(image.width, image.height);
    const context = canvas.getContext('2d');
    // First, draw the image
    context.drawImage(image, 0, 0);
    // Then, apply the mask stretched to the image dimensions
    context.save();
    context.globalCompositeOperation = 'destination-in';
    context.drawImage(mask, 0, 0, image.width, image.height);
    context.restore();
    return canvas;
}
exports.applyMask = applyMask;
/**
 * Given a style string and a mask image, return a new canvas including every part of the mask image
 * recolored to match the color specified in the style string.
 * @param style The style string (i.e. color)
 * @param mask Mask image (or canvas)
 * @returns The specified color in the shape of the mask image
 */
function fillWithMask(style, mask) {
    // First, create a canvas containing only the provided color
    const canvas = (0, canvas_1.createCanvas)(mask.width, mask.height);
    const context = canvas.getContext('2d');
    context.fillStyle = style;
    context.fillRect(0, 0, canvas.width, canvas.height);
    // Then, apply the mask
    context.save();
    context.globalCompositeOperation = 'destination-in';
    context.drawImage(mask, 0, 0, canvas.width, canvas.height);
    context.restore();
    return canvas;
}
exports.fillWithMask = fillWithMask;
/**
 * Given a source image, return a new canvas with a drop shadow added to all visible parts of the source image.
 * @param image Source image
 * @param options.expandCanvas If true, a margin will be added on all sides to ensure the drop shadow fits. Else, the dimensions will remain the same.
 * @param options.alpha The opacity of the drop shadow (default 0.5)
 * @param options.angle The angle (in radians) of the drop shadow (default southeast)
 * @param options.distance the distance (in pixels) of the drop shadow (default 3)
 * @returns New canvas including the source image with an added drop shadow
 */
function withDropShadow(image, options) {
    var _a, _b, _c, _d;
    // We can draw a drop shadow by basically drawing an outline with the lowest quality possible
    return withOutline(image, {
        expandCanvas: (_a = options === null || options === void 0 ? void 0 : options.expandCanvas) !== null && _a !== void 0 ? _a : false,
        style: `rgba(0,0,0,${(_b = options === null || options === void 0 ? void 0 : options.alpha) !== null && _b !== void 0 ? _b : 0.5})`,
        thickness: (_c = options === null || options === void 0 ? void 0 : options.distance) !== null && _c !== void 0 ? _c : 3,
        quality: 1,
        initialAngle: (_d = options === null || options === void 0 ? void 0 : options.alpha) !== null && _d !== void 0 ? _d : (Math.PI * 1.75)
    });
}
exports.withDropShadow = withDropShadow;
/**
 * Given a source image, return a new canvas with an outline added around all visible parts of the source image.
 * @param image Source image
 * @param options.expandCanvas If true, a margin will be added on all sides to ensure the outline fits. Else, the dimensions will remain the same.
 * @param options.style The style (i.e. color) string of the outline (default half-transparent black)
 * @param options.thickness The thickness (in pixels) of the outline (default 3)
 * @param options.quality How many different angles to cover around the shape when drawing the outline (default 16 or 32 for larger images)
 * @param options.initialAngle The angle (in radians) to start drawing outlines from (default 0)
 * @returns New canvas including the source image with an added outline
 */
function withOutline(image, options) {
    var _a, _b, _c, _d, _e;
    // This function essentially applies a drop shadow many times to simulate an outline
    const expandCanvas = (_a = options === null || options === void 0 ? void 0 : options.expandCanvas) !== null && _a !== void 0 ? _a : false;
    const style = (_b = options === null || options === void 0 ? void 0 : options.style) !== null && _b !== void 0 ? _b : 'rgba(0,0,0,0.5)';
    const thickness = (_c = options === null || options === void 0 ? void 0 : options.thickness) !== null && _c !== void 0 ? _c : 3;
    // For the default quality, only raise it by default if the image is large enough
    const quality = Math.max(1, (_d = options === null || options === void 0 ? void 0 : options.quality) !== null && _d !== void 0 ? _d : (image.width >= 1000 ? 32 : 16));
    const initialAngle = (_e = options === null || options === void 0 ? void 0 : options.initialAngle) !== null && _e !== void 0 ? _e : 0;
    const expansion = expandCanvas ? thickness : 0;
    const width = image.width + 2 * expansion;
    const height = image.height + 2 * expansion;
    const canvas = (0, canvas_1.createCanvas)(width, height);
    const context = canvas.getContext('2d');
    context.save();
    // Use "source-out" to avoid writing to the same pixel multiple times (would affect alphas)
    // TODO: Doesn't seem to be working as expected, so come back to this later
    // context.globalCompositeOperation = 'source-out';
    // First, draw the source image offset multiple times around the center to create the outline mask
    for (let i = 0; i < quality; i++) {
        const angle = initialAngle + (i / quality) * 2 * Math.PI;
        const dx = thickness * Math.cos(angle);
        const dy = thickness * -Math.sin(angle);
        const shadowX = dx + expansion;
        const shadowY = dy + expansion;
        context.drawImage(image, shadowX, shadowY);
    }
    // Then, fill in the shadow where it intersets with the mask
    context.globalCompositeOperation = 'source-in';
    context.fillStyle = style;
    context.fillRect(0, 0, canvas.width, canvas.height);
    // Draw the source image on top
    context.restore();
    context.drawImage(image, expansion, expansion);
    return canvas;
}
exports.withOutline = withOutline;
/**
 * Given any number of source images, superimpose them onto one another in the order provided (last image will show up on top).
 * All images will be center-aligned and the output canvas will be sized to fit every image at its native resolution.
 * @param canvases Source images
 * @returns New canvas with all source images superimposed onto one another
 */
function superimpose(canvases, options) {
    var _a, _b;
    if (canvases.length === 0) {
        throw new Error('Cannot superimpose an empty list of source images');
    }
    const HORIZONTAL_ALIGN = (_a = options === null || options === void 0 ? void 0 : options.horizontalAlign) !== null && _a !== void 0 ? _a : 'center';
    const VERTICAL_ALIGN = (_b = options === null || options === void 0 ? void 0 : options.verticalAlign) !== null && _b !== void 0 ? _b : 'center';
    const WIDTH = Math.max(...canvases.map(c => c.width));
    const HEIGHT = Math.max(...canvases.map(c => c.height));
    const canvas = (0, canvas_1.createCanvas)(WIDTH, HEIGHT);
    const context = canvas.getContext('2d');
    // Draw each canvas in order centered on the canvas
    for (const c of canvases) {
        // Determine horizontal position
        let x;
        if (HORIZONTAL_ALIGN === 'center') {
            x = Math.round((WIDTH - c.width) / 2);
        }
        else if (HORIZONTAL_ALIGN === 'right') {
            x = WIDTH - c.width;
        }
        else {
            x = 0;
        }
        // Determine vertical position
        let y;
        if (VERTICAL_ALIGN === 'center') {
            y = Math.round((HEIGHT - c.height) / 2);
        }
        else if (VERTICAL_ALIGN === 'bottom') {
            y = HEIGHT - c.height;
        }
        else {
            y = 0;
        }
        // Draw the image
        context.drawImage(c, x, y);
    }
    return canvas;
}
exports.superimpose = superimpose;
/**
 * Given a source image, returns a new canvas containing the source image with its hue property updated.
 * @param image Source image
 * @param style Style string used to determine the new hue
 * @returns New canvas containing the hue-adjusted image
 */
function setHue(image, style) {
    const canvas = (0, canvas_1.createCanvas)(image.width, image.height);
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    context.save();
    context.globalCompositeOperation = 'hue';
    context.fillStyle = style;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();
    return canvas;
}
exports.setHue = setHue;
/**
 * Returns the source image rotated to the specified angle.
 * @param image Source image/canvas
 * @param angle Angle (in radians) to rotate the image clockwise
 * @returns New canvas containing the rotated image
 */
function getRotated(image, angle) {
    const canvas = (0, canvas_1.createCanvas)(image.width, image.height);
    const context = canvas.getContext('2d');
    context.save();
    // Set the origin to the middle of the canvas
    context.translate(canvas.width / 2, canvas.height / 2);
    // Adjust the context space to be rotated
    context.rotate(angle);
    // Draw the rotated image
    context.drawImage(image, Math.round(-image.width / 2), Math.round(-image.width / 2));
    context.restore();
    return canvas;
}
exports.getRotated = getRotated;
/**
 * Given a source image, returns a cropped form of that image.
 * @param image Source image
 * @param options.x Optional left-crop coordinate for custom horizontal alignments
 * @param options.y Optional top-crop coordinate for custom vertical alignments
 * @param options.width Optional new width to crop to (defaults to source width)
 * @param options.height Optional new height to crop to (default to source height)
 * @param options.horizontal Optional horizontal alignment mode (defaults to center)
 * @param options.vertical Optional vertical alignment mode (defaults to center)
 * @returns New canvas containing the cropped image
 */
function crop(image, options) {
    var _a, _b, _c, _d, _e, _f;
    const WIDTH = (_a = options === null || options === void 0 ? void 0 : options.width) !== null && _a !== void 0 ? _a : image.width;
    const HEIGHT = (_b = options === null || options === void 0 ? void 0 : options.height) !== null && _b !== void 0 ? _b : image.height;
    const HORIZONTAL = (_c = options === null || options === void 0 ? void 0 : options.horizontal) !== null && _c !== void 0 ? _c : 'center';
    const VERTICAL = (_d = options === null || options === void 0 ? void 0 : options.vertical) !== null && _d !== void 0 ? _d : 'center';
    const canvas = (0, canvas_1.createCanvas)(WIDTH, HEIGHT);
    const context = canvas.getContext('2d');
    let x = -((_e = options === null || options === void 0 ? void 0 : options.x) !== null && _e !== void 0 ? _e : 0);
    switch (HORIZONTAL) {
        case 'left':
            x = 0;
            break;
        case 'center':
            x = Math.round((WIDTH - image.width) / 2);
            break;
        case 'right':
            x = WIDTH - image.width;
            break;
        case 'custom':
            // Let override remain
            break;
    }
    let y = -((_f = options === null || options === void 0 ? void 0 : options.y) !== null && _f !== void 0 ? _f : 0);
    switch (VERTICAL) {
        case 'top':
            y = 0;
            break;
        case 'center':
            y = Math.round((HEIGHT - image.height) / 2);
            break;
        case 'bottom':
            y = HEIGHT - image.height;
            break;
        case 'custom':
            // Let override remain
            break;
    }
    context.drawImage(image, x, y);
    return canvas;
}
exports.crop = crop;
/**
 * Given a source image, crop such that all the specified points are still contained in the final image.
 * @param image Source image
 * @param points List of coordinates to preserve in the cropped image
 * @param options.margin Optional margin to add around all specified points (defaults to zero)
 * @returns New canvas containing the source image cropped around the specified points
 */
function cropAroundPoints(image, points, options) {
    var _a;
    if (points.length === 0) {
        throw new Error('Cannot crop around no points!');
    }
    const leftX = Math.min(...points.map(p => p.x));
    const rightX = Math.max(...points.map(p => p.x));
    const topY = Math.min(...points.map(p => p.y));
    const bottomY = Math.max(...points.map(p => p.y));
    const margin = (_a = options === null || options === void 0 ? void 0 : options.margin) !== null && _a !== void 0 ? _a : 0;
    return crop(image, {
        x: leftX - margin,
        y: topY - margin,
        width: rightX - leftX + 2 * margin,
        height: bottomY - topY + 2 * margin,
        horizontal: 'custom',
        vertical: 'custom'
    });
}
exports.cropAroundPoints = cropAroundPoints;
/**
 * Given a source image, crop it to a square while keeping it center-aligned.
 * @param image Source image
 * @returns New canvas containing the center-cropped image
 */
function cropToSquare(image) {
    const MIN_DIMENSION = Math.min(image.width, image.height);
    return crop(image, { width: MIN_DIMENSION, height: MIN_DIMENSION, horizontal: 'center', vertical: 'center' });
}
exports.cropToSquare = cropToSquare;
//# sourceMappingURL=util.js.map