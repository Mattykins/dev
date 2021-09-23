import { BackgroundColor, GlobalVar, Parent, Scenes, WebGL } from '../../../../phaser-genesis/src/config';

import { AddChild } from '../../../../phaser-genesis/src/display';
import { Between } from '../../../../phaser-genesis/src/math/Between';
import { Game } from '../../../../phaser-genesis/src/Game';
import { GetRandom } from '../../../../phaser-genesis/src/utils/array/GetRandom';
import { GetSpritesWithTexture } from '../../../../phaser-genesis/src/textures/GetSpritesWithTexture';
import { ImageFile } from '../../../../phaser-genesis/src/loader/files/ImageFile';
import { Loader } from '../../../../phaser-genesis/src/loader/Loader';
import { Scene } from '../../../../phaser-genesis/src/scenes/Scene';
import { Sprite } from '../../../../phaser-genesis/src/gameobjects';
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
        const loader = new Loader();

        loader.add(
            ImageFile('disk', 'assets/items/disk1.png'),
            ImageFile('floppy', 'assets/items/floppy2.png'),
            ImageFile('tape', 'assets/items/tape3.png'),
            ImageFile('record', 'assets/items/record4.png'),
            ImageFile('flower', 'assets/items/flower5.png'),
            ImageFile('book', 'assets/items/book6.png')
        );

        await loader.start();

        const world = new StaticWorld(this);

        const frames = [ 'disk', 'floppy', 'tape', 'record', 'flower', 'book' ];

        for (let i = 0; i < 64; i++)
        {
            const x = Between(0, 800);
            const y = Between(0, 600);

            AddChild(world, new Sprite(x, y, GetRandom(frames)));
        }

        setTimeout(() => {
            
            const sprites = GetSpritesWithTexture('floppy');
            
            sprites.forEach(sprite =>
            {
                sprite.setScale(2);
            });

        }, 2000);
    }
}

new Game(
    WebGL(),
    Parent('gameParent'),
    GlobalVar('Phaser4'),
    BackgroundColor(0x2d2d2d),
    Scenes(Demo)
);
