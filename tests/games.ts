import fs from 'fs';
import { expect } from 'chai';
import { Canvas, Image, loadImage } from 'canvas';
import { createWheelOfFortuneTile, createWheelOfFortune } from '../src/games';
import { joinCanvasesHorizontal, joinCanvasesVertical } from '../src/util';

describe('Games Util tests', () => {
    it('generates wheel of fortune tiles', async () => {
        const rows: Canvas[] = [];

        const tiles: Canvas[] = [];
        for (let i = 3; i < 40; i++) {
            const tile = createWheelOfFortuneTile(10, { n: i, tileStyle: 'red', textStyle: 'white' });
            tiles.push(tile);
        }
    
        rows.push(joinCanvasesHorizontal(tiles));
        const tiles2: Canvas[] = [];
        for (let i = 3; i < 40; i++) {
            const tile = createWheelOfFortuneTile('LOSE TURN', { n: i, tileStyle: 'white', textStyle: 'black' });
            tiles2.push(tile);
        }
        rows.push(joinCanvasesHorizontal(tiles2));
    
        const icon = await loadImage('https://imgs.search.brave.com/ELTguMyjSd6zKNOfIoADDbMwDlTUjSuEbyozdFdSqUc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vai1NZWpL/dlgtd29jenM3LWVp/NV80anA2aFlpaVhC/ZURPWVl1Y0N5dnM3/ay9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTlq/Wkc0dS9jR2w0WVdK/aGVTNWpiMjB2L2NH/aHZkRzh2TWpBeE5p/OHgvTUM4d09DOHhP/Qzh6TkM5ai9ZVzFs/Y21FdE1UY3lOREk0/L05sODJOREF1Y0c1/bg');
        const tiles3: Canvas[] = [];
        for (let i = 3; i < 40; i++) {
            const tile = createWheelOfFortuneTile(icon, { n: i, tileStyle: 'blue', textStyle: 'white' });
            tiles3.push(tile);
        }
        rows.push(joinCanvasesHorizontal(tiles3));

        // For the final test, test recursive subtile creation
        const tiles4: Canvas[] = [];
        for (let i = 3; i < 40; i++) {
            const tile = createWheelOfFortuneTile([
                { content: 'BANKRUPT', fillStyle: 'black', textStyle: 'white' },
                { content: 100, fillStyle: 'green', textStyle: 'white' },
                { content: 'BANKRUPT', fillStyle: 'black', textStyle: 'white' }
            ], { n: i, tileStyle: 'blue', textStyle: 'white' });
            tiles4.push(tile);
        }
        rows.push(joinCanvasesHorizontal(tiles4));

        fs.writeFileSync('/tmp/node-canvas-utils/createWheelOfFortuneTile.png', joinCanvasesVertical(rows).toBuffer());
        expect(fs.existsSync('/tmp/node-canvas-utils/createWheelOfFortuneTile.png')).is.true;
    });

    it('generates a wheel of fortune', async () => {
        const icon = await loadImage('https://imgs.search.brave.com/ELTguMyjSd6zKNOfIoADDbMwDlTUjSuEbyozdFdSqUc/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWdz/LnNlYXJjaC5icmF2/ZS5jb20vai1NZWpL/dlgtd29jenM3LWVp/NV80anA2aFlpaVhC/ZURPWVl1Y0N5dnM3/ay9yczpmaXQ6NTAw/OjA6MDowL2c6Y2Uv/YUhSMGNITTZMeTlq/Wkc0dS9jR2w0WVdK/aGVTNWpiMjB2L2NH/aHZkRzh2TWpBeE5p/OHgvTUM4d09DOHhP/Qzh6TkM5ai9ZVzFs/Y21FdE1UY3lOREk0/L05sODJOREF1Y0c1/bg');
        const wheels: Canvas[] = [];
        for (let j = 4; j < 30; j += 3) {
            const tiles: any[] = [];
            for (let i = 0; i < j; i++) {
                const fillStyle = `hsl(${Math.floor((((i * 7)) % 20) * 360 / 20)}, 90%, 40%)`;
                if (Math.random() < 0.75) {
                    tiles.push({
                        content: Math.ceil(Math.random() * 10),
                        fillStyle
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
                } else if (Math.random() < 0.5) {
                    tiles.push({
                        content: [{
                            content: 'BANKRUPT',
                            fillStyle: 'black',
                            textStyle: 'white'
                        }, {
                            content: 500,
                            fillStyle: 'green',
                            textStyle: 'white'
                        }, {
                            content: 'BANKRUPT',
                            fillStyle: 'black',
                            textStyle: 'white'
                        }]
                    });
                } else {
                    tiles.push({
                        content: icon,
                        fillStyle
                    });
                }
            }

            wheels.push(createWheelOfFortune(tiles));
        }
        fs.writeFileSync('/tmp/node-canvas-utils/createWheelOfFortune.png', joinCanvasesVertical(wheels).toBuffer());
        expect(fs.existsSync('/tmp/node-canvas-utils/createWheelOfFortune.png')).is.true;
    });

    it('generates a roulette wheel', async () => {
        const wheels: Canvas[] = [];
        for (let j = 4; j < 30; j += 3) {
            const tiles: any[] = [];
            for (let i = 0; i < j; i++) {
                const fillStyle = `hsl(${Math.floor((((i * 7)) % 20) * 360 / 20)}, 90%, 40%)`;
                if (Math.random() < 0.75) {
                    tiles.push({
                        content: Math.ceil(Math.random() * 10),
                        fillStyle
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
                        content: [{
                            content: 'BANKRUPT',
                            fillStyle: 'black',
                            textStyle: 'white'
                        }, {
                            content: 500,
                            fillStyle: 'green',
                            textStyle: 'white'
                        }, {
                            content: 'BANKRUPT',
                            fillStyle: 'black',
                            textStyle: 'white'
                        }]
                    });
                }
            }

            wheels.push(createWheelOfFortune(tiles));
        }

        const wheel = createWheelOfFortune([{
            content: '0',
            fillStyle: 'green',
            horizontal: true
        }, {
            content: '28',
            fillStyle: 'black',
            horizontal: true
        }, {
            content: '9',
            fillStyle: 'red',
            horizontal: true
        }, {
            content: '26',
            fillStyle: 'black',
            horizontal: true
        }, {
            content: '30',
            fillStyle: 'red',
            horizontal: true
        }, {
            content: '11',
            fillStyle: 'black',
            horizontal: true
        }, {
            content: '7',
            fillStyle: 'red',
            horizontal: true
        }, {
            content: '20',
            fillStyle: 'black',
            horizontal: true
        }, {
            content: '32',
            fillStyle: 'red',
            horizontal: true
        }, {
            content: '17',
            fillStyle: 'black',
            horizontal: true
        }, {
            content: '5',
            fillStyle: 'red',
            horizontal: true
        }, {
            content: '22',
            fillStyle: 'black',
            horizontal: true
        }, {
            content: '34',
            fillStyle: 'red',
            horizontal: true
        }, {
            content: '15',
            fillStyle: 'black',
            horizontal: true
        }, {
            content: '3',
            fillStyle: 'red',
            horizontal: true
        }, {
            content: '24',
            fillStyle: 'black',
            horizontal: true
        }, {
            content: '36',
            fillStyle: 'red',
            horizontal: true
        }, {
            content: '13',
            fillStyle: 'black',
            horizontal: true
        }, {
            content: '1',
            fillStyle: 'red',
            horizontal: true
        }, {
            content: '00',
            fillStyle: 'green',
            horizontal: true
        }, {
            content: '27',
            fillStyle: 'red',
            horizontal: true
        }, {
            content: '10',
            fillStyle: 'black',
            horizontal: true
        }, {
            content: '25',
            fillStyle: 'red',
            horizontal: true
        }, {
            content: '29',
            fillStyle: 'black',
            horizontal: true
        }, {
            content: '12',
            fillStyle: 'red',
            horizontal: true
        }, {
            content: '8',
            fillStyle: 'black',
            horizontal: true
        }, {
            content: '19',
            fillStyle: 'red',
            horizontal: true
        }, {
            content: '31',
            fillStyle: 'black',
            horizontal: true
        }, {
            content: '18',
            fillStyle: 'red',
            horizontal: true
        }, {
            content: '6',
            fillStyle: 'black',
            horizontal: true
        }, {
            content: '21',
            fillStyle: 'red',
            horizontal: true
        }, {
            content: '33',
            fillStyle: 'black',
            horizontal: true
        }, {
            content: '16',
            fillStyle: 'red',
            horizontal: true
        }, {
            content: '4',
            fillStyle: 'black',
            horizontal: true
        }, {
            content: '23',
            fillStyle: 'red',
            horizontal: true
        }, {
            content: '35',
            fillStyle: 'black',
            horizontal: true
        }, {
            content: '14',
            fillStyle: 'red',
            horizontal: true
        }, {
            content: '2',
            fillStyle: 'black',
            horizontal: true
        }]);

        fs.writeFileSync('/tmp/node-canvas-utils/createRouletteWheel.png', wheel.toBuffer());
        expect(fs.existsSync('/tmp/node-canvas-utils/createRouletteWheel.png')).is.true;
    });
})
