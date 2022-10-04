import { Button, Alert, LoadingScreen, SettingsButton, Card, TokenHud } from '../Helpers/Helpers.js'
import *  as Near from '../Near.js';
import {Translate} from '../Language/Translate.js'

import siloBackground from '../assets/Images/SiloScene/background.png'
import silo from '../assets/Images/SiloScene/Silo.webp'
import siloAnimation from '../assets/Images/SiloScene/Silo animacion.webp'
import nubes from '../assets/Images/SiloScene/Loop nubes.webp'
import tienda1 from '../assets/Images/SiloScene/Tienda1.png'
import tienda2 from '../assets/Images/SiloScene/Tienda2.png'
import burrito from '../assets/Images/SiloScene/Burrito.png'
import cofre from '../assets/Images/SiloScene/Cofre_abierto.webp'
import elements from '../assets/Images/SiloScene/Elements/Elementos.png'
import orbs from '../assets/Images/SiloScene/Orbs/orbs.png'

import tokenHud from '../assets/Images/HUD/Information.png'
import tokens from '../assets/Images/HUD/Tokens.png'

import Burrito_Relampago from '../assets/Images/Burritos/Burrito Relampago.png';
import Burrito_Planta from '../assets/Images/Burritos/Burrito Planta.png';
import Burrito_Fuego from '../assets/Images/Burritos/Burrito Fuego.png';
import Burrito_Agua from '../assets/Images/Burritos/Burrito Agua.png';
import cards from '../assets/Images/Cards/cards.png';

import alertImg from '../assets/Images/Información 1.png'
import miniAlertImg from '../assets/Images/Informacion_small.png'

export default class Silo extends Phaser.Scene{
    constructor(){
        super("MinarBurrito");
        this.sprites = [];
        this.contdown = false;
        this.canNavigate = true;
        this.isBigCard = false;
        this.alertVisible = false;
    }
    preload(){
        this.load.image("tokenHud", tokenHud);
        this.load.spritesheet("tokenIcon", tokens, {frameWidth: 49, frameHeight: 50});
        
        this.loadingScreen = new LoadingScreen(this);
    }
    create(){
        this.sound.stopAll();
        this.sound.removeAll();
        Alert.isAlert = false;
        this.LoadSpritesheet();  
    }
    LoadSpritesheet(){;
        this.load.image("mintBurritoBackground", siloBackground);
        this.load.image("silo", silo);
        this.load.spritesheet("Silo_start", siloAnimation, {frameWidth: 1920, frameHeight: 4000});
        this.load.image("clouds", nubes);
        this.load.spritesheet("cofre", cofre, {frameWidth: 1920, frameHeight: 1080})

        this.load.image("tienda1", tienda1);
        this.load.image("tienda2", tienda2);
        this.load.image("burrito", burrito);

        this.load.spritesheet("elements", elements, {frameWidth: 290, frameHeight: 290});
        this.load.spritesheet("orbs", orbs, {frameWidth: 218, frameHeight: 218 })

        this.load.image("QmULzZNvTGrRxEMvFVYPf1qaBc4tQtz6c3MVGgRNx36gAq", Burrito_Relampago);
        this.load.image("QmZEK32JEbJH3rQtXL9BqQJa2omXfpjuXGjbFXLiV2Ge9D", Burrito_Planta);
        this.load.image("QmQcTRnmdFhWa1j47JZAxr5CT1Cdr5AfqdhnrGpSdr28t6", Burrito_Fuego);
        this.load.image("QmbMS3P3gn2yivKDFvHSxYjVZEZrBdxyZtnnnJ62tVuSVk", Burrito_Agua);

        this.textures.remove("cards")
        this.load.spritesheet("cards", cards, {frameWidth: 1080, frameHeight: 1080});

        this.load.image('alert', alertImg);
        this.load.image("miniAlert", miniAlertImg);

        this.load.once("complete", this.Start, this);
        this.load.start();
    }
    async Start(){
        this.camera = this.cameras.main;
        this.camera.scrollY = 2920; 
        this.background = this.add.image(this.sys.game.scale.gameSize.width / 2, 0, "mintBurritoBackground").setOrigin(0.5, 0)
        this.clouds = this.add.tileSprite(0,0, this.sys.game.scale.gameSize.width, 2100, "clouds").setOrigin(0);
        this.silo = this.add.sprite(this.sys.game.scale.gameSize.width/2, this.sys.game.scale.gameSize.height/2 + 1500, "silo");
        this.isPrevScene = localStorage.getItem("prevScene") != null;
        localStorage.removeItem("prevScene");
        new Button(this.sys.game.scale.gameSize.width / 2 + 750,  100, 0.5, "buttonContainer", this.isPrevScene ? Translate.Translate("BtnBackToMeadow") : Translate.Translate("BtnMainMenu"), this, this.BackToMainMenu, {fontSize: 30, fontFamily: "BangersRegular"});
        this.hudTokens = new TokenHud(200, 200, this, await Near.GetCurrentNears(), await Near.GetSTRWToken());
        this.mintButton = new Button(this.sys.game.scale.gameSize.width / 2 + 300, this.sys.game.scale.gameSize.height - 75, 0.75, "buttonContainer", Translate.Translate("BtnMintBurrito"), this, this.ConfirmMint, {fontSize: 38, fontFamily: "BangersRegular"});
        this.barnButton = new Button(this.sys.game.scale.gameSize.width / 2 - 300, this.sys.game.scale.gameSize.height - 75, 0.75, "buttonContainer", Translate.Translate("BtnGoBarn"), this, this.GoToEstablo,  {fontSize: 40, fontFamily: "BangersRegular"});
        
        let remainToBuy = await Near.CanBuyTokens();
        await this.loadingScreen.OnComplete();
        this.burroTienda = this.add.sprite(180, this.sys.game.scale.gameSize.height + 2300, "burrito").setOrigin(0);
        this.tienda = this.add.sprite(50, this.sys.game.scale.gameSize.height + 2270, "tienda2").setOrigin(0);
        this.sign = this.add.text(257, this.sys.game.scale.gameSize.height + 2554, Translate.Translate("SignBuyStrw"), {fontSize: 20 , fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5, align: "center"}).setOrigin(0.5);
        if(remainToBuy == 0){
            this.comprarBtn = new Button(360,  this.sys.game.scale.gameSize.height + 2350, 0.25, "buttonContainer", Translate.Translate("BtnBuyStrw"), this, this.BuyTokens, {fontSize: 20, fontFamily: "BangersRegular"}, false)
        } else {
            this.burroTienda.destroy();
            this.sign.destroy();
            this.counterInterval = setInterval(() => {this.Contdown(remainToBuy) }, 1000);
            this.comprarBtn = null;
        }
        this.timeToBuy = this.add.text(260, this.sys.game.scale.gameSize.height + 2550, "", {fontSize: 26, fontFamily: "BangersRegular"}).setOrigin(0.5).setDepth(3);

        let info = await Near.GetInfoByURL();
        if(info != null){
            this.canNavigate = false;
            if(localStorage.getItem("action") == "mintBurrito"){
                this.MintBurrito(JSON.parse(info.receipts_outcome[5].outcome.logs[2]));
            } else if(localStorage.getItem("action") == "buyStraw"){
                this.GetTokens(info.receipts_outcome[0].outcome.logs[0]);
            }
            localStorage.removeItem("action");
            localStorage.removeItem("lastScene");
        }
        this.sound.add("acoustic-motivation", { loop: true, volume: SettingsButton.GetVolume()}).play();
    }
    update(){
        if(this.clouds == null || this.camera == null || this.background) return;
        let cursors = this.input.keyboard.createCursorKeys();
        this.clouds.tilePositionX += 1
        if(this.camera != null)
            this.camera.setBounds(0,0,this.background.displayWidth, this.background.displayHeight);

        if (cursors.up.isDown) this.cameras.main.scrollY -= 24;
        else if (cursors.down.isDown) this.cameras.main.scrollY += 24;
    }
    GoToEstablo = () =>{
        if(!this.canNavigate || Alert.isAlert) return;
        clearInterval(this.counterInterval);
        localStorage.removeItem("lastScene");
        this.scene.start("Establo");
    }
    BackToMainMenu = () =>{
        if(!this.canNavigate || Alert.isAlert) return;
        clearInterval(this.counterInterval);
        localStorage.removeItem("lastScene");
        this.scene.start(this.isPrevScene ? "Pradera" :"MainMenu");
    }
    Contdown(remainToBuy) {
        let timeNow = Date.now();
        let time = Math.abs(timeNow - remainToBuy) / 36e5;
        let hour = time;
        let minutes = (hour % 1) * 60;
        let seconds = (minutes % 1) * 60;
        if(remainToBuy != 0){
            this.contdown = true;
            this.timeToBuy.setText( Translate.Translate("SignAfterBuyStrw")+`\n${parseInt(hour).toString().padStart(2, '0')}:${parseInt(minutes).toString().padStart(2, '0')}:${parseInt(seconds).toString().padStart(2, '0')}`);
        } else if(this.contdown)
            location.reload();
    }
    Delay = (ms) => new Promise(res => setTimeout(res, ms));
    ConfirmMint = async () => {
        if(!this.canNavigate || Alert.isAlert)
            return;
        let currentSTRW = await Near.GetSTRWToken();
        await Alert.Fire(this, Translate.Translate("TleMintBurritoAlert"), (Translate.Translate("MsgMintBurritoAlert") + currentSTRW + " $STRW."), Translate.Translate("BtnMintBurritoAlert"), Translate.Translate("BtnCancelAlert"))
        .then(async(result) => { 
            if (result){
                if(currentSTRW >= 50000) {
                    if((await Near.GetCurrentNears()) >= 5){
                        this.canNavigate = false;
                        this.mintButton.GetComponents().visible = false;
                        this.barnButton.GetComponents().visible = false;
                        localStorage.setItem("action", "mintBurrito");
                        localStorage.setItem("lastScene", "MinarBurrito");
                        this.loadingScreen2 = new LoadingScreen(this);
                        await this.Delay(5000)
                        //let minar = JSON.parse('{"attack":"8","burrito_type":"Volador","defense":"7","description":"Este es un burrito de tipo Volador","global_win":"0","hp":"5","level":"1","media":"QmQcTRnmdFhWa1j47JZAxr5CT1Cdr5AfqdhnrGpSdr28t6","name":"Burrito Volador #81","owner_id":"jesusrobles.testnet","speed":"5","win":"0"}')
                        let minar = await Near.NFTMint();
                        this.hudTokens.UpdateTokens();
                        await this.loadingScreen2.OnComplete(); 
                        this.MintBurrito(minar);
                        localStorage.removeItem("action");
                        localStorage.removeItem("lastScene");
                    } else {
                        await Alert.Fire(this, null, Translate.Translate("DontHaveEnoughNearForMint"), Translate.Translate("BtnCancelAlert"))
                    }
                } else{
                    await Alert.Fire(this, null, Translate.Translate("DontHaveEnoughSTRWForMint"), Translate.Translate("BtnCancelAlert"))
                }
            }
        });
    }
    
    MintBurrito = async(minar) => {
        this.anims.create({
            key: "loop1",
            frameRate: 24,
            frames: this.anims.generateFrameNumbers("Silo_start", { frames: [
                0, 1, 2, 3, 4, 0, 1, 2, 3, 4,0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4,0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4,0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4,
                0, 1, 2, 3, 4, 0, 1, 2, 3, 4,0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4,0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4,0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0, 1, 2, 3, 4, 0,
                5, 6,
                7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 7, 8, 9, 10, 
                11, 12,
                13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 13, 14, 15, 16, 
                18, 19, 20, 21, 22 ,23
            ] }),
            repeat: 0
        });
        this.silo.play("loop1");
        let timeline = this.tweens.createTimeline();
        timeline.add({
            targets: this.cameras.main,
            scrollY: 1400,
            duration: 6000,
            delay: 1000,
            onComplete: ()=>{ this.time.delayedCall(1000, () => { 
                this.sprites.push(this.add.image(this.sys.game.scale.gameSize.width/2 + 60, this.sys.game.scale.gameSize.height/2 + 1500, "elements", this.GetElementFromType(minar.burrito_type)).setScale(0.5));
                }, [], this); }
        });
        timeline.add({
            targets: this.cameras.main,
            scrollY: 2200,
            duration: 3000,
            delay: 1000,
            onComplete: ()=>{ this.time.delayedCall(700, () => {
                this.sprites.push(this.add.image(this.sys.game.scale.gameSize.width/2 + 60, this.sys.game.scale.gameSize.height/2 + 2250, "orbs", this.GetStadistic(minar).index).setScale(0.5));
            }, [], this)}
        });
        
        timeline.add({
            targets: this.cameras.main,
            scrollY: 2920,
            duration: 3000,
            delay: 1000,
            onComplete: () => {
                this.time.delayedCall(300, () =>{ this.sprites.push((this.add.image(this.sys.game.scale.gameSize.width/2 + 60, this.sys.game.scale.gameSize.height/2 + 2990, minar.media).setScale(0.125))); }, [], this);
                this.time.delayedCall(2000, () =>{ this.GetCard(minar) }, [], this);
                this.isBigCard = true;
            }
        });
        timeline.play();
    }
    GetCard(minar){
        this.card = new Card(this.sys.game.scale.gameSize.width / 2, -1000, minar, this, false, false, false).GetComponents();
        this.card.setDepth(2);
        let timeline = this.tweens.createTimeline();
        timeline.add({
            targets: this.card,
            y: this.sys.game.scale.gameSize.height / 2 - 100,
            duration: 1500,
            rotation: 360 * 10 * Math.PI / 180, 
            onComplete: ()=> timeline.pause()
        });
        timeline.add({
            targets: this.card,
            y: -1000,
            duration: 1500
        });
        this.input.on("pointerdown", () =>{
            if(this.isBigCard){
                timeline.resume();
                this.sprites.forEach(s => s.destroy());
                this.isBigCard=false;
            }
        });
        timeline.play();
        this.mintButton.GetComponents().visible = true;
        this.barnButton.GetComponents().visible = true;
        this.canNavigate = true;
    }
    GetStadistic(burrito){
        let values = [parseInt(burrito.attack), parseInt(burrito.defense), parseInt(burrito.speed)];
        let max = Math.max.apply(Math, values);
        return { index: values.indexOf(max), value: max };
    }
    BuyTokens = async() => {
        if(!this.canNavigate || Alert.isAlert)
            return;
        let remain = await Near.CanBuyTokens();
        if(remain == 0){
            await Alert.Fire(this, Translate.Translate("TleBuyStrwAlert"), Translate.Translate("MsgBuyStrwAlert"), Translate.Translate("BtnBuyStrw"), Translate.Translate("BtnCancelAlert"))
            .then(async(result) =>{
                if (result){
                    if((await Near.GetCurrentNears()) >= 1){
                        this.canNavigate = false;
                        localStorage.setItem("action", "mintBurrito");
                        localStorage.setItem("lastScene", "MinarBurrito");
                        this.loadingScreen2 = new LoadingScreen(this);
                        await this.Delay(5000)
                        let tokens = parseInt(await Near.BuyTokens());
                        //let tokens = 10000_000_000_000_000_000_000_000_000;
                        await this.loadingScreen2.OnComplete();
                        this.GetTokens(tokens);
                        localStorage.removeItem("action");
                        localStorage.removeItem("lastScene");
                        this.burroTienda.destroy();
                        this.sign.destroy();
                    } else {
                        await Alert.Fire(this, null, Translate.Translate("DontHaveEnoughNearForBuyStraw"), Translate.Translate("BtnCancelAlert"));
                    }
                }
            });
        } else{
            await Alert.Fire(this, Translate.Translate("TleNoBuyStrwAlert"), Translate.Translate("MsgNoBuyStrwAlert"), Translate.Translate("BtnAccept"))
        }
    }
    async GetTokens (tokens) {
        this.canNavigate = false;
        if(this.comprarBtn != null){
            this.comprarBtn.GetComponents().destroy();
        }
        let animContainer = this.add.container(this.game.config.width/2, this.game.config.height / 2).setScrollFactor(0);
        animContainer.add(this.cofreAnimation = this.add.sprite(0, 0));
        this.anims.create({ key: "cofreAnimIn", frames: this.anims.generateFrameNumbers("cofre", { frames: this.Range(0, 38) }), frameRate: 24, repeat: 0 });
        this.anims.create({ key: "cofreAnim", frames: this.anims.generateFrameNumbers("cofre", { frames: this.Range(39, 58) }), frameRate: 24, repeat: 8 });
        this.anims.create({ key: "cofreAnimOut", frames: this.anims.generateFrameNumbers("cofre", { frames: this.Range(59, 64) }), frameRate: 24, repeat: 0 });
        this.cofreAnimation.play("cofreAnimIn")
        .once('animationcomplete', () => { 
            animContainer.add(this.add.text(0, -350, Translate.Translate("MsgBuyStrwCard"), {fontSize: 100, fontFamily: "BangersRegular"}).setOrigin(0.5));
            animContainer.add(this.add.text(0,  400, `${tokens} $STRW`, {fontSize: 100, fontFamily: "BangersRegular"}).setOrigin(0.5));
            this.cofreAnimation.play("cofreAnim").once('animationcomplete', () => { 
                this.cofreAnimation.play("cofreAnimOut").once('animationcomplete', async () => {
                    animContainer.destroy();
                    let remainToBuy = await Near.CanBuyTokens();
                    this.hudTokens.UpdateTokens();
                    this.tienda.setTexture("tienda2");
                    this.counterInterval = setInterval(() => {this.Contdown(remainToBuy) }, 1000);
                    this.canNavigate = true;
                })
            })
        });
    }
    Range = (start, end) => Array(end - start + 1).fill().map((_, idx) => start + idx);
    GetElementFromType(type){
        switch(type){
            case "Agua": return 0;
            case "Volador": return 1;
            case "Fuego": return 2;
            case "Planta": return 3;
            case "Eléctrico": return 4;
        }
    }
}