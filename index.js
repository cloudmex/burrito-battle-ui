// npx es-dev-server --node-resolve --watch

import * as Connection  from "./Scenes/ConnectScene.js";
import * as MainMenu from "./Scenes/MainMenuScene.js";
import * as MinarBurrito from "./Scenes/MinarBurrito.js";
import * as Pradera from "./Scenes/PraderaScene.js";
import * as Battle from "./Scenes/BattleScene.js";
import * as Establo from "./Scenes/EstabloScene.js";
import * as Coliseo from "./Scenes/ColiseoScene.js";
import * as ColiseoBattle from "./Scenes/ColiseoBattleScene.js";
import * as Hospital from "./Scenes/HospitalScene.js";

import * as NewMap from "./Scenes/NewMap.js";

const connection = Connection.Connection;
const mainMenu = MainMenu.MainMenu;
const newMap = NewMap.NewMap;
const minarBurrito = MinarBurrito.MinarBurrito;
const pradera = Pradera.Pradera;
const establo = Establo.Establo;
const battle = Battle.Battle;
const coliseo = Coliseo.Coliseo;
const coliseoBattle = ColiseoBattle.ColiseoBattle;
const hospital = Hospital.Hospital;


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
            debug: false,
            debugShowBody: true,
            debugShowStaticBody: true,
        },
    },
    autorRound: false,
    width: 1920,
    height: 1080,
    mode: Phaser.Scale.NONE,
    scene: [ connection, mainMenu, newMap, minarBurrito, pradera,  battle, establo, coliseo, coliseoBattle, hospital ]
};

const game = new Phaser.Game(config);