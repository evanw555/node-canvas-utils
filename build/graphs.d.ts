import { Canvas, Image } from 'canvas';
import { GraphPalette } from './types';
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
 * @returns New canvas containing the rendered bar graph
 */
export declare function createBarGraph(entries: {
    name: string;
    value: number;
    icon?: string | Canvas | Image;
    color?: string;
    arrow?: 'up' | 'down';
}[], options?: {
    showNames?: boolean;
    showIcons?: boolean;
    title?: string;
    subtitle?: string;
    rowHeight?: number;
    width?: number;
    palette?: GraphPalette;
}): Promise<Canvas>;
//# sourceMappingURL=graphs.d.ts.map