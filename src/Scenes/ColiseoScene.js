import { Button, Alert, LoadingScreen, SettingsButton, Card, BossSlider } from '../Helpers/Helpers.js'
import *  as Near from '../Near.js';
import {Translate} from '../Language/Translate.js'

export default class Coliseo extends Phaser.Scene{
    constructor(){
        super("Coliseo");
        this.counter = 0;
        this.canNavigate = true;
        this.canInteract = true;
    }

    preload(){
        this.sound.stopAll();
        this.sound.removeAll();
    }

    create(){
        Alert.isAlert = false;
        this.loadSpritesheet();
    }
    loadSpritesheet(){
        this.sound.stopAll();
        this.sound.removeAll();
        this.textures.remove("cards")
        this.load.spritesheet("mega_cards", '../src/assets/Images/Coliseo/Megaburrito.webp', {frameWidth: 1080, frameHeight: 1080});

        this.load.image("coliseo_vacio", "../src/assets/Images/Coliseo/Coliseo_vacio.png");
        this.load.image("coliseo_inicio", "../src/assets/Images/Coliseo/Coliseo_inicio.png");
        this.load.image("coliseo_reconstruccion", "../src/assets/Images/Coliseo/Coliseo_reconstrucción.png");
        this.load.image("coliseo_destruido", "../src/assets/Images/Coliseo/Coliseo_destruido.png");

        this.load.image("cerrar", '../src/assets/Images/cerrar.png');

        this.load.image("seleccion_panel", '../src/assets/Images/Coliseo/Seleccion.png');
        this.load.image("informacion_incursion", '../src/assets/Images/Coliseo/Informacion_incursion.png');
        this.load.image("QmULzZNvTGrRxEMvFVYPf1qaBc4tQtz6c3MVGgRNx36gAq", '../src/assets/Images/Burritos/Burrito Relampago.png');
        this.load.image("QmZEK32JEbJH3rQtXL9BqQJa2omXfpjuXGjbFXLiV2Ge9D", '../src/assets/Images/Burritos/Burrito Planta.png');
        this.load.image("QmQcTRnmdFhWa1j47JZAxr5CT1Cdr5AfqdhnrGpSdr28t6", '../src/assets/Images/Burritos/Burrito Fuego.png');
        this.load.image("QmbMS3P3gn2yivKDFvHSxYjVZEZrBdxyZtnnnJ62tVuSVk", '../src/assets/Images/Burritos/Burrito Agua.png');
        this.textures.remove("cards")
        this.load.spritesheet("cards", '../src/assets/Images/Cards/cards.png', {frameWidth: 1080, frameHeight: 1080});
        this.load.image("burrito_muerto", '../src/assets/Images/Establo/gravestone.png');
        this.load.image("left_arrow", '../src/assets/Images/Establo/left_arrow.png');
        this.load.image("right_arrow", '../src/assets/Images/Establo/right_arrow.png');
        this.load.spritesheet("slider_background_mega", '../src/assets/Images/Coliseo/Barra_jefe.png', {frameHeight: 211, frameWidth: 799})

        this.load.spritesheet("burritos_heads", '../src/assets/Images/Battle/Burritos.png', {frameWidth: 200, frameHeight: 268});
        this.load.spritesheet("cofre", '../src/assets/Images/SiloScene/Cofre_abierto.webp', {frameWidth: 1920, frameHeight: 1080})
        this.load.once("complete", this.Start, this);
        this.load.start();
    }
    async Start(){
        this.loadingScreen = new LoadingScreen(this);
        this.incursion = await Near.GetActiveIncursion();
        console.log(this.incursion);

        let duration = 108_000_000;
        if(this.incursion.status == "Null" || parseInt(Date.now()) > parseInt(this.incursion.finish_time.toString().substring(0, 13)) + duration){
            this.add.image(0, 0, "coliseo_vacio").setOrigin(0).setScale(1);
            new Button(this.game.config.width / 2, this.game.config.height / 2 + 400, 1, "buttonContainer", Translate.Translate("BtnStartIncursion"), this, this.ConfirmIncursion, {fontSize: 40, fontFamily: "BangersRegular"});
        }else if(parseInt(Date.now()) > parseInt(this.incursion.finish_time).toString().substring(0, 13) && parseInt(Date.now()) < parseInt(this.incursion.finish_time.toString().substring(0, 13)) + duration){
            this.add.image(0, 0, "coliseo_reconstruccion").setOrigin(0).setScale(1);
            await this.loadingScreen.OnComplete();
            let result = this.incursion.finish_time.toString();
            await Alert.Fire(this, Translate.Translate("TleColiseumDestroyAlert"), Translate.Translate("MsgColiseumDestroyAlert").format(this.GetCountDown(parseInt(result.substring(0, result.length - 6)) + duration)), Translate.Translate("BtnAccept"));
            let _loadingScreen = new LoadingScreen(this);
            let playerIncursion = await Near.GetPlayerIncursion();
            let canWithdrawBurrito = await Near.CanWithdrawBurrito();
            await _loadingScreen.OnComplete();
            if(playerIncursion.player.burrito_id != null && parseInt(playerIncursion.incursion.finish_time).toString().substring(0,13) < parseInt(Date.now()) && canWithdrawBurrito){
                await Alert.Fire(this, Translate.Translate("TleTakeBackBurritoAlert"), Translate.Translate("MsgTakeBackBurritoAlert"), Translate.Translate("BtnAccept"))
                .then(async (result) =>{ 
                    if(result){
                        this.GetRewards();
                    }
                });
            } else {
            }
        }else if(parseInt(Date.now()) > parseInt(this.incursion.start_time).toString().substring(0, 13)){
            this.add.image(0, 0, "coliseo_destruido").setOrigin(0).setScale(1);
            let result = await Near.GetPlayerIncursion();
            
            if(result.player.burrito_owner !== "" && this.incursion.mega_burrito.health > 0){ //estas en alguna incursion
                try{
                    let battleIncursion = await Near.GetActiveBattleRoom();
                    if(battleIncursion.room.health <= 0){
                        await this.loadingScreen.OnComplete();
                        await Alert.Fire(this, Translate.Translate("TleDeadBurrito"), Translate.Translate("MsgDeadBurrito"), Translate.Translate("BtnAccept"));
                    
                        this.CreateIncursionInfo();
                    } else
                        this.scene.start("ColiseoBattle");
                } catch{
                    this.scene.start("ColiseoBattle");
                }

            }else
                this.CreateIncursionInfo();
        }else{
            this.add.image(0, 0, "coliseo_inicio").setOrigin(0).setScale(1);
            this.CreatePanelIncursion();
        }
        new Button(this.sys.game.scale.gameSize.width / 2 + 750,  100, 0.5, "buttonContainer", Translate.Translate("BtnMeadow"), this, this.BackToPradera, {fontSize: 30, fontFamily: "BangersRegular"});

        this.sound.add("acoustic-motivation", { loop: true, volume: SettingsButton.GetVolume()}).play();
        await this.loadingScreen.OnComplete();
    }
    GetRewards = async() =>{
        this.canNavigate = false;
        let loadingScreen = new LoadingScreen(this);
        let result = await Near.WithdrawBurritoOwner();
        await loadingScreen.OnComplete();
        if(result.complete){
            if(result.win == "MegaBurrito")
                await Alert.Fire(this, Translate.Translate("TleLosersAlert"), Translate.Translate("MsgLosersAlert"), Translate.Translate("BtnAccept"));
            else if(result.win == "Players")
                await Alert.Fire(this, Translate.Translate("TleWinnersAlert"), Translate.Translate("MsgWinnersAlert"), Translate.Translate("BtnAccept")).then((r) => { if(r) this.GetTokens(result.rewards) });
        } else{ 
            await Alert.Fire(this, Translate.Translate("TleNoIncursionAlert"), Translate.Translate("MsgNoIncursionAlert"), Translate.Translate("BtnAccept"));
        }
    }
    GetTokens (tokens) {
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
                this.cofreAnimation.play("cofreAnimOut").once('animationcomplete', () => {
                    animContainer.destroy();
                    this.canNavigate = true;
                })
            })
        });
    }
    Range = (start, end) => Array(end - start + 1).fill().map((_, idx) => start + idx);
    BackToPradera = () =>{ 
        clearInterval(this.counterInterval); 
        this.scene.start("Pradera"); 
    }
    ConfirmIncursion = async() => {
        await Alert.Fire(this, Translate.Translate("TleStartIncursionAlert"), Translate.Translate("MsgStartIncursionAlert"), Translate.Translate("BtnStartIncursion"), Translate.Translate("BtnCancelAlert"))
        .then(async (result) =>{ 
            if(result){
                localStorage.setItem("lastScene", "Coliseo");
                let loadingScreen = new LoadingScreen(this);
                await Near.CreateIncursion();
                await loadingScreen.OnComplete();
                location.reload();
            }
        });
    }
    async CreatePanel(){
        this.totalTokens = await Near.NFTSupplyForOwner();
        this.panelContainer = this.add.container(this.game.config.width / 2, this.game.config.height / 2).setScale(0.75);
        this.panelContainer.add(this.add.image(0, 0, "seleccion_panel"));
        this.panelContainer.add(this.add.text(28, 496, Translate.Translate("SingBurritos"), {fontSize: 60, fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5, align: "center"}).setOrigin(0.5));
        this.panelContainer.add(this.add.text(0, -430, Translate.Translate("SingIncursion"), {fontSize: 120, fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5, align: "center"}).setOrigin(0.5));
        this.panelContainer.add(new Button(- 500, 85, 1, "left_arrow", null, this, ()=>{ this.Navigate(-1); }).GetComponents());
        this.panelContainer.add(new Button(500, 85, 1, "right_arrow", null, this, ()=>{ this.Navigate(1); }).GetComponents());
        this.panelContainer.add(new Button(600, -500, 0.25, "cerrar", null, this, ()=>{this.panelContainer.destroy(); this.CreatePanelIncursion();}).GetComponents());
        this.SpawnCards();
    }
    SpawnCards = async() => {
        this.cards = [];
        let burritos = await Near.NFTTokensForOwner(0 + 6 * this.counter, 6);
        burritos.forEach((burrito, index) => {
            let card = new Card( (300 * (index % 3)) - 300, (380 * Math.floor(index / 3)) - 125, burrito, this, true, false, false, false).setScale(0.35).On(() => { this.UseCard(burrito)});
            this.panelContainer.add(card.GetComponents());
            this.cards.push(card)
        });
    }
    async UseCard(burrito){
        if(burrito.hp === "0"){
            await Alert.Fire(this, Translate.Translate("TleNoUseBurritoAlert"), Translate.Translate("MsgNoUseBurritoAlert"), Translate.Translate("BtnAccept"));
        } else{
            await Alert.Fire(this, Translate.Translate("TleUseBurritoAlert"), Translate.Translate("MsgUseBurritoAlert"), Translate.Translate("BtnSelect"), Translate.Translate("BtnCancelAlert"))
            .then(async(result) =>{ 
                if(result){
                    if(burrito.token_id == localStorage.getItem("burrito_selected"))
                        localStorage.removeItem("burrito_selected");
                    
                    let loadingScreen = new LoadingScreen(this);
                    await Near.RegisterInIncursion(burrito.token_id, this.incursion.id);
                    localStorage.setItem("lastScene", "Coliseo");
                    this.incursion = await Near.GetActiveIncursion();
                    this.panelContainer.destroy();
                    this.CreatePanelIncursion();
                    await loadingScreen.OnComplete();
                }
            });
        }
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
    async CreateIncursionInfo(){
        console.log("player incursion: " + JSON.stringify(await Near.GetPlayerIncursion()))
        console.log("active incursion: " + JSON.stringify(await Near.GetActiveIncursion()))
        let loadingScreen = new LoadingScreen(this); 
        let incursion = await Near.GetPlayerIncursion();
        let mega = incursion.incursion.mega_burrito;
        let info = await Near.BurritosIncursionInfo(incursion.incursion.id);
        mega.hp = mega.win /*= mega.attack = mega.defense = mega.level = mega.speed*/ = "?";
        mega.cards = "mega_cards"
        let incursionContainer = this.add.container(this.game.config.width / 2, this.game.config.height / 2 ).setScale(0.75);
        incursionContainer.add(this.add.image(0, 0, "informacion_incursion"));
        incursionContainer.add(this.add.text(22, 494, Translate.Translate("SingPlayer"), {fontSize: 50, fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5, align: "center"}).setOrigin(0.5));
        incursionContainer.add(this.add.text(0, -430, Translate.Translate("SingIncursion"), {fontSize: 120, fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5, align: "center"}).setOrigin(0.5));
        incursionContainer.add(new Card(- 280, - 100, mega, this, false, false, false, false).setScale(.45).GetComponents());
        incursionContainer.add(this.countDownText = this.add.text(200, -200, Translate.Translate("MsgFinishIncursion0"), {fontSize: 45, fontFamily: "BangersRegular", align: "center"}).setOrigin(0.5));//this.countDownInfoText = 
        incursionContainer.add(new BossSlider(175, 70, this).SetValue(mega.health / mega.start_health).SetScale(0.6).GetComponent());

        info.forEach(async(player, i) => {
            let ownerOffset = {x: 0, y:35}
            incursionContainer.add(this.add.sprite(-300+ (150 * (i % 5)), 265 + (130 * Math.floor(i / 5)), player.is_alive ? "burritos_heads" : "burrito_muerto", this.burritoMediaToSkinHead(player.media))
            .setOrigin(0.5).setScale(player.is_alive ? 0.55 : 0.2).setInteractive()
            .on("pointerover", (pointer)=>{ incursionContainer.add(this.playerNameText = this.add.text((pointer.worldX + ownerOffset.x) - this.game.config.width/2, (pointer.worldY + ownerOffset.y) - this.game.config.height/2, player.player_name, {fontSize: 18, fontFamily: "BangersRegular", align: "center", strokeThickness:5, stroke: "#000"}).setOrigin(0.5).setDepth(2)); })
            .on("pointermove", (pointer) => { 
                this.playerNameText?.setPosition((pointer.worldX + ownerOffset.x) - this.game.config.width/2, (pointer.worldY + ownerOffset.y) - this.game.config.height/2)
            })
            .on("pointerout", ()=>{
                if(this.playerNameText !== null)
                    this.playerNameText.destroy();
            })
        );});
        
        let result = incursion.incursion.finish_time.toString();
        this.counterInterval = setInterval(() => {this.ContdownInfo(result == 0 ? result : parseInt(result.substring(0, result.length - 6))) }, 1000);
        loadingScreen.OnComplete();
    }
    CreatePanelIncursion(){
        let mega = this.incursion.mega_burrito;
        mega.hp = mega.win = mega.attack = mega.defense = mega.level = mega.speed = "?";
        mega.cards = "mega_cards"
        let incursionContainer = this.add.container(this.game.config.width / 2, this.game.config.height / 2 ).setScale(0.75);
        incursionContainer.add(this.add.image(0, 0, "informacion_incursion"));
        incursionContainer.add(new Card(- 280, - 100, mega, this, false, false, false, false).setScale(.45).GetComponents());
        incursionContainer.add(this.countDownText = this.add.text(200, -200, "", {fontSize: 45, fontFamily: "BangersRegular", align: "center"}).setOrigin(0.5));
        if(this.incursion.players.filter((e) => e.burrito_owner === Near.GetAccountId()).length == 0){
            incursionContainer.add(new Button(200, 0, 0.5, "buttonContainer", Translate.Translate("BtnSelectBurrito"), this, 
            ()=>{
                clearInterval(this.counterInterval); 
                incursionContainer.destroy(); 
                this.CreatePanel() 
            }, {fontSize: 24, fontFamily: "BangersRegular"}).GetComponents());
        } else{
            incursionContainer.add(this.add.text(200, 0, Translate.Translate("MsgRegisteredIncursion"), {fontSize: 30, fontFamily: "BangersRegular", align: "center", wordWrap: { width: 600 }}).setOrigin(0.5));
        }
        let playersTest = this.incursion.players;
        playersTest.forEach(async(player, i) => {
            let burrito = await Near.GetNFTToken(player.burrito_id);
            let ownerOffset = {x: 0, y:35}
            incursionContainer.add(this.add.sprite(-300+ (150 * (i % 5)), 265 + (130 * Math.floor(i / 5)), "burritos_heads", this.burritoMediaToSkinHead(burrito.media))
            .setOrigin(0.5).setScale(0.55).setInteractive()
            .on("pointerdown", ()=>{this.ShowCard(burrito)})
            .on("pointerover", (pointer)=>{ 
                if(this.canInteract){
                    incursionContainer.add(this.playerNameText = this.add.text((pointer.worldX + ownerOffset.x) - this.game.config.width/2, (pointer.worldY + ownerOffset.y) - this.game.config.height/2, player.burrito_owner, {fontSize: 18, fontFamily: "BangersRegular", align: "center", strokeThickness:5, stroke: "#000"}).setOrigin(0.5));
                }
            })
            .on("pointermove", (pointer) => { 
                if(this.playerNameText != null)
                    this.playerNameText.setPosition((pointer.worldX + ownerOffset.x) - this.game.config.width/2, (pointer.worldY + ownerOffset.y) - this.game.config.height/2)
                })
            .on("pointerout", ()=>{
                if(this.playerNameText != null)
                    this.playerNameText.destroy();
                })
        );});
        
        let result = this.incursion.start_time.toString();
        this.counterInterval = setInterval(() => {this.Contdown(result == 0 ? result : parseInt(result.substring(0, result.length - 6))) }, 1000);
    }
    ShowCard(burrito){
        if(this.canInteract){
            if(this.playerNameText !== null)
                this.playerNameText.destroy();
            let bigCard = new Card(this.game.config.width / 2, this.game.config.height / 2, burrito, this, false, false, false, false)
            this.cerrarBtn = this.add.image(this.game.config.width / 2 + 350, this.game.config.height / 2 - 400, "cerrar").setScale(0.25).setInteractive()
            .on("pointerdown", () =>{
                bigCard.GetComponents().destroy();
                this.cerrarBtn.destroy()
                this.canInteract = true;
            });
            this.canInteract = false;
        }
    }
    async Contdown(remainToBuy) {
        let timeNow = Date.now();
        let time = Math.abs(timeNow - remainToBuy) / 36e5;
        let hour = time;
        let minutes = (hour % 1) * 60;
        let seconds = (minutes % 1) * 60;
        if(remainToBuy != 0){
            this.contdown = true;
            
            if(this.countDownText !== null)
                this.countDownText.setText(Translate.Translate("MsgStartIncursion") + parseInt(hour).toString().padStart(2, '0') + ":" + parseInt(minutes).toString().padStart(2, '0') + ":" + parseInt(seconds).toString().padStart(2, '0'));
        }

        if(remainToBuy < timeNow){
            localStorage.setItem("lastScene", "Coliseo");
            location.reload();
        }
    }
    GetCountDown(remain){
        let timeNow = Date.now();
        let time = Math.abs(timeNow - remain) / 36e5;
        let hour = time;
        let minutes = (hour % 1) * 60;
        let seconds = (minutes % 1) * 60;
        return parseInt(hour).toString().padStart(2, '0') + ":" + parseInt(minutes).toString().padStart(2, '0') + ":" + parseInt(seconds).toString().padStart(2, '0')
    }
    async ContdownInfo(remainToBuy) {
        let timeNow = Date.now();
        let time = Math.abs(timeNow - remainToBuy) / 36e5;
        let hour = time;
        let minutes = (hour % 1) * 60;
        let seconds = (minutes % 1) * 60;
        if(remainToBuy != 0){
            this.countDownText?.setText(Translate.Translate("MsgFinishIncursion") + parseInt(hour).toString().padStart(2, '0') + ":" + parseInt(minutes).toString().padStart(2, '0') + ":" + parseInt(seconds).toString().padStart(2, '0'));
        
        }
        if(remainToBuy < timeNow){
            localStorage.setItem("lastScene", "Coliseo");
            location.reload();
        }
    }
    burritoMediaToSkinHead(media){
        switch(media){
            case "planta":
            case "QmZEK32JEbJH3rQtXL9BqQJa2omXfpjuXGjbFXLiV2Ge9D": return 0;
            case "electrico":
            case "QmULzZNvTGrRxEMvFVYPf1qaBc4tQtz6c3MVGgRNx36gAq": return 1;
            case "agua":
            case "QmbMS3P3gn2yivKDFvHSxYjVZEZrBdxyZtnnnJ62tVuSVk": return 2;
            case  "fuego":
            case "QmQcTRnmdFhWa1j47JZAxr5CT1Cdr5AfqdhnrGpSdr28t6": return 3;
        }
    }
}