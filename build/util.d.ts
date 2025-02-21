import { Canvas, Image } from "canvas";
import { GraphPalette } from "./types";
/**
 * Resizes the provided canvas/image to the specified dimensions.
 * If only one dimension is specified, the aspect ratio will be locked and the other dimension will be inferred.
 * If no action is required, the provided image/canvas will be returned as-is, else a new canvas will be returned.
 * @param image The source canvas/image
 * @param options The specified width and/or height
 * @returns The provided image resized as a new canvas (or the original canvas/image if not resized)
 */
export declare function resize(image: Canvas | Image, options?: {
    width?: number;
    height?: number;
}): Canvas | Image;
/**
 * Joins a list of canvases together horizontally.
 */
export declare function joinCanvasesHorizontal(canvases: (Canvas | Image)[], options?: {
    align?: 'top' | 'bottom' | 'center' | 'resize-to-first' | 'resize-to-shortest' | 'resize-to-tallest';
    spacing?: number;
}): Canvas;
/**
 * Joins a list of canvases together vertically.
 */
export declare function joinCanvasesVertical(canvases: (Canvas | Image)[], options?: {
    align?: 'left' | 'right' | 'center' | 'resize-to-first' | 'resize-to-thinnest' | 'resize-to-widest';
    spacing?: number;
}): Canvas;
/**
 * Returns a new canvas containing the source canvas/image with added margins of a specified size (or sizes).
 * @param canvas The source image/canvas
 * @param margin Width of the margin for all four sides if numeric, else the width of each particular margin
 * @returns The source canvas with added margin as a new canvas
 */
export declare function withMargin(canvas: Canvas | Image, margin: number | {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
}): Canvas;
/**
 * Given some source image, fills the background using the given palette's background color.
 * @param image Source image
 * @param palette Palette with a specified background style
 * @returns New canvas containing the source image with the desired background
 */
export declare function fillBackground(image: Image | Canvas, palette: Pick<GraphPalette, 'background'>): Canvas;
/**
 * Given some image/canvas, return a canvas of that image/canvas trimmed to a circle.
 * @param image The source image/canvas
 * @param options.alpha Optional alpha value of the returned circle
 * @returns The source image/canvas as a circle
 */
export declare function toCircle(image: Image | Canvas, options?: {
    alpha?: number;
}): Canvas;
/**
 * Given a source image and a mask image, return a new canvas including only the parts of the source image
 * that intersect with the provided mask. The mask will be stretched to the size of the source image, if needed.
 * @param image Source image (or canvas)
 * @param mask Mask image (or canvas)
 * @returns The source image with the mask applied
 */
export declare function applyMask(image: Canvas | Image, mask: Canvas | Image): Canvas;
/**
 * Given a source image, return a new canvas with a drop shadow added to all visible parts of the source image.
 * @param image Source image
 * @param options.expandCanvas If true, a margin will be added on all sides to ensure the drop shadow fits. Else, the dimensions will remain the same.
 * @param options.alpha The opacity of the drop shadow (default 0.5)
 * @param options.angle The angle (in radians) of the drop shadow (default southeast)
 * @param options.distance the distance (in pixels) of the drop shadow (default 3)
 * @returns New canvas including the source image with an added drop shadow
 */
export declare function withDropShadow(image: Canvas | Image, options?: {
    expandCanvas?: boolean;
    alpha?: number;
    angle?: number;
    distance?: number;
}): Canvas;
/**
 * Given any number of source images, superimpose them onto one another in the order provided (last image will show up on top).
 * All images will be center-aligned and the output canvas will be sized to fit every image at its native resolution.
 * @param canvases Source images
 * @returns New canvas with all source images superimposed onto one another
 */
export declare function superimpose(canvases: (Canvas | Image)[]): Canvas;
/**
 * Given a source image, returns a new canvas containing the source image with its hue property updated.
 * @param image Source image
 * @param style Style string used to determine the new hue
 * @returns New canvas containing the hue-adjusted image
 */
export declare function setHue(image: Image | Canvas, style: string): Canvas;
/**
 * Returns the source image rotated to the specified angle.
 * @param image Source image/canvas
 * @param angle Angle (in radians) to rotate the image clockwise
 * @returns New canvas containing the rotated image
 */
export declare function getRotated(image: Image | Canvas, angle: number): Canvas;
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
export declare function crop(image: Image | Canvas, options?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    horizontal?: 'left' | 'center' | 'right' | 'custom';
    vertical?: 'top' | 'center' | 'bottom' | 'custom';
}): Canvas;
/**
 * Given a source image, crop such that all the specified points are still contained in the final image.
 * @param image Source image
 * @param points List of coordinates to preserve in the cropped image
 * @param options.margin Optional margin to add around all specified points (defaults to zero)
 * @returns New canvas containing the source image cropped around the specified points
 */
export declare function cropAroundPoints(image: Image | Canvas, points: {
    x: number;
    y: number;
}[], options?: {
    margin?: number;
}): Canvas;
/**
 * Given a source image, crop it to a square while keeping it center-aligned.
 * @param image Source image
 * @returns New canvas containing the center-cropped image
 */
export declare function cropToSquare(image: Image | Canvas): Canvas;
//# sourceMappingURL=util.d.ts.map