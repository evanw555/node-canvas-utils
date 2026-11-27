import fs from 'fs';
import { expect } from 'chai';
import { getMarkdownTextLabel, getTextBox, getTextGrid, getTextLabel, getVerticalTextLabel } from '../src/text';
import { fillBackground, joinCanvasesVertical, loadImage2, resize, withBackground, withBorder } from '../src/util';
import { Canvas, loadImage } from 'canvas';

const lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur tincidunt et ante eget dictum. Pellentesque auctor magna purus, et tincidunt risus lobortis eu. Phasellus ut mi odio. Fusce tempor, justo in facilisis cursus, arcu augue tristique turpis, vel mollis libero nisl vel risus. Quisque lectus est, tincidunt non tempus nec, tristique at augue. Donec ut ex rhoncus, fermentum urna nec, consectetur turpis. Donec quis sagittis sem, vel ornare purus. Nulla sed nulla nisl. Sed vehicula sapien suscipit maximus hendrerit. Mauris ut erat quis leo ornare condimentum. Vivamus odio tellus, rutrum nec cursus quis, aliquet nec ligula. Nulla tincidunt cursus tellus, sed porttitor arcu malesuada sit amet. Integer non justo dapibus, suscipit quam eget, vulputate leo. In accumsan rhoncus eros, a euismod odio condimentum eget. Phasellus erat eros, eleifend sit amet quam ac, facilisis faucibus odio.';

describe('Text Util tests', () => {
    it('generates text labels', () => {
        const joined = joinCanvasesVertical([
            withBorder(getTextLabel('Hello, World!', { width: 256, height: 40 })),
            withBorder(getTextLabel('Hello, left!', { width: 256, height: 40, align: 'left' })),
            withBorder(getTextLabel('Hello, right!', { width: 256, height: 40, align: 'right' })),
            withBorder(getTextLabel('Hello, World! Please adjust to the correct width please please', { height: 40 })),
            withBorder(getTextLabel('Use auto-underline', { width: 1000, height: 50, underline: true })),
            withBorder(getTextLabel('Use auto-strikethrough', { width: 1000, height: 50, strikethrough: true })),
            withBorder(getTextLabel('Use overridden underline/strikethrough thickness', { width: 1000, height: 50, underline: 10, strikethrough: 5 })),
            withBorder(getTextLabel('Font is 60% of height', { height: 50, font: 'bold 30px sans-serif' })),
            withBorder(getTextLabel('Font is 70% of height', { height: 50, font: 'bold 35px sans-serif' })),
            withBorder(getTextLabel('Font is 80% of height', { height: 50, font: 'bold 40px sans-serif' })),
            withBorder(getTextLabel('Font is 90% of height', { height: 50, font: 'bold 45px sans-serif' })),
            withBorder(getTextLabel('Font is 90% of height (fit descent)', { height: 50, font: 'bold 45px sans-serif', fitDescent: true })),
            withBorder(getTextLabel('Font is 100% of height', { height: 50, font: 'bold 50px sans-serif' })),
            withBorder(getTextLabel('Font is 100% of height (fit descent)', { height: 50, font: 'bold 50px sans-serif', fitDescent: true })),
            withBorder(getTextLabel('Font is 110% of height', { height: 50, font: 'bold 55px sans-serif' })),
            withBorder(getTextLabel('ago', { height: 50, font: 'bold 50px sans-serif' }))
        ]);
        const final = withBackground(joined, 'gray');
        fs.writeFileSync('/tmp/node-canvas-utils/getTextLabel.png', final.toBuffer());
        expect(fs.existsSync('/tmp/node-canvas-utils/getTextLabel.png')).is.true;
    });

    it('generates markdown text labels', async () => {
        const final = withBackground(joinCanvasesVertical([
            await getMarkdownTextLabel('This one should be normal'),
            await getMarkdownTextLabel('It should be bold **here** and also **right here** but **not here'),
            await getMarkdownTextLabel('Italic _here_ and _right here_ and **bold here** but _not here'),
            await getMarkdownTextLabel('It **becomes bold _then also italic_ and back to bold** and finally nothing'),
            await getMarkdownTextLabel('It\'s ~~striken~~ but ~not here~ and ~~not here'),
            await getMarkdownTextLabel('It\'s __underlined__ but _not here_ and __not here'),
            await getMarkdownTextLabel('Testing emojis **👣 and 👑 and 🐦‍⬛** and <sample.png><sample.webp> and ✌🏻3️⃣*️⃣#️⃣🇺🇸', {
                inlineImages: { 
                    '<([^<>\\s]+)>': async (match: RegExpMatchArray) => await loadImage2(`assets/${match[1]}`)
                } 
            })
        ]), 'black');
        fs.writeFileSync('/tmp/node-canvas-utils/getMarkdownTextLabel.png', final.toBuffer());
        expect(fs.existsSync('/tmp/node-canvas-utils/getMarkdownTextLabel.png')).is.true;
    });

    it('generates vertical text labels', () => {
        const textBox = fillBackground(getVerticalTextLabel('Hello, World!', { height: 40, align: 'center', font: 'bold 40px serif' }), { background: 'gray' });
        fs.writeFileSync('/tmp/node-canvas-utils/getVerticalTextLabel.png', textBox.toBuffer());
        expect(fs.existsSync('/tmp/node-canvas-utils/getVerticalTextLabel.png')).is.true;
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
