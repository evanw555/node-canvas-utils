import { Canvas, Image, createCanvas } from "canvas";
import { GraphPalette } from "./types";

/**
 * Resizes the provided canvas/image to the specified dimensions.
 * If only one dimension is specified, the aspect ratio will be locked and the other dimension will be inferred.
 * If no action is required, the provided image/canvas will be returned as-is, else a new canvas will be returned.
 * @param image The source canvas/image
 * @param options The specified width and/or height
 * @returns The provided image resized as a new canvas (or the original canvas/image if not resized)
 */
export function resize(image: Canvas | Image, options?: { width?: number, height?: number }): Canvas | Image {
    if (options?.width === undefined && options?.height === undefined) {
        throw new Error('Width and/or height must be specified when resizing');
    }
    if (options.width !== undefined && options.width <= 0) {
        throw new Error(`Expected positive width option but got ${options.width}`);
    }
    if (options.height !== undefined && options.height <= 0) {
        throw new Error(`Expected positive height option but got ${options.width}`);
    }

    // We know that if one of these is undefined, the other must be defined
    const WIDTH = options?.width ?? (options?.height as number * image.width / image.height);
    const HEIGHT = options?.height ?? (options?.width as number * image.height / image.width);

    // Optimization just in case no work needs to be done
    if (WIDTH === image.width && HEIGHT === image.height) {
        return image;
    }

    const canvas = createCanvas(WIDTH, HEIGHT);
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, WIDTH, HEIGHT);

    return canvas;
}

/**
 * Joins a list of canvases together horizontally.
 * @param canvases List of source canvases/images
 * @param options.align How to vertically align each source canvas (default align at top)
 * @param options.spacing How much spacing to add between each source canvas (default none)
 * @param options.maxWidth Maximum width of the resulting composite canvas, canvases will overlap to accomodate this (default infinite)
 */
export function joinCanvasesHorizontal(canvases: (Canvas | Image)[], options?: { align?: 'top' | 'bottom' | 'center' | 'resize-to-first' | 'resize-to-shortest' | 'resize-to-tallest', spacing?: number, maxWidth?: number }): Canvas {
    const ALIGN = options?.align ?? 'top';
    const SPACING = options?.spacing ?? 0;
    const MAX_WIDTH = options?.maxWidth ?? Number.MAX_SAFE_INTEGER;

    if (!canvases || canvases.length === 0) {
        throw new Error('Cannot join an empty list of canvases');
    }

    // First, find the target height if needed
    let targetHeight: number | undefined = undefined;
    if (ALIGN === 'resize-to-first') {
        targetHeight = canvases[0].height;
    } else if (ALIGN === 'resize-to-shortest') {
        targetHeight = Math.min(...canvases.map(c => c.height));
    } else if (ALIGN === 'resize-to-tallest') {
        targetHeight = Math.max(...canvases.map(c => c.height));
    }

    // Resize all canvases as needed
    const resizedCanvases = canvases.map(c => resize(c, { height: targetHeight ?? c.height }));

    // Prepare the composite canvas as per the resized canvas dimensions
    const IDEAL_WIDTH = resizedCanvases.map(c => c.width).reduce((a, b) => a + b) + SPACING * (resizedCanvases.length - 1);
    const WIDTH = Math.min(IDEAL_WIDTH, MAX_WIDTH);
    const LOST_WIDTH_PER_CANVAS = Math.ceil(Math.max(0, IDEAL_WIDTH - MAX_WIDTH) / Math.max(1, (canvases.length - 1)));
    const HEIGHT = Math.max(...resizedCanvases.map(c => c.height));
    const compositeCanvas = createCanvas(WIDTH, HEIGHT);
    const compositeContext = compositeCanvas.getContext('2d');

    let baseX = 0;
    for (const resizedCanvas of resizedCanvases) {
        // Draw the resized canvas at the proper vertical alignment
        let y: number;
        if (ALIGN === 'bottom') {
            y = HEIGHT - resizedCanvas.height;
        } else if (ALIGN === 'center') {
            y = (HEIGHT - resizedCanvas.height) / 2;
        } else {
            // Top or resize-aligned
            y = 0;
        }
        // Draw the canvas
        compositeContext.drawImage(resizedCanvas, baseX, y);
        // Advance the horizontal offset
        baseX += resizedCanvas.width + SPACING - LOST_WIDTH_PER_CANVAS;
    }

    return compositeCanvas;
}

/**
 * Joins a list of canvases together vertically.
 * @param canvases List of source canvases/images
 * @param options.align How to horizontally align each source canvas (default align on left)
 * @param options.spacing How much spacing to add between each source canvas (default none)
 * @param options.maxHeight Maximum height of the resulting composite canvas, canvases will overlap to accomodate this (default infinite)
 */
export function joinCanvasesVertical(canvases: (Canvas | Image)[], options?: { align?: 'left' | 'right' | 'center' | 'resize-to-first' | 'resize-to-thinnest' | 'resize-to-widest', spacing?: number, maxHeight?: number }): Canvas {
    const ALIGN = options?.align ?? 'left';
    const SPACING = options?.spacing ?? 0;
    const MAX_HEIGHT = options?.maxHeight ?? Number.MAX_SAFE_INTEGER;

    if (!canvases || canvases.length === 0) {
        throw new Error('Cannot join an empty list of canvases');
    }

    // First, find the target width if needed
    let targetWidth: number | undefined = undefined;
    if (ALIGN === 'resize-to-first') {
        targetWidth = canvases[0].width;
    } else if (ALIGN === 'resize-to-thinnest') {
        targetWidth = Math.min(...canvases.map(c => c.width));
    } else if (ALIGN === 'resize-to-widest') {
        targetWidth = Math.max(...canvases.map(c => c.width));
    }

    // Resize all canvases as needed
    const resizedCanvases = canvases.map(c => resize(c, { width: targetWidth ?? c.width }));

    // Prepare the composite canvas as per the resized canvas dimensions
    const WIDTH = Math.max(...resizedCanvases.map(c => c.width));
    const IDEAL_HEIGHT = resizedCanvases.map(c => c.height).reduce((a, b) => a + b) + SPACING * (resizedCanvases.length - 1);
    const HEIGHT = Math.min(IDEAL_HEIGHT, MAX_HEIGHT);
    const LOST_HEIGHT_PER_CANVAS = Math.ceil(Math.max(0, IDEAL_HEIGHT - MAX_HEIGHT) / Math.max(1, (canvases.length - 1)));
    const compositeCanvas = createCanvas(WIDTH, HEIGHT);
    const compositeContext = compositeCanvas.getContext('2d');

    let baseY = 0;
    for (const resizedCanvas of resizedCanvases) {
        // Draw the resized canvas at the proper horizontal alignment
        let x: number;
        if (ALIGN === 'right') {
            x = WIDTH - resizedCanvas.width;
        } else if (ALIGN === 'center') {
            x = (WIDTH - resizedCanvas.width) / 2;
        } else {
            // Left or resize-aligned
            x = 0;
        }
        compositeContext.drawImage(resizedCanvas, x, baseY);
        // Advance the vertical offset
        baseY += resizedCanvas.height + SPACING - LOST_HEIGHT_PER_CANVAS;
    }

    return compositeCanvas;
}

/**
 * Joins a list of canvases (or images) into an evenly-spaced grid.
 * Either the number of rows or columns may be specified or left to be computed automatically.
 * If neither dimension is specified, then the canvases will be joined into a square grid.
 * @param canvases List of source canvases/images
 * @param options.rows The desired number of rows
 * @param options.columns The desired number of columns
 * @returns The source canvases joined as a grid
 */
export function joinCanvasesAsEvenGrid(canvases: (Canvas | Image)[], options?: { rows?: number, columns?: number }): Canvas {
    if (!canvases || canvases.length === 0) {
        throw new Error('Cannot join an empty list of canvases');
    }

    const n = canvases.length;

    let rows: number;
    let columns: number;
    if (options?.rows === undefined) {
        columns = options?.columns ?? Math.round(Math.sqrt(n));
        rows = Math.ceil(n / columns);
    } else {
        rows = options?.rows;
        columns = options?.columns ?? Math.ceil(n / rows);
    }

    // Validate this math before anything else
    if (n > rows * columns) {
        throw new Error(`Cannot join ${n} canvas${n === 1 ? '' : 's'} into a ${rows}x${columns} grid`);
    }

    // Construct the canvas using the max width and height of all canvases
    const maxColumnWidth = Math.max(...canvases.map(c => c.width));
    const maxRowHeight = Math.max(...canvases.map(c => c.height));

    const canvas = createCanvas(maxColumnWidth * columns, maxRowHeight * rows);
    const context = canvas.getContext('2d');

    // Draw each canvas one by one
    for (let i = 0; i < n; i++) {
        const c = i % columns;
        const r = Math.floor(i / columns);
        const baseX = c * maxColumnWidth;
        const baseY = r * maxRowHeight;
        const canvas = canvases[i];
        const marginX = Math.floor((maxColumnWidth - canvas.width) / 2);
        const marginY = Math.floor((maxRowHeight - canvas.height) / 2);
        context.drawImage(canvas, baseX + marginX, baseY + marginY);
    }

    return canvas;
}

/**
 * Returns a new canvas containing the source canvas/image with added margins of a specified size (or sizes).
 * @param canvas The source image/canvas
 * @param margin Width of the margin for all four sides if numeric, else the width of each particular margin
 * @returns The source canvas with added margin as a new canvas
 */
export function withMargin(canvas: Canvas | Image, margin: number | { top?: number, left?: number, right?: number, bottom?: number }): Canvas {
    const TOP = (typeof margin === 'number') ? margin : (margin?.top ?? 0);
    const LEFT = (typeof margin === 'number') ? margin : (margin?.left ?? 0);
    const RIGHT = (typeof margin === 'number') ? margin : (margin?.right ?? 0);
    const BOTTOM = (typeof margin === 'number') ? margin : (margin?.bottom ?? 0);

    const WIDTH = canvas.width + LEFT + RIGHT;
    const HEIGHT = canvas.height + TOP + BOTTOM;

    // Create the expanded canvas expanded to fit all margins
    const expandedCanvas = createCanvas(WIDTH, HEIGHT);
    const context = expandedCanvas.getContext('2d');

    // Draw the source canvas inside all the margins
    context.drawImage(canvas, LEFT, TOP);

    return expandedCanvas;
}

/**
 * Given some source image, fills the background using the given palette's background color.
 * @param image Source image
 * @param palette Palette with a specified background style
 * @returns New canvas containing the source image with the desired background
 */
export function fillBackground(image: Image | Canvas, palette: Pick<GraphPalette, 'background'>): Canvas {
    const compositeCanvas = createCanvas(image.width, image.height);
    const compositeContext = compositeCanvas.getContext('2d');

    // Fill the background
    compositeContext.fillStyle = palette.background;
    compositeContext.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height);

    // Draw the original image
    compositeContext.drawImage(image, 0, 0);

    return compositeCanvas;
}

/**
 * Given some image/canvas, return a canvas of that image/canvas trimmed to a circle.
 * @param image The source image/canvas
 * @param options.alpha Optional alpha value of the returned circle
 * @returns The source image/canvas as a circle
 */
export function toCircle(image: Image | Canvas, options?: { alpha?: number }): Canvas {
    const canvas = createCanvas(image.width, image.height);
    const context = canvas.getContext('2d');

    // Set the global alpha
    context.globalAlpha = options?.alpha ?? 1;

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

/**
 * Given a source image and a mask image, return a new canvas including only the parts of the source image
 * that intersect with the provided mask. The mask will be stretched to the size of the source image, if needed.
 * @param image Source image (or canvas)
 * @param mask Mask image (or canvas)
 * @returns The source image with the mask applied
 */
export function applyMask(image: Canvas | Image, mask: Canvas | Image): Canvas {
    // Create a canvas in the size of the image
    const canvas = createCanvas(image.width, image.height);
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

/**
 * Given a style string and a mask image, return a new canvas including every part of the mask image
 * recolored to match the color specified in the style string.
 * @param style The style string (i.e. color)
 * @param mask Mask image (or canvas)
 * @returns The specified color in the shape of the mask image
 */
export function fillWithMask(style: string, mask: Canvas | Image): Canvas {
    // First, create a canvas containing only the provided color
    const canvas = createCanvas(mask.width, mask.height);
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

/**
 * Given a source image, return a new canvas with a drop shadow added to all visible parts of the source image.
 * @param image Source image
 * @param options.expandCanvas If true, a margin will be added on all sides to ensure the drop shadow fits. Else, the dimensions will remain the same.
 * @param options.alpha The opacity of the drop shadow (default 0.5)
 * @param options.angle The angle (in radians) of the drop shadow (default southeast)
 * @param options.distance the distance (in pixels) of the drop shadow (default 3)
 * @returns New canvas including the source image with an added drop shadow
 */
export function withDropShadow(image: Canvas | Image, options?: { expandCanvas?: boolean, alpha?: number, angle?: number, distance?: number }): Canvas {
    // We can draw a drop shadow by basically drawing an outline with the lowest quality possible
    return withOutline(image, {
        expandCanvas: options?.expandCanvas ?? false,
        style: `rgba(0,0,0,${options?.alpha ?? 0.5})`,
        thickness: options?.distance ?? 3,
        quality: 1,
        initialAngle: options?.alpha ?? (Math.PI * 1.75)
    });
}

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
export function withOutline(image: Canvas | Image, options?: { expandCanvas?: boolean, style?: string, thickness?: number, quality?: number, initialAngle?: number }): Canvas {
    // This function essentially applies a drop shadow many times to simulate an outline
    const expandCanvas = options?.expandCanvas ?? false;
    const style = options?.style ?? 'rgba(0,0,0,0.5)';
    const thickness = options?.thickness ?? 3;
    // For the default quality, only raise it by default if the image is large enough
    const quality = Math.max(1, options?.quality ?? (image.width >= 1000 ? 32 : 16));
    const initialAngle = options?.initialAngle ?? 0;

    const expansion = expandCanvas ? thickness : 0;

    const width = image.width + 2 * expansion;
    const height = image.height + 2 * expansion;

    const canvas = createCanvas(width, height);
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

/**
 * Given any number of source images, superimpose them onto one another in the order provided (last image will show up on top).
 * All images will be center-aligned and the output canvas will be sized to fit every image at its native resolution.
 * @param canvases Source images
 * @returns New canvas with all source images superimposed onto one another
 */
export function superimpose(canvases: (Canvas | Image)[], options?: { horizontalAlign?: 'center' | 'left' | 'right', verticalAlign?: 'center' | 'top' | 'bottom' }): Canvas {
    if (canvases.length === 0) {
        throw new Error('Cannot superimpose an empty list of source images');
    }
    const HORIZONTAL_ALIGN = options?.horizontalAlign ?? 'center';
    const VERTICAL_ALIGN = options?.verticalAlign ?? 'center';
    const WIDTH = Math.max(...canvases.map(c => c.width));
    const HEIGHT = Math.max(...canvases.map(c => c.height));
    const canvas = createCanvas(WIDTH, HEIGHT);
    const context = canvas.getContext('2d');

    // Draw each canvas in order centered on the canvas
    for (const c of canvases) {
        // Determine horizontal position
        let x: number;
        if (HORIZONTAL_ALIGN === 'center') {
            x = Math.round((WIDTH - c.width) / 2);
        } else if (HORIZONTAL_ALIGN === 'right') {
            x = WIDTH - c.width;
        } else {
            x = 0;
        }
        // Determine vertical position
        let y: number;
        if (VERTICAL_ALIGN === 'center') {
            y = Math.round((HEIGHT - c.height) / 2);
        } else if (VERTICAL_ALIGN === 'bottom') {
            y = HEIGHT - c.height;
        } else {
            y = 0;
        }
        // Draw the image
        context.drawImage(c, x, y);
    }

    return canvas;
}

/**
 * Given a source image, returns a new canvas containing the source image with its hue property updated.
 * @param image Source image
 * @param style Style string used to determine the new hue
 * @returns New canvas containing the hue-adjusted image
 */
export function setHue(image: Image | Canvas, style: string): Canvas {
    const canvas = createCanvas(image.width, image.height);
    const context = canvas.getContext('2d');

    context.drawImage(image, 0, 0);

    context.save();
    context.globalCompositeOperation = 'hue';
    context.fillStyle = style;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();

    return canvas;
}

/**
 * Returns the source image rotated to the specified angle.
 * @param image Source image/canvas
 * @param angle Angle (in radians) to rotate the image clockwise
 * @returns New canvas containing the rotated image
 */
export function getRotated(image: Image | Canvas, angle: number): Canvas {
    const canvas = createCanvas(image.width, image.height);
    const context = canvas.getContext('2d');

    context.save();
    // Set the origin to the middle of the canvas
    context.translate(canvas.width / 2,canvas.height / 2);
    // Adjust the context space to be rotated
    context.rotate(angle);
    // Draw the rotated image
    context.drawImage(image, Math.round(-image.width / 2), Math.round(-image.width / 2));
    context.restore();

    return canvas;
}

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
export function crop(image: Image | Canvas, options?: { x?: number, y?: number, width?: number, height?: number, horizontal?: 'left' | 'center' | 'right' | 'custom', vertical?: 'top' | 'center' | 'bottom' | 'custom'}): Canvas {
    const WIDTH = options?.width ?? image.width;
    const HEIGHT = options?.height ?? image.height;
    const HORIZONTAL = options?.horizontal ?? 'center';
    const VERTICAL = options?.vertical ?? 'center';

    const canvas = createCanvas(WIDTH, HEIGHT);
    const context = canvas.getContext('2d');

    let x = -(options?.x ?? 0);
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

    let y = -(options?.y ?? 0);
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

/**
 * Given a source image, crop such that all the specified points are still contained in the final image.
 * @param image Source image
 * @param points List of coordinates to preserve in the cropped image
 * @param options.margin Optional margin to add around all specified points (defaults to zero)
 * @returns New canvas containing the source image cropped around the specified points
 */
export function cropAroundPoints(image: Image | Canvas, points: { x: number, y: number }[], options?: { margin?: number }): Canvas {
    if (points.length === 0) {
        throw new Error('Cannot crop around no points!');
    }
    const leftX = Math.min(...points.map(p => p.x));
    const rightX = Math.max(...points.map(p => p.x));
    const topY = Math.min(...points.map(p => p.y));
    const bottomY = Math.max(...points.map(p => p.y));
    const margin = options?.margin ?? 0;

    return crop(image, {
        x: leftX - margin,
        y: topY - margin,
        width: rightX - leftX + 2 * margin,
        height: bottomY - topY + 2 * margin,
        horizontal: 'custom',
        vertical: 'custom'
    });
}

/**
 * Given a source image, crop it to a square while keeping it center-aligned.
 * @param image Source image
 * @returns New canvas containing the center-cropped image
 */
export function cropToSquare(image: Image | Canvas): Canvas {
    const MIN_DIMENSION = Math.min(image.width, image.height);
    return crop(image, { width: MIN_DIMENSION, height: MIN_DIMENSION, horizontal: 'center', vertical: 'center' });
}
