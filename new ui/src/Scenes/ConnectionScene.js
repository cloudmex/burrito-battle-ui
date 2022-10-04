import *  as Near from '../Near.js';
import { Button, Alert, SettingsButton } from '../Helpers/Helpers.js'
import { Translate } from '../Language/Translate.js'

import loading_bg from '../assets/Images/loading_bg.png';
import loading_screen_1 from '../assets/Images/loading_screen_1.webp';
import loading_screen_2 from '../assets/Images/loading_screen_2.webp';

import logoImg from '../assets/Images/Logo.png';
import backgroundImg from '../assets/Images/ConnectionScene/connection_background.png';
import button from '../assets/Images/button.png'
import alertImg from '../assets/Images/Información 1.png'
import miniAlertImg from '../assets/Images/Informacion_small.png'

import acoustic_motivation from '../assets/audio/acoustic-motivation.ogg'
import button_hover from '../assets/audio/button-hover.ogg'
import button_click from '../assets/audio/button-click.ogg'

export default class Connection extends Phaser.Scene {
    constructor(){
        super("Connection");
    }
    preload(){
    }
    create () {
        this.load.image("loading_bg", loading_bg);
        this.load.spritesheet("loading_screen_1", loading_screen_1, { frameWidth: 720, frameHeight: 512 });
        this.load.spritesheet("loading_screen_2", loading_screen_2, { frameWidth: 512, frameHeight: 512 });
        
        this.load.image('logo', logoImg);
        this.load.image("buttonContainer", button);
        
        this.load.image('alert', alertImg);
        this.load.image("miniAlert", miniAlertImg);

        this.load.audio("acoustic-motivation", acoustic_motivation); 
        this.load.audio("button-hover", button_hover);
        this.load.audio("button-click", button_click);
        this.load.image('connection_background', backgroundImg);
        
        this.load.once("complete", this.start, this);
        this.load.start(); 
    }
      
    async start () {
        if(Near.IsConnected()){
            if(true)
                this.scene.start('MainMenu');
            else
                this.scene.start('Battle');
        }

        this.add.image(this.game.config.width / 2, this.game.config.height / 2, 'connection_background');
        this.add.image(0, 0, "logo").setScale(0.75).setPosition(this.game.config.width / 2, 150);
        new Button(this.sys.game.scale.gameSize.width / 2 + 350, this.sys.game.scale.gameSize.height - 150, 1, "buttonContainer", Translate.Translate("BtnConnect"), this, async () => {
            await Alert.Fire(this, Translate.Translate("TleConnectAlert"), Translate.Translate("MsgConnectAlert"), Translate.Translate("BtnConnectAlert"), Translate.Translate("BtnCancelAlert"))
            .then((result) =>{ 
                if (result)
                    localStorage.setItem("accessType", "safeMode");
                    Near.Login(); 
            });
        }, { fontSize: 56, fontFamily: "BangersRegular" });
        new Button(this.sys.game.scale.gameSize.width / 2 - 350, this.sys.game.scale.gameSize.height - 150, 1, "buttonContainer", Translate.Translate("BtnConnectFullAccess"), this, async () => {
            await Alert.Fire(this, Translate.Translate("TleConnectFullAccessAlert"), Translate.Translate("MsgConnectFullAccessAlert"), Translate.Translate("BtnConnectAlert"), Translate.Translate("BtnCancelAlert"))
            .then((result) =>{
                if (result)
                localStorage.setItem("accessType", "fullMode");
                    Near.LoginFullAccess(); 
            });
        }, { fontSize: 56, fontFamily: "BangersRegular" });

        this.sound.add("acoustic-motivation", { loop: true, volume: SettingsButton.GetVolume()}).play();
    }
}