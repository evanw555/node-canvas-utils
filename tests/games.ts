import fs from 'fs';
import { expect } from 'chai';
import { Image, loadImage } from 'canvas';
import { createWheelOfFortuneTile, createWheelOfFortune } from '../src/games';

describe('Games Util tests', () => {
    it('generates wheel of fortune', async () => {
        const tile = createWheelOfFortuneTile('10', { tileStyle: 'black', textStyle: 'white' });
        fs.writeFileSync('/tmp/node-canvas-utils/createWheelOfFortuneTile.png', tile.toBuffer());
        expect(fs.existsSync('/tmp/node-canvas-utils/createWheelOfFortuneTile.png')).is.true;

        const tiles: { content: number | string | Image, fillStyle?: string, textStyle?: string }[] = [];
        for (let i = 0; i < 24; i++) {
            if (Math.random() < 0.8) {
                tiles.push({
                    content: Math.ceil(Math.random() * 10),
                    fillStyle: `hsl(${Math.round(Math.random() * 360)}, 50%, 50%)`
                });
            } else if (Math.random() < 0.5) {
                if (Math.random() < 0.5) {
                tiles.push({
                    content: 'BANKRUPT',
                    fillStyle: 'black',
                    textStyle: 'white'
                });
                } else {
                tiles.push({
                    content: 'LOSE TURN',
                    fillStyle: 'white',
                    textStyle: 'black'
                });
                }
            } else {
                tiles.push({
                    content: await loadImage('https://imgs.search.brave.com/ELTguMyjSd6zKNOfIoADDbMwDlTUjSuEbyozdFdSqUc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vai1NZWpL/dlgtd29jenM3LWVp/NV80anA2aFlpaVhC/ZURPWVl1Y0N5dnM3/ay9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTlq/Wkc0dS9jR2w0WVdK/aGVTNWpiMjB2L2NH/aHZkRzh2TWpBeE5p/OHgvTUM4d09DOHhP/Qzh6TkM5ai9ZVzFs/Y21FdE1UY3lOREk0/L05sODJOREF1Y0c1/bg')
                });
            }
        }

        const wheel = createWheelOfFortune(tiles);
        fs.writeFileSync('/tmp/node-canvas-utils/createWheelOfFortune.png', wheel.toBuffer());
        expect(fs.existsSync('/tmp/node-canvas-utils/createWheelOfFortune.png')).is.true;
    });
})
