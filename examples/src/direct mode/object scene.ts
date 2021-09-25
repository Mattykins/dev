import { BackgroundColor, GlobalVar, Parent, WebGL } from '../../../../phaser-genesis/src/config';

import { FillTriangle } from '../../../../phaser-genesis/src/renderer/webgl1/draw/FillTriangle';
import { CreateGame } from '../../../../phaser-genesis/src/CreateGame';
import { IRenderPass } from '../../../../phaser-genesis/src/renderer/webgl1/renderpass/IRenderPass';
import { On } from '../../../../phaser-genesis/src/events/On';
import { Scenes } from '../../../../phaser-genesis/src/config'
import { StaticWorld } from '../../../../phaser-genesis/src/world/StaticWorld';
import { WorldPostRenderEvent } from '../../../../phaser-genesis/src/world/events';

const scene = {
    key: "main",
    create() {
        const world = new StaticWorld(this);
        On(world, WorldPostRenderEvent, (renderPass: IRenderPass) => {
            FillTriangle(renderPass, 100, 100, 100, 200, 200, 200, 0, 1, 0, 1);
        });
    }
}

CreateGame(
    WebGL(),
    Parent('gameParent'),
    GlobalVar('Phaser4'),
    BackgroundColor(0x2d2d2d),
    Scenes(scene)
)
