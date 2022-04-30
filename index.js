// npx es-dev-server --node-resolve --watch
import * as Connection  from "./Scenes/ConnectScene.js";
import * as MainMenu from "./Scenes/MainMenuScene.js";
import * as MinarBurrito from "./Scenes/MinarBurrito.js";
import * as Pradera from "./Scenes/PraderaScene.js";
import * as Battle from "./Scenes/BattleScene.js";
import * as Establo from "./Scenes/EstabloScene.js";

const connection = Connection.Connection;
const mainMenu = MainMenu.MainMenu;
const minarBurrito = MinarBurrito.MinarBurrito;
const pradera = Pradera.Pradera;
const establo = Establo.Establo;
const battle = Battle.Battle;

const config = {
    type: Phaser.AUTO,
    parent: 'gameContainer',
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
            debug: true,
            debugShowBody: true,
            debugShowStaticBody: true,
        },
        matter: {
            debug: true,
            gravity: { y: 0.5 }
        }
    },
    autorRound: false,
    width: 1920,
    height: 1080,
    mode: Phaser.Scale.NONE,
    scene: [ connection, mainMenu, minarBurrito, pradera, battle, establo, ]
};

const game = new Phaser.Game(config);