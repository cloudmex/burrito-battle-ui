import *  as Near from '../src/Near.js';
import { Translate } from '../src/Language/Translate.js'

import connection from './Scenes/ConnectionScene.js'
import mainMenu from './Scenes/MainMenuScene.js';
import establo from './Scenes/EstabloScene.js';
import pradera from './Scenes/PraderaScene.js';
import howToPlay from './Scenes/HowToPlayScene.js';
import battle from './Scenes/BattleScene.js';
import silo from './Scenes/SiloScene.js'
import coliseo from './Scenes/ColiseoScene.js';
import coliseoBattle from './Scenes/ColiseoBattleScene.js';
import hospital from './Scenes/HospitalScene.js';


const config = {
    type: Phaser.AUTO,
    parent: 'gameContainer',
    audio: {
        disableWebAudio: true
    },
    scale:{
        parent: "gameContainer",
        mode: Phaser.Scale.CENTER_BOTH,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min:{
            width: 200,
            height: 120
        }, 
        max: {
            width: 1600,
            height: 960
        },
        zoom: 1
    },
    physics:{
        default: "arcade",
        arcade:{
            gravity:{
                y: 0
            },
            debug: window.location.origin.includes("localhost")   
        },
    },
    autorRound: false,
    width: 1920,
    height: 1080,
    mode: Phaser.Scale.NONE,
    scene: [ connection, mainMenu, establo, silo, pradera, howToPlay, battle, coliseo, coliseoBattle, hospital]
};

(async()=>await Translate.LoadJson())();
(async()=>await Near.Initialize())();

new Phaser.Game(config);