import fs from 'fs';
import { expect } from 'chai';
import { createBarGraph, createLineGraph, createPieChart, renderCalendar } from '../src/graphs';
import { crop, joinCanvasesAsEvenGrid, joinCanvasesVertical } from '../src/util';
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

    it('can render calendars', async () => {
        const calendar = renderCalendar(new Date(), {
            '15': { background: await loadImage('assets/sample.png'), foreground: await loadImage('assets/leaf.png') },
            '5': { text: 'Preston Presents...', background: (await loadImage('assets/prestonpresents.png')) },
            '22': { text: 'Bob\'s Birthday' },
            '23': { text: 'G3: Garret\'s Ghastly Gathering @6:00PM' },
            '24': { text: 'Bob had a grand crashout and puked all over someone\'s car and the rest was history' },
            '10/31': { text: 'Halloween' }
        }, {
            title: 'October 2026',
            titleBackground: await loadImage('assets/prestonpresents.png'),
            footer: 'This is a test calendar - Please say hello, world - Do not read this'
        });

        fs.writeFileSync('/tmp/node-canvas-utils/renderCalendar.png', calendar.toBuffer());
        expect(fs.existsSync('/tmp/node-canvas-utils/renderCalendar.png')).is.true;
    });

    it('can render line graphs', async () => {
        const data: { x: number, y: number }[] = [];
        for (let i = 0; i < 100; i++) {
            data.push({
                x: i + 1,
                y: 5 * Math.cos(i / 10) * ((Math.random() - 0.5) * 0.25 + Math.sin(i / 5))
            });
        }
        const graph = await createLineGraph(data, {
            title: 'Test Sine',
            x: {
                label: 'Time (seconds)',
                scale: 20,
                stringify: (value) => `${Math.floor(value / 60)}m${value % 60}s`
            },
            y: {
                label: 'Volume (dB)',
                scale: 1,
                stringify: (value) => value > 0 ? `+${parseFloat(value.toFixed(2)).toString()}` : parseFloat(value.toFixed(2)).toString()
            },
            showMin: true,
            showMax: true
        });

        fs.writeFileSync('/tmp/node-canvas-utils/createLineGraph.png', graph.toBuffer());
        expect(fs.existsSync('/tmp/node-canvas-utils/createLineGraph.png')).is.true;
    });

    it('can render pie charts', () => {
        const data: { value: number, label: string, style: string }[] = [];
        for (let i = 0; i < 20; i++) {
            data.push({
                value: Math.floor(Math.random() * 100) + 1,
                label: `#${i + 1}`,
                style: `rgb(${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)})`
            });
        }
        const final = joinCanvasesAsEvenGrid([
            createPieChart(data.slice(0, 1), { title: 'Just One', height: 128 }),
            createPieChart(data.slice(0, 2)),
            createPieChart(data.slice(0, 5)),
            createPieChart(data.slice(0, 10)),
            createPieChart(data.slice(0, 20), { title: 'All of Them', height: 64 }),
        ]);

        fs.writeFileSync('/tmp/node-canvas-utils/createPieChart.png', final.toBuffer());
        expect(fs.existsSync('/tmp/node-canvas-utils/createPieChart.png')).is.true;
    });
})
