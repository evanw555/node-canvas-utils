import fs from 'fs';
import { expect } from 'chai';
import { getTextBox, getTextGrid, getTextLabel } from '../src/text';
import { fillBackground, resize } from '../src/util';
import { Canvas } from 'canvas';

const lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur tincidunt et ante eget dictum. Pellentesque auctor magna purus, et tincidunt risus lobortis eu. Phasellus ut mi odio. Fusce tempor, justo in facilisis cursus, arcu augue tristique turpis, vel mollis libero nisl vel risus. Quisque lectus est, tincidunt non tempus nec, tristique at augue. Donec ut ex rhoncus, fermentum urna nec, consectetur turpis. Donec quis sagittis sem, vel ornare purus. Nulla sed nulla nisl. Sed vehicula sapien suscipit maximus hendrerit. Mauris ut erat quis leo ornare condimentum. Vivamus odio tellus, rutrum nec cursus quis, aliquet nec ligula. Nulla tincidunt cursus tellus, sed porttitor arcu malesuada sit amet. Integer non justo dapibus, suscipit quam eget, vulputate leo. In accumsan rhoncus eros, a euismod odio condimentum eget. Phasellus erat eros, eleifend sit amet quam ac, facilisis faucibus odio.';

describe('Canvas Text Util tests', () => {
    it('generates text labels', () => {
        const textBox = fillBackground(getTextLabel('Hello, World!', { width: 128, height: 20 }), { background: 'gray' });
        fs.writeFileSync('/tmp/node-canvas-utils/getTextLabel.png', textBox.toBuffer());
        expect(fs.existsSync('/tmp/node-canvas-utils/getTextLabel.png')).is.true;
        const textBoxAutoWidth = fillBackground(getTextLabel('Hello, World! Please adjust to the correct width please please', { height: 20 }), { background: 'gray' });
        fs.writeFileSync('/tmp/node-canvas-utils/getTextLabelAutoWidth.png', textBoxAutoWidth.toBuffer());
        expect(fs.existsSync('/tmp/node-canvas-utils/getTextLabelAutoWidth.png')).is.true;
    });

    it('generates text boxes', () => {
        const textBox = fillBackground(getTextBox(lorem, 800, 32), { background: 'black' });
        fs.writeFileSync('/tmp/node-canvas-utils/getTextBox.png', textBox.toBuffer());
        expect(fs.existsSync('/tmp/node-canvas-utils/getTextBox.png')).is.true;
        const textBoxThin = fillBackground(getTextBox(lorem, 100, 32), { background: 'black' });
        fs.writeFileSync('/tmp/node-canvas-utils/getTextBoxThin.png', textBoxThin.toBuffer());
        expect(fs.existsSync('/tmp/node-canvas-utils/getTextBoxThin.png')).is.true;
    });

    it('generates text grids', () => {
        const cells: { text: string, style?: string, font?: string }[][] = [];
        for (let r = 0; r < 20; r++) {
            cells.push([]);
            for (let c = 0; c < 5; c++) {
                cells[r][c] = {
                    // Random chance of no text to ensure it can handle cells with empty text
                    text: (Math.random() < 0.1) ? '' : lorem.split(' ')[Math.floor(Math.random() * 100)],
                    style: (r + c) % 3 === 0 ? 'green' : 'white',
                    font: (c === 0 ? '18px monospace' : (r % 2 === 0 ? 'italic bold 12px serif' : undefined))
                };
            }
        }
        const textGrid = fillBackground(getTextGrid(cells, { rowHeight: 32, spacing: 8 }), { background: 'black' });
        fs.writeFileSync('/tmp/node-canvas-utils/getTextGrid.png', textGrid.toBuffer());
        expect(fs.existsSync('/tmp/node-canvas-utils/getTextGrid.png')).is.true;
    });
})
