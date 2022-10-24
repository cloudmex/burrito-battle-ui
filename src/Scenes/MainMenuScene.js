import { Button, Alert, LoadingScreen, SettingsButton, BattleEnd } from '../Helpers/Helpers.js'
import *  as Near from '../Near.js';
import {Translate} from '../Language/Translate.js'

export default class MainMenu extends Phaser.Scene{
    constructor(){
        super("MainMenu");
    }
    preload(){
        this.load.image("mainMenubackground", '../src/assets/Images/MainMenuScene/mainMenu_Background.png');

        this.load.spritesheet("engrane", '../src/assets/Images/MainMenuScene/Engranajes.webp', { frameWidth: 500, frameHeight:  468});
        this.load.image("options", '../src/assets/Images/MainMenuScene/Opciones.png');
        this.load.image("volume_on", '../src/assets/Images/MainMenuScene/volume_on.png');
        this.load.image("volume_off", '../src/assets/Images/MainMenuScene/volume_off.png');
        this.load.image("volume_handler", '../src/assets/Images/MainMenuScene/volume_handler.png');
        this.load.image("volume", '../src/assets/Images/MainMenuScene/volume.png');
        this.load.spritesheet("languages", '../src/assets/Images/MainMenuScene/Idiomas.webp', {frameWidth:1128, frameHeight: 455});
    }
    
    create(){
        this.load.once("complete", this.createScene, this);
        this.load.start();
    }
    async createScene(){
        this.sound.stopAll();
        this.sound.removeAll();
        Alert.isAlert = false;
        this.loadingScreen = new LoadingScreen(this);
        this.add.image(0,0, "mainMenubackground").setOrigin(0);
        this.add.image(50, 50, "logo").setOrigin(0).setScale(0.75);

        if(localStorage.getItem("lastScene")) {
            let lastScene = localStorage.getItem("lastScene");
            localStorage.removeItem("lastScene");
            this.scene.start(lastScene);
        } else {
            await Near.GetInfoByURL(); 
            let isInBattle = await Near.IsInBattle();
            if(isInBattle){
                await this.loadingScreen.OnComplete();
                await Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, Translate.Translate("TleBattleAlert"), Translate.Translate("MsgBattleAlert"), Translate.Translate("BtnKeepFighting"), Translate.Translate("BtnSurrender"))
                .then(async (result) =>{ 
                    if (result)
                        this.scene.start("Battle");
                    else{
                        localStorage.removeItem("burritoCPU");
                        await Near.SurrenderCpu();
                    }
                });
            }
            /*let isIncursion = await Near.IsInBattleIncursion();
            if(isIncursion){
                await Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, "Existe una incursion activa", "Tu burrito esta en una incursion activa, ¿Quieres ir al coliseo para continuar la incursion?", "Ir a la incursion", "Rendirse")
                .then(async (result) =>{ 
                    if (result)
                        this.scene.start("ColiseoBattle");
                    else{
                        //localStorage.removeItem("burritoCPU");
                        //await Near.SurrenderCpu();
                    }
                });
            }*/
        }

        new Button(this.sys.game.scale.gameSize.width -  290, 70, 0.5, "buttonContainer", Near.GetAccountId(), this,this.LogOut, {fontSize: 30, fontFamily: "BangersRegular"});
        new SettingsButton(1850, 60, this, 0.25, null);
        new Button(450, 600, 0.75, "buttonContainer", Translate.Translate("BtnGoMintBurrito"), this, ()=>{ this.ChangeScene("MinarBurrito")}, {fontSize: 60, fontFamily: "BangersRegular"});
        new Button(450, 750, 0.75, "buttonContainer", Translate.Translate("BtnMeadow"), this, ()=>{ this, this.ChangeScene("Pradera")}, {fontSize: 60, fontFamily: "BangersRegular"});
        new Button(450, 900, 0.75, "buttonContainer", Translate.Translate("BtnBarn"), this, ()=>{ this, this.ChangeScene("Establo")}, {fontSize: 60, fontFamily: "BangersRegular"});
        
        this.sound.add("acoustic-motivation", { loop: true, volume: SettingsButton.GetVolume()}).play();
        await this.loadingScreen.OnComplete();
    }
    
    LogOut = async () => {
        Alert.Fire(this, Translate.Translate("TleAccountAlert"), Translate.Translate("MsgAccountAlert"), Translate.Translate("BtnAccountAlert"), Translate.Translate("BtnCancelAlert"))
        .then((result) => {
            if(result) {
                localStorage.clear();
                Near.LogOut();
                this.scene.start('Connection');
            }
        });
    }
    ChangeScene (scene){ 
        if(!Alert.isAlert) 
            this.scene.start(scene)
    }
    
    Range(start, end) {
        return Array(end - start + 1).fill().map((_, idx) => start + idx);
    }
}