import fs from 'fs';
import { getTextBox, getTextLabel } from '../src/text';
import { applyMask, fillBackground, fillWithMask, joinCanvasesVertical, superimpose, withDropShadow, withOutline } from '../src/util';
import { expect } from 'chai';
import { Image, loadImage } from 'canvas';

const lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur tincidunt et ante eget dictum. Pellentesque auctor magna purus, et tincidunt risus lobortis eu. Phasellus ut mi odio. Fusce tempor, justo in facilisis cursus, arcu augue tristique turpis, vel mollis libero nisl vel risus. Quisque lectus est, tincidunt non tempus nec, tristique at augue. Donec ut ex rhoncus, fermentum urna nec, consectetur turpis. Donec quis sagittis sem, vel ornare purus. Nulla sed nulla nisl. Sed vehicula sapien suscipit maximus hendrerit. Mauris ut erat quis leo ornare condimentum. Vivamus odio tellus, rutrum nec cursus quis, aliquet nec ligula. Nulla tincidunt cursus tellus, sed porttitor arcu malesuada sit amet. Integer non justo dapibus, suscipit quam eget, vulputate leo. In accumsan rhoncus eros, a euismod odio condimentum eget. Phasellus erat eros, eleifend sit amet quam ac, facilisis faucibus odio.';

describe('General Util tests', () => {
    const maskHelloText = getTextLabel('Hello, World!', { width: 1000, height: 250, style: 'darkgreen', align: 'center' });
    let maskDice: Image;

    before(async () => {
        maskDice = await loadImage('assets/dice.png');
    });

    it('can superimpose images on top of each other', () => {
        const textBox = getTextBox(lorem, 800, 32);
        const smallTextBox = getTextBox(lorem, 400, 16);
        const centerText = getTextLabel('Center Me', { height: 48, style: 'red' });
        const topText = getTextLabel('I am on top', { height: 48, style: 'green' });
        const bottomRightText = getTextLabel('BottomRight', { height: 48, style: 'blue' });
        const smallestTextBox = getTextBox(lorem, 100, 12);
        const c1 = superimpose([textBox, smallTextBox, centerText]);
        const c2 = superimpose([c1, topText], { verticalAlign: 'top' });
        const c3 = superimpose([c2, bottomRightText], { verticalAlign: 'bottom', horizontalAlign: 'right' });
        const c4 = superimpose([c3, smallestTextBox], { verticalAlign: 'center', horizontalAlign: 'left' });
        const final = fillBackground(c4, { background: 'black' });
        fs.writeFileSync('/tmp/node-canvas-utils/superimpose.png', final.toBuffer());
        expect(fs.existsSync('/tmp/node-canvas-utils/superimpose.png')).is.true;
    });

    it('can apply a mask to an image', () => {
        const c1 = applyMask(maskDice, maskHelloText);
        const final = fillBackground(joinCanvasesVertical([c1]), { background: 'white' });
        fs.writeFileSync('/tmp/node-canvas-utils/applyMask.png', final.toBuffer());
        expect(fs.existsSync('/tmp/node-canvas-utils/applyMask.png')).is.true;
    });

    it('can fill colors with a mask', () => {
        const c1 = fillWithMask('blue', maskDice);
        const c2 = fillWithMask('rgba(200,0,0,0.5)', maskDice);
        const final = fillBackground(joinCanvasesVertical([maskDice, c1, c2]), { background: 'white' });
        fs.writeFileSync('/tmp/node-canvas-utils/fillWithMask.png', final.toBuffer());
        expect(fs.existsSync('/tmp/node-canvas-utils/fillWithMask.png')).is.true;
    });

    it('can draw drop shadows', () => {
        // Also, construct a background image to see if the drop shadow is really translucent
        const background = getTextLabel('~~~~~~~~~', { width: 1000, height: 250, style: 'darkred', align: 'center' });

        const c1 = withDropShadow(maskHelloText, { expandCanvas: true, distance: 5 });
        const c2 = withDropShadow(maskHelloText, { expandCanvas: true, distance: 10, angle: Math.PI * 0.66, alpha: 0.1 });
        const c3 = superimpose([
            background,
            withDropShadow(maskHelloText, { expandCanvas: true, distance: 5 })
        ]);
        const final = fillBackground(joinCanvasesVertical([c1, c2, c3]), { background: 'white' });
        fs.writeFileSync('/tmp/node-canvas-utils/withDropShadow.png', final.toBuffer());
        expect(fs.existsSync('/tmp/node-canvas-utils/withDropShadow.png')).is.true;
    });

    it('can draw outlines', () => {
        const c1 = withOutline(maskHelloText, { expandCanvas: true, thickness: 5, quality: 4 });
        const c2 = withOutline(maskHelloText, { expandCanvas: true, thickness: 10, quality: 4 });
        const c3 = withOutline(maskHelloText, { expandCanvas: true, thickness: 7, quality: 8 });
        const c4 = withOutline(maskHelloText, { expandCanvas: true, thickness: 7, quality: 16 });
        const c5 = withOutline(maskHelloText, { expandCanvas: true, thickness: 7, quality: 16, style: 'orange' });
        const c6 = withOutline(maskHelloText, { expandCanvas: true, thickness: 7, quality: 32, style: 'rgba(128,0,0,0.2)' });
        const c7 = withOutline(maskHelloText, { expandCanvas: true, thickness: 10, quality: 2, initialAngle: Math.PI * 0.66 });
        const c8 = withOutline(maskHelloText, { expandCanvas: true, thickness: 10, quality: 1, initialAngle: Math.PI * 1.75 });
        const c9 = withOutline(maskDice, { expandCanvas: true, thickness: 7, quality: 32 });
        const final = fillBackground(joinCanvasesVertical([c1, c2, c3, c4, c5, c6, c7, c8, c9]), { background: 'white' });
        fs.writeFileSync('/tmp/node-canvas-utils/withOutline.png', final.toBuffer());
        expect(fs.existsSync('/tmp/node-canvas-utils/withOutline.png')).is.true;
    });
});
