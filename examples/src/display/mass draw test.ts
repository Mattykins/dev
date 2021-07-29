import { BackgroundColor, BatchSize, GlobalVar, Parent, Scenes, WebGL } from '../../../../phaser-genesis/src/config';

import { AddChild } from '../../../../phaser-genesis/src/display';
import { Between } from '../../../../phaser-genesis/src/math';
import { DrawImage } from '../../../../phaser-genesis/src/renderer/webgl1/draw';
import { Game } from '../../../../phaser-genesis/src/Game';
import { GetTexture } from '../../../../phaser-genesis/src/textures';
import { IRenderPass } from '../../../../phaser-genesis/src/renderer/webgl1/renderpass/IRenderPass';
import { ImageFile } from '../../../../phaser-genesis/src/loader/files/ImageFile';
import { On } from '../../../../phaser-genesis/src/events';
import { Scene } from '../../../../phaser-genesis/src/scenes/Scene';
import { Sprite } from '../../../../phaser-genesis/src/gameobjects';
import { StaticWorld } from '../../../../phaser-genesis/src/world/StaticWorld';
import { WorldPostRenderEvent } from '../../../../phaser-genesis/src/world/events';

class Carrot
{
    x: number;
    y: number;
    speed: number;

    constructor (x: number, y: number)
    {
        this.x = x;
        this.y = y;
        this.speed = Between(1, 8);
    }

    update (): void
    {
        this.x -= this.speed;

        if (this.x < -200)
        {
            this.x = 1000;
        }
    }
}

class Demo extends Scene
{
    constructor ()
    {
        super();

        this.create();
    }

    async create ()
    {
        await ImageFile('carrot', 'assets/1x1.png');

        const world = new StaticWorld(this);

        const sprites = [];

        const texture = GetTexture('carrot');

        for (let i = 0; i < 100000; i++)
        {
            const x = Between(-200, 1000);
            const y = Between(0, 600);

            sprites.push(new Carrot(x, y));
        }

        On(world, WorldPostRenderEvent, (renderPass: IRenderPass) => {

            sprites.forEach(sprite => {

                sprite.update();
                DrawImage(renderPass, texture, sprite.x, sprite.y);

            });

        });
    }
}

new Game(
    WebGL(),
    BatchSize(50000),
    Parent('gameParent'),
    GlobalVar('Phaser4'),
    BackgroundColor(0x0a0a0a),
    Scenes(Demo)
);
