import { Button, Alert, LoadingScreen, SettingsButton, InfoCard, Card, TokenHud } from '../Helpers/Helpers.js'
import *  as Near from '../Near.js';
import {Translate} from '../Language/Translate.js'

export default class Establo extends Phaser.Scene{
    constructor(){
        super("Establo");
        this.counter = 0;
        this.canNavigate = true;
        this.canSelectCard = true;
        this.alertVisible = false;
    }
    preload(){
        this.sound.stopAll();
        this.sound.removeAll();
        
        this.load.image("establo_background", '../src/assets/Images/Establo/Background.webp');
        this.load.image("QmULzZNvTGrRxEMvFVYPf1qaBc4tQtz6c3MVGgRNx36gAq", '../src/assets/Images/Burritos/Burrito Relampago.png');
        this.load.image("QmZEK32JEbJH3rQtXL9BqQJa2omXfpjuXGjbFXLiV2Ge9D", '../src/assets/Images/Burritos/Burrito Planta.png');
        this.load.image("QmQcTRnmdFhWa1j47JZAxr5CT1Cdr5AfqdhnrGpSdr28t6", '../src/assets/Images/Burritos/Burrito Fuego.png');
        this.load.image("QmbMS3P3gn2yivKDFvHSxYjVZEZrBdxyZtnnnJ62tVuSVk", '../src/assets/Images/Burritos/Burrito Agua.png');

        this.load.image("burrito_muerto", '../src/assets/Images/Establo/gravestone.png');
        this.load.image("selected", '../src/assets/Images/Establo/selected.png')

        this.load.image("establo_ui", '../src/assets/Images/Establo/establo UI.png');
        this.textures.remove("cards")
        this.load.spritesheet("cards", '../src/assets/Images/Cards/blank_cards.png', {frameWidth: 1080, frameHeight: 1080});
        this.load.spritesheet("heart", '../src/assets/Images/Establo/vida.webp', {frameWidth: 150, frameHeight: 150 });
        this.load.spritesheet("level", '../src/assets/Images/Establo/nivel.webp', {frameWidth: 150, frameHeight: 150 });
        this.load.image("left_arrow", '../src/assets/Images/Establo/left_arrow.png');
        this.load.image("right_arrow",  '../src/assets/Images/Establo/right_arrow.png');
        this.load.image("tokenHud", '../src/assets/Images/HUD/Information.png');
        this.load.spritesheet("tokenIcon", '../src/assets/Images/HUD/Tokens.png', {frameWidth: 49, frameHeight: 50});
    }
    async create(){
        Alert.isAlert = false;
        this.loadingScreen = new LoadingScreen(this);
        this.add.image(this.sys.game.scale.gameSize.width / 2, this.sys.game.scale.gameSize.height / 2, "establo_background").setOrigin(0.5);
        this.add.image(this.sys.game.scale.gameSize.width / 2, this.sys.game.scale.gameSize.height / 2, "establo_ui").setOrigin(0.5);
        this.add.text(this.sys.game.scale.gameSize.width / 2 - 400, this.sys.game.scale.gameSize.height / 2 - 350, Translate.Translate("BtnBarn"), {fontSize: 100, fontFamily: "BangersRegular"}).setOrigin(0.5);
        this.isPrevScene = localStorage.getItem("prevScene") != null;
        localStorage.removeItem("prevScene");
        new Button(this.sys.game.scale.gameSize.width / 2 + 750,  100, 0.5, "buttonContainer", this.isPrevScene ? Translate.Translate("BtnBackToMeadow") : Translate.Translate("BtnMainMenu"), this, this.BackToMainMenu, {fontSize: 30, fontFamily: "BangersRegular"});
        new Button(this.sys.game.scale.gameSize.width / 2 - 845, this.sys.game.scale.gameSize.height / 2 + 100, 1, "left_arrow", null, this, ()=>{ this.Navigate(-1); }, {fontSize: 30, fontFamily: "BangersRegular"});
        new Button(this.sys.game.scale.gameSize.width / 2 + 55,  this.sys.game.scale.gameSize.height / 2 + 100, 1, "right_arrow", null, this, ()=>{ this.Navigate(1); }, {fontSize: 30, fontFamily: "BangersRegular"});
        new Button(this.sys.game.scale.gameSize.width / 2 - 385,  this.sys.game.scale.gameSize.height - 50, 0.5, "buttonContainer", Translate.Translate("BtnAcquireNewBurrito"), this, this.GoToSilo, {fontSize: 24, fontFamily: "BangersRegular"});
    
        this.cards = [];
        this.bigCard = null;
        this.info_bigCard = false;
        this.infoCard = null;
        this.canNavigate = true;
        this.totalTokens = await Near.NFTSupplyForOwner();

        this.hudTokens = new TokenHud(200, 200, this, await Near.GetCurrentNears(), await Near.GetSTRWToken());

        if((localStorage.getItem("counter") != null))
            this.counter = parseInt(localStorage.getItem("counter"));

        if(this.totalTokens == 0)
            this.add.text(this.sys.game.scale.gameSize.width / 2 - 400, this.sys.game.scale.gameSize.height / 2 + 100, Translate.Translate("MsgNotBurritos"), {fontSize: 50, fontFamily: "BangersRegular"}).setOrigin(0.5)
        else {
            this.SpawnCards();
            if(localStorage.getItem("last_burritoIndex") !== null)
                this.LastBigCard();
        }
        let info = await Near.GetInfoByURL();
        await this.loadingScreen.OnComplete();

        if(info != null){
            if(localStorage.getItem("action") == "evolve"){
                let value = JSON.parse(info.receipts_outcome[5].outcome.logs[0]);
                this.EvolveBurrito(value, value);
            } else if(localStorage.getItem("action") == "heal") {
                let value = JSON.parse(info.receipts_outcome[5].outcome.logs[1]);
                this.ResetBurrito(value, value);
            }
        }
        this.sound.add("acoustic-motivation", { loop: true, volume: SettingsButton.GetVolume()}).play();
        
    }
    BackToMainMenu = () => {
        localStorage.removeItem("lastScene");
        this.scene.start(this.isPrevScene ? "Pradera" :"MainMenu");
    }
    GoToSilo = () => this.scene.start("MinarBurrito");
    SetSelected = (_index) => {
        this.cards.forEach((element, index) => {
            element.setSelected(index == _index);
        });
    }
    SelectBurrito = async (burrito) =>{
        if(burrito.hp <= 0){
            await Alert.Fire(this, null, Translate.Translate("MsgNotLives"));
        } else{
            localStorage.setItem("burrito_selected", burrito.token_id);
            await Alert.Fire(this, null, Translate.Translate("MsgSelectBurrito"));
        }
    }
    ShowCard = (burrito, index) => {
        if(Alert.isAlert || !this.canSelectCard) return;
        localStorage.setItem("counter", this.counter);
        this.info_bigCard = false;
        
        if(this.bigCard != null)
            this.bigCard.GetComponents().destroy();
        if(this.buttonBigCard != null)
            this.buttonBigCard.GetComponents().destroy();
        if(this.buttonEvolve != null)
            this.buttonEvolve.GetComponents().destroy();

        this.bigCard = new Card(this.sys.game.scale.gameSize.width / 2 + 500, this.sys.game.scale.gameSize.height / 2 - 50, burrito, this, false, false, true, true).setScale(0.7).On( ()=>{ this.infoBigCard(burrito);});
        if(burrito.hp <= 0)
            this.buttonBigCard = new Button(this.sys.game.scale.gameSize.width / 2 + 680,  this.sys.game.scale.gameSize.height - 130, 0.5, "buttonContainer", Translate.Translate("BtnRestoreLives"), this, ()=>{ this.ConfirmarReset(burrito) }, {fontSize: 30, fontFamily: "BangersRegular"});
        else
            this.buttonBigCard = new Button(this.sys.game.scale.gameSize.width / 2 + 680,  this.sys.game.scale.gameSize.height - 130, 0.5, "buttonContainer", Translate.Translate("BtnSelectBurrito"), this, ()=>{ this.SelectBurrito(burrito); this.SetSelected(index);}, {fontSize: 28, fontFamily: "BangersRegular"});
        
        this.buttonEvolve = new Button(this.sys.game.scale.gameSize.width / 2 + 350,  this.sys.game.scale.gameSize.height - 130, 0.5, "buttonContainer", Translate.Translate("BtnLevelUp"), this, ()=>{ this.ConfirmarEvolve(burrito) }, {fontSize: 30, fontFamily: "BangersRegular"});
        localStorage.setItem("last_burritoIndex", burrito.token_id);
    }
    ConfirmarReset = async(burrito) =>{
        let currentSTRW = await Near.GetSTRWToken();
        await Alert.Fire(this, Translate.Translate("BtnRestoreLives"), Translate.Translate("MsgRestoreLivesAlert") + currentSTRW +" $STRW.", Translate.Translate("BtnRestore"), Translate.Translate("BtnCancelAlert"))
        .then(async(result) =>{ 
            if (result) {
                if(currentSTRW >= 30000 && (await Near.GetCurrentNears()) >= 1){
                    this.canSelectCard = false;
                    this.loadingScreen = new LoadingScreen(this);
                    localStorage.setItem("action", "heal");
                    localStorage.setItem("lastScene", "Establo");
                    this.ResetBurrito(burrito);
                } else {
                    await Alert.Fire(this, null, Translate.Translate("NotEnoughForRecover"), Translate.Translate("BtnCancelAlert"));
                }
            }
        });
    }
    ResetBurrito = async (burrito, newBurrito = null) =>{
        let id;
        if(newBurrito == null) {
            id = burrito.token_id;
            newBurrito = await Near.ResetBurrito(burrito.token_id);
            this.hudTokens.UpdateTokens();
            await this.loadingScreen.OnComplete();
        } else 
            id = burrito.name.split('#')[1];
        localStorage.removeItem("action");
        localStorage.removeItem("lastScene");
        this.cards.forEach((card, index) => {
            if(card.Card.burrito.token_id == id) {
                this.SpawnCards();
                //this.cards[index].Card.burrito = newBurrito; 
                this.bigCard.RecoverHealth(newBurrito);
                card.RecoverHealth(newBurrito);
            }
        });
        this.canSelectCard = true;
    }
    ConfirmarEvolve = async(burrito) =>{
        let currentSTRW = await Near.GetSTRWToken();
        if(burrito.win < 10)
            await Alert.Fire(this, null, Translate.Translate("MsgLevelUp"));
        else {
            await Alert.Fire(this, Translate.Translate("TleEvolveAlert"), Translate.Translate("MsgEvolveAlert") + currentSTRW + " $STRW.", Translate.Translate("BtnEvolve"), Translate.Translate("BtnCancelAlert"))
            .then(async(result) =>{ 
                if(result){
                    if(currentSTRW >= 50000 && (await Near.GetCurrentNears()) >= 2){
                        this.loadingScreen = new LoadingScreen(this);
                        localStorage.setItem("action", "evolve");
                        localStorage.setItem("lastScene", "Establo");
                        this.EvolveBurrito(burrito);
                    } else {
                        await Alert.Fire(this, null, Translate.Translate("NotEnoughForEvolve"), Translate.Translate("BtnCancelAlert"));
                    }
                }
            });
        }
    }
    EvolveBurrito = async (burrito, newBurrito = null)=> {
        this.canSelectCard = false;
        let id;
        if(newBurrito == null){
            id = burrito.token_id;
            newBurrito = await Near.EvolveBurrito(burrito.token_id); //burrito.token_id;
            this.hudTokens.UpdateTokens();
            await this.loadingScreen.OnComplete();
        } else
            id = burrito.name.split('#')[1];
        localStorage.removeItem("action");
        localStorage.removeItem("lastScene");
        this.cards.forEach((card, index) => {
            if(card.Card.burrito.token_id == id) {
                //this.cards[index].Card.burrito = newBurrito; 
                this.SpawnCards();
                this.bigCard.ResetLevel(newBurrito);
                card.ResetLevel(newBurrito);
            }
        });
        this.canSelectCard = true;
    }

    infoBigCard(burrito){
        if(this.info_bigCard == false){
            this.infoCard = new InfoCard(this.sys.game.scale.gameSize.width / 2 + 490, this.sys.game.scale.gameSize.height / 2 - 50, burrito, this).setScale(0.7);
            this.bigCard.PointerOver();
            this.info_bigCard = true;
        }else{
            this.bigCard.PointerOut();
            this.info_bigCard = false;
            const components = this.bigCard.GetComponents().list
            components[1].visible = true;
            for (const item of components)
                if(item.type === "Text")
                    item.visible = true;
                this.infoCard.GetComponents().destroy();
        }
    }
    SpawnCards = async() => {
        let loadingText = this.add.text(this.sys.game.scale.gameSize.width / 2 - 400, this.sys.game.scale.gameSize.height / 2 + 100, "Loading...", {fontSize: 50, fontFamily: "BangersRegular"}).setOrigin(0.5)

        this.cards = [];
        let burritos = await Near.NFTTokensForOwner(0 + 6 * this.counter, 6);
        burritos.forEach((burrito, index) => {
            this.cards.push(new Card(295 + (270 * (index % 3)), 480 + (300 * Math.floor(index / 3)), burrito, this, true, true).setScale(0.3).On(() => { this.ShowCard(burrito, index); }));
        });
        loadingText.destroy();
    }
    Navigate = async(nav) => {
        if(this.canNavigate){
            if(this.counter + nav >= 0 && this.counter + nav < this.totalTokens / 6){
                this.canNavigate = false;
                this.counter += nav;
                this.cards.forEach(card => card.GetComponents().destroy());
                this.SpawnCards();
                this.canNavigate = true;
            }
        }
    }
    LastBigCard = async() => {
        let burritos = await Near.NFTTokensForOwner(0, this.totalTokens);
        burritos.forEach((burrito, index) => {
            if(burrito.token_id == localStorage.getItem("last_burritoIndex"))
                this.ShowCard(burrito, index)
        });
    }
}