import { BackgroundColor, GlobalVar, Parent, Scenes, WebGL } from '../../../../phaser-genesis/src/config';

import { AddChild } from '../../../../phaser-genesis/src/display/';
import { Between } from '../../../../phaser-genesis/src/math';
import { Game } from '../../../../phaser-genesis/src/Game';
import { ImageFile } from '../../../../phaser-genesis/src/loader/files/ImageFile';
import { Scene } from '../../../../phaser-genesis/src/scenes/Scene';
import { Sprite } from '../../../../phaser-genesis/src/gameobjects/';
import { StaticWorld } from '../../../../phaser-genesis/src/world/StaticWorld';

class Demo extends Scene
{
    constructor ()
    {
        super();

        this.create();
    }

    async create ()
    {
        await ImageFile('bg', 'assets/bubbles-background.png').load();
        await ImageFile('cream', 'assets/cream.png').load();
        await ImageFile('128', 'assets/128x128.png').load();
        await ImageFile('4', 'assets/4x4.png').load();
        await ImageFile('carrot', 'assets/carrot.png').load();

        const world = new StaticWorld(this);

        const bg = new Sprite(400, 300, 'bg');
        const cream = new Sprite(400, 300, 'cream');
        const test = new Sprite(800, 600, '128').setOrigin(1, 1);

        const brightness = 0.2;

        cream.color.useColorMatrix = true;
        cream.color.colorMatrix[0] = brightness;
        cream.color.colorMatrix[5] = brightness;
        cream.color.colorMatrix[10] = brightness;
        cream.color.colorMatrix[15] = 1;

        AddChild(world, bg);
        AddChild(world, cream);

        //  Should the children inherit the parent Color Matrix?
        for (let i = 0; i < 32; i++)
        {
            const x = Between(-300, 300);
            const y = Between(-300, 300);

            AddChild(cream, new Sprite(x, y, 'carrot'));
        }

        AddChild(world, test);

        for (let i = 0; i < 32; i++)
        {
            const x = Between(0, 128);
            const y = Between(0, 128);

            AddChild(test, new Sprite(-x, -y, '4'));
        }
    }
}

new Game(
    WebGL(),
    Parent('gameParent'),
    GlobalVar('Phaser4'),
    BackgroundColor(0x000000),
    Scenes(Demo)
);
