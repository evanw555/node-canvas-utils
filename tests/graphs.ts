import fs from 'fs';
import { expect } from 'chai';
import { createBarGraph, renderCalendar } from '../src/graphs';
import { joinCanvasesVertical } from '../src/util';
import { Canvas, loadImage } from 'canvas';
import { GraphPalette } from '../src/types';
import { getTextLabel } from '../src/text';

describe('Graph Util tests', () => {
    it('generates bar graphs', async () => {
        const otherPalette: GraphPalette = {
            background: 'black',
            text: 'yellow',
            highlight: 'red',
            padding: 'gray',
            lightPadding: 'white',
            darkPadding: 'green'
        };
        const graphs: Canvas[] = [];
        for (let i = 0; i < 5; i++) {
            const overrideColors = Math.random() < 0.4;
            const entries = ['One', 'Two', 'Three', 'Four', 'Five'].map(s => ({
                name: s,
                value: Math.random() * 20,
                icon: Math.random() < 0.5 ? getTextLabel('#') : graphs[i - 1],
                arrow: (Math.random() < 0.2 ? 'down' : (Math.random() < 0.4 ? 'up' : undefined)) as ('up' | 'down' | undefined),
                color: overrideColors ? (`rgb(${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)})`) : undefined
            }));
            const barGraph = await createBarGraph(entries, {
                title: `Test Bar Graph ${i + 1}`,
                subtitle: Math.random() < 0.25 ? 'Here it is!' : undefined,
                rowHeight: Math.random() < 0.5 ? (Math.floor(Math.random() * 50) + 10) : undefined,
                width: Math.random() < 0.5 ? (Math.floor(Math.random() * 400) + 150) : undefined,
                showNames: Math.random() < 0.25 ? false : undefined,
                showIcons: Math.random() < 0.25 ? false : undefined,
                palette: Math.random() < 0.25 ? otherPalette : undefined,
                decimalPrecision: Math.floor(Math.random() * 4)
            });
            graphs.push(barGraph);
        }
        const joined = joinCanvasesVertical(graphs);
        fs.writeFileSync('/tmp/node-canvas-utils/createBarGraph.png', joined.toBuffer());
        expect(fs.existsSync('/tmp/node-canvas-utils/createBarGraph.png')).is.true;
    });

    it('can render a calendar...', async () => {
        const calendar = renderCalendar(new Date(), {
            '15': await loadImage('assets/leaf.png'),
            '22': 'Bob\'s Birthday',
            '10/31': 'Halloween'
        }, {
            title: 'October 2026',
            titleBackground: await loadImage('assets/prestonpresents.png')
        });

        fs.writeFileSync('/tmp/node-canvas-utils/renderCalendar.png', calendar.toBuffer());
        expect(fs.existsSync('/tmp/node-canvas-utils/renderCalendar.png')).is.true;
    });
})
