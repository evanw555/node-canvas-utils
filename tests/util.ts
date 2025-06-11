import fs from 'fs';
import { getTextBox, getTextLabel } from '../src/text';
import { fillBackground, superimpose } from '../src/util';
import { expect } from 'chai';

const lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur tincidunt et ante eget dictum. Pellentesque auctor magna purus, et tincidunt risus lobortis eu. Phasellus ut mi odio. Fusce tempor, justo in facilisis cursus, arcu augue tristique turpis, vel mollis libero nisl vel risus. Quisque lectus est, tincidunt non tempus nec, tristique at augue. Donec ut ex rhoncus, fermentum urna nec, consectetur turpis. Donec quis sagittis sem, vel ornare purus. Nulla sed nulla nisl. Sed vehicula sapien suscipit maximus hendrerit. Mauris ut erat quis leo ornare condimentum. Vivamus odio tellus, rutrum nec cursus quis, aliquet nec ligula. Nulla tincidunt cursus tellus, sed porttitor arcu malesuada sit amet. Integer non justo dapibus, suscipit quam eget, vulputate leo. In accumsan rhoncus eros, a euismod odio condimentum eget. Phasellus erat eros, eleifend sit amet quam ac, facilisis faucibus odio.';

describe('General Util tests', () => {
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
});
