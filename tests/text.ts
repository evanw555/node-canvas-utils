import fs from 'fs';
import { expect } from 'chai';
import { getTextBox } from '../src/text';
import { fillBackground } from '../src/util';

const lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur tincidunt et ante eget dictum. Pellentesque auctor magna purus, et tincidunt risus lobortis eu. Phasellus ut mi odio. Fusce tempor, justo in facilisis cursus, arcu augue tristique turpis, vel mollis libero nisl vel risus. Quisque lectus est, tincidunt non tempus nec, tristique at augue. Donec ut ex rhoncus, fermentum urna nec, consectetur turpis. Donec quis sagittis sem, vel ornare purus. Nulla sed nulla nisl. Sed vehicula sapien suscipit maximus hendrerit. Mauris ut erat quis leo ornare condimentum. Vivamus odio tellus, rutrum nec cursus quis, aliquet nec ligula. Nulla tincidunt cursus tellus, sed porttitor arcu malesuada sit amet. Integer non justo dapibus, suscipit quam eget, vulputate leo. In accumsan rhoncus eros, a euismod odio condimentum eget. Phasellus erat eros, eleifend sit amet quam ac, facilisis faucibus odio.';

describe('Canvas Text Util tests', () => {
    it('generates text boxes', () => {
        const textBox = fillBackground(getTextBox(lorem, 800, 32), { background: 'black' });
        fs.writeFileSync('/tmp/node-canvas-utils/getTextBox.png', textBox.toBuffer());
        expect(fs.existsSync('/tmp/node-canvas-utils/getTextBox.png')).is.true;
        const textBoxThin = fillBackground(getTextBox(lorem, 100, 32), { background: 'black' });
        fs.writeFileSync('/tmp/node-canvas-utils/getTextBoxThin.png', textBoxThin.toBuffer());
        expect(fs.existsSync('/tmp/node-canvas-utils/getTextBoxThin.png')).is.true;
    })
})
