import { Button, Carousel } from '../Helpers/Helpers.js'
import *  as Near from '../Near.js';
import {Translate} from '../Language/Translate.js'

export default class HowToPlay extends Phaser.Scene{
    constructor(){
        super("HowToPlay");
    }
    preload(){
        this.load.image("image", '../src/assets/Images/Background.png');
        this.add.image(0,0, "mainMenubackground").setOrigin(0);
        this.load.image("left_arrow", '../src/assets/Images/Establo/left_arrow.png');
        this.load.image("right_arrow",  '../src/assets/Images/Establo/right_arrow.png');

        this.load.spritesheet("image_BuySTRW", "../src/assets/Images/HowToPlay/Buy STRW.png", {frameWidth: 600, frameHeight: 338})
        this.load.spritesheet("image_EvolveBurrito", "../src/assets/Images/HowToPlay/Evolve Burrito.png", {frameWidth: 600, frameHeight: 338})
        this.load.spritesheet("image_FightWithWildBurritos", "../src/assets/Images/HowToPlay/Fight with wild burritos.png", {frameWidth: 600, frameHeight: 338})
        this.load.spritesheet("image_MintBurrito", "../src/assets/Images/HowToPlay/Mint Burrito.png", {frameWidth: 600, frameHeight: 338})
        this.load.spritesheet("image_RestoreBurrito", "../src/assets/Images/HowToPlay/Restore Burrito.png", {frameWidth: 600, frameHeight: 338})
        this.load.spritesheet("image_SelectBurrito", "../src/assets/Images/HowToPlay/Select Burrito.png", {frameWidth: 600, frameHeight: 338})
        this.load.spritesheet("image_PlayIncursions", "../src/assets/Images/HowToPlay/Play Incursions.png", {frameWidth: 600, frameHeight: 338})

        
    }
    create(){
        new Button(this.sys.game.scale.gameSize.width / 2 + 750,  100, 0.5, "buttonContainer", Translate.Translate("BtnMainMenu"), this, ()=>{ this.scene.start("MainMenu");}, {fontSize: 30, fontFamily: "BangersRegular"});
        
        new Carousel(this, 
            [
                {
                    title: "HTP_Title_BuySTRW",
                    description: "HTP_Description_BuySTRW",
                    image: { 
                        img: "image_BuySTRW",
                        frames: 15
                    }
                },
                {
                    title: "HTP_Title_MintBurrito",
                    description: "HTP_Description_MintBurrito",
                    image: { 
                        img: "image_MintBurrito",
                        frames: 14
                    }
                },
                {
                    title: "HTP_Title_SelectBurrito",
                    description: "HTP_Description_SelectBurrito",
                    image: { 
                        img: "image_SelectBurrito",
                        frames: 7
                    }
                },
                {
                    title: "HTP_Title_FightWithWildBurritos",
                    description: "HTP_Description_FightWithWildBurritos",
                    image: { 
                        img: "image_FightWithWildBurritos",
                        frames: 13
                    }
                },
                {
                    title: "HTP_Title_PlayIncursion",
                    description: "HTP_Description_PlayIncursion",
                    image: { 
                        img: "image_PlayIncursions",//poner la de la incursion xd
                        frames: 11
                    }
                },
                {
                    title: "HTP_Title_RestoreBurrito",
                    description: "HTP_Description_RestoreBurrito",
                    image: { 
                        img: "image_RestoreBurrito",
                        frames: 14
                    }
                },
                {
                    title: "HTP_Title_EvolveBurrito",
                    description: "HTP_Description_EvolveBurrito",
                    image: { 
                        img: "image_EvolveBurrito",
                        width: 600,
                        height: 338,
                        frames: 10
                    }
                },
            ]
            );
    }
    Range(start, end) {
        return Array(end - start + 1).fill().map((_, idx) => start + idx);
    }
}