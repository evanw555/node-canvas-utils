import fs from 'fs';
import { getTextBox, getTextLabel } from '../src/text';
import { crop, resize, warpAlongX, withDropShadow, withOutline } from '../src/util';
import { expect } from 'chai';
import { Canvas, Image, createCanvas, loadImage, registerFont } from 'canvas';

// NOTE: These tests are for random things not directly related to any particular util in this library

describe('Misc tests', () => {
    // it('can preston presents...', async () => {
    //     const template = await loadImage('assets/prestonpresents.png');

    //     // Font must be registered before the canvas is created
    //     registerFont('assets/cinema.ttf', { family: 'cinema' });
    //     const canvas = createCanvas(template.width, template.height);
    //     const c = canvas.getContext('2d');

    //     // Draw the background template
    //     c.drawImage(template, 0, 0);

    //     const MARGIN = 25;

    //     const INNER_COLOR = '#dbdada';
    //     const ACCENT_COLOR = '#223c46';

    //     const outline = (x: Canvas | Image) => {
    //         return withDropShadow(withOutline(x, { thickness: 2, style: ACCENT_COLOR, expandCanvas: true }), { distance: 4, expandCanvas: true });
    //     };

    //     // Fetch the poster and draw on the wall
    //     let posterWidth = 0;
    //     const poster = await loadImage('assets/poster.png');
    //     const resized = resize(poster, { width: 190 });
    //     posterWidth = resized.width;
    //     const warped = warpAlongX(resized, {
    //         leftY: resized.height * 0.025,
    //         leftH: resized.height * 0.975,
    //         rightY: resized.height * 0,
    //         rightH: resized.height * 0.885
    //     });
    //     c.drawImage(outline(warped), MARGIN, Math.min(MARGIN, MARGIN + 128 - Math.round(resized.height / 2)));

    //     // Draw the content title text box
    //     const title = getTextBox('Return of the Planet of the Apes (2039)', canvas.width - posterWidth - 2 * MARGIN, 42, { align: 'center', font: '48px Cinema', style: INNER_COLOR });
    //     c.drawImage(outline(title), posterWidth + Math.round(1.5 * MARGIN), 70 + MARGIN - Math.round(title.height / 2));

    //     // Draw the "Preston Presents" text box at the bottom
    //     const flavorText1 = getTextLabel('Preston Presents:', { width: canvas.width, height: 54, align: 'center', font: 'italic 64px Cinema', style: INNER_COLOR });
    //     const flavorText2 = getTextLabel('This Week\'s Pick', { width: canvas.width, height: 118, align: 'center', font: 'italic 120px Cinema', style: INNER_COLOR });
    //     c.drawImage(outline(flavorText1), 0, canvas.height - flavorText2.height - flavorText1.height + 4);
    //     c.drawImage(outline(flavorText2), 0, canvas.height - flavorText2.height);

    //     // Outline the entire thing
    //     const final = withOutline(canvas, { thickness: 8, expandCanvas: true, style: ACCENT_COLOR });

    //     fs.writeFileSync('/tmp/node-canvas-utils/prestonpresents.png', final.toBuffer());
    //     expect(fs.existsSync('/tmp/node-canvas-utils/prestonpresents.png')).is.true;
    // });

    it('can preston presents face-off...', async () => {
        const template = crop(await loadImage('assets/prestonfaceoff.png'), { height: 550 });

        // Font must be registered before the canvas is created
        registerFont('assets/cinema.ttf', { family: 'cinema' });
        const canvas = createCanvas(template.width, template.height);
        const c = canvas.getContext('2d');

        // Draw the background template
        c.drawImage(template, 0, 0);

        const MARGIN = 15;

        const INNER_COLOR = '#dbdada';
        const ACCENT_COLOR = '#13151b';
        const LEFT_COLOR = '#aa1212';
        const RIGHT_COLOR = '#2f347c';

        const outline = (x: Canvas | Image, style: string, thickness: number = 2 ) => {
            return withDropShadow(withOutline(x, { thickness, style, expandCanvas: true }), { distance: 4, expandCanvas: true });
        };

        // Fetch the poster and draw on the wall
        let posterWidth = 0;
        const poster = await loadImage('assets/poster.png');
        const resized = resize(poster, { width: 180 });
        posterWidth = resized.width;
        // TODO: "cropping" is a hack for expanding the canvas, should probably have a proper util for this
        const expanded = resized.height < 256 ? crop(resized, { height: 256 }) : resized;
        const warpedLeft = outline(warpAlongX(expanded, {
            leftY: expanded.height * 0.01,
            leftH: expanded.height * 0.915,
            rightY: expanded.height * 0,
            rightH: expanded.height * 1
        }), LEFT_COLOR, 4);
        const warpedRight = outline(warpAlongX(expanded, {
            leftY: expanded.height * 0,
            leftH: expanded.height * 1,
            rightY: expanded.height * 0.01,
            rightH: expanded.height * 0.915
        }), RIGHT_COLOR, 4);
        const half = Math.round(canvas.width / 2);
        c.drawImage(warpedLeft, half - MARGIN / 2 - warpedLeft.width, Math.min(MARGIN, MARGIN + 128 - Math.round(warpedLeft.height / 2)));
        c.drawImage(warpedRight, half + MARGIN / 2, Math.min(MARGIN, MARGIN + 128 - Math.round(warpedRight.height / 2)));

        // Draw the content title text box
        const titleLeft = outline(getTextBox('Every Which Way But Dope (2045)', half - warpedLeft.width - 2.5 * MARGIN, 32, { align: 'center', font: '36px Cinema', style: INNER_COLOR }), LEFT_COLOR);
        const titleRight = outline(getTextBox('Return of the Planet of the Apes (2039)', half - warpedRight.width - 2.5 * MARGIN, 32, { align: 'center', font: '36px Cinema', style: INNER_COLOR }), RIGHT_COLOR);
        c.drawImage(titleLeft, Math.round(1 * MARGIN), 40 + MARGIN - Math.round(titleLeft.height / 2));
        c.drawImage(titleRight, canvas.width - MARGIN - titleRight.width, 40 + MARGIN - Math.round(titleRight.height / 2));

        // Draw the "Preston Presents" text box at the bottom
        const flavorText1 = outline(getTextLabel('Prestons Present...', { width: canvas.width, height: 54, align: 'center', font: '64px Cinema', style: INNER_COLOR }), ACCENT_COLOR);
        const flavorText2 = outline(getTextLabel('Kino Face Off', { width: canvas.width, height: 180, align: 'center', font: '192px Cinema', style: INNER_COLOR }), ACCENT_COLOR);
        c.drawImage(flavorText1, 0, canvas.height - flavorText2.height - flavorText1.height + 24);
        c.drawImage(flavorText2, 0, canvas.height - flavorText2.height);

        // Outline the entire thing
        const final = withOutline(canvas, { thickness: 8, expandCanvas: true, style: ACCENT_COLOR });

        fs.writeFileSync('/tmp/node-canvas-utils/prestonfaceoff.png', final.toBuffer());
        expect(fs.existsSync('/tmp/node-canvas-utils/prestonfaceoff.png')).is.true;
    });
});
