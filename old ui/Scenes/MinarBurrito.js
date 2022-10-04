import * as Helpers from "../src/Helpers/Helpers.js";
import * as Near  from "../src/near.js";
import { Translate } from "../src/Translate.js";

export class MinarBurrito extends Phaser.Scene{
    sprites = [];
    contdown = false;
    canNavigate = true;
    isBigCard = false;
    alertVisible = false;
    
    constructor(){
        super("MinarBurrito");
    }
    preload(){
        this.load.image("tokenHud", "../src/images/HUD/Information.png");
        this.load.spritesheet("tokenIcon", "../src/images/HUD/Tokens.png", {frameWidth: 49, frameHeight: 50});
        
        this.load.spritesheet("loading_screen_1", `../src/images/loading_screen_1.webp`, { frameWidth: 720, frameHeight: 512 });
        this.load.spritesheet("loading_screen_2", `../src/images/loading_screen_2.webp`, { frameWidth: 512, frameHeight: 512 });
        this.load.image("loading_bg", "../src/images/loading_bg.png");
        this.load.image("buttonContainer2", "../src/images/button.png");
        this.load.image("alert", "../src/images/Información 1.png");
        this.loadingScreen = new Helpers.LoadingScreen(this);
    }
    create(){
        this.sound.stopAll();
        this.sound.removeAll();
        Helpers.Alert.isAlert = false;
        this.LoadSpritesheet();  
    }
    LoadSpritesheet(){;
        this.load.image("mintBurritoBackground", "../src/images/Minar Burrito/background.png");
        this.load.image("silo", "../src/images/Minar Burrito/Silo.webp");
        this.load.spritesheet("Silo_start", "../src/images/Minar Burrito/Silo animación.webp", {frameWidth: 1920, frameHeight: 4000});
        this.load.image("clouds", "../src/images/Minar Burrito/Loop nubes.webp");
        this.load.spritesheet("cofre", "../src/images/Minar Burrito/Cofre_abierto.webp", {frameWidth: 1920, frameHeight: 1080})

        this.load.image("tienda1", "../src/images/Minar Burrito/Tienda1.png");
        this.load.image("tienda2", "../src/images/Minar Burrito/Tienda2.png");
        this.load.image("burrito", "../src/images/Minar Burrito/Burrito.png");

        this.load.image("QmULzZNvTGrRxEMvFVYPf1qaBc4tQtz6c3MVGgRNx36gAq", "../src/images/Burritos/Burrito Relampago.png");
        this.load.image("QmZEK32JEbJH3rQtXL9BqQJa2omXfpjuXGjbFXLiV2Ge9D", "../src/images/Burritos/Burrito Planta.png");
        this.load.image("QmQcTRnmdFhWa1j47JZAxr5CT1Cdr5AfqdhnrGpSdr28t6", "../src/images/Burritos/Burrito Fuego.png");
        this.load.image("QmbMS3P3gn2yivKDFvHSxYjVZEZrBdxyZtnnnJ62tVuSVk", "../src/images/Burritos/Burrito Agua.png");

        this.load.spritesheet("elements","../src/images/Minar Burrito/Elements/Elementos.png", {frameWidth: 290, frameHeight: 290});
        this.load.spritesheet("orbs", "../src/images/Minar Burrito/Orbs/orbs.png", {frameWidth: 218, frameHeight: 218 })

        this.textures.remove("cards")
        this.load.spritesheet("cards", "../src/images/Cards/cards.png", {frameWidth: 1080, frameHeight: 1080});

        
        this.load.image("buttonContainer3", "../src/images/button.png");
        this.load.image("alert", "../src/images/Información 1.png");
        this.load.image("alert_small", "../src/images/Informacion_small.png");

        //audios
        this.load.audio("acoustic-motivation", "../src/audio/acoustic-motivation.ogg");
        this.load.audio("button-hover", "./src/audio/button-hover.ogg");
        this.load.audio("button-click", "./src/audio/button-click.ogg");

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
        new Helpers.Button(this.sys.game.scale.gameSize.width / 2 + 750,  100, 0.5, "buttonContainer2", this.isPrevScene ? Translate.Translate("BtnBackToMeadow") : Translate.Translate("BtnMainMenu"), this, this.BackToMainMenu, null, {fontSize: 30, fontFamily: "BangersRegular"});
        this.hudTokens = new Helpers.TokenHud(200, 200, this, await Near.GetCurrentNears(), await Near.GetSTRWToken());
        this.mintButton = new Helpers.Button(this.sys.game.scale.gameSize.width / 2 + 300, this.sys.game.scale.gameSize.height - 75, 0.75, "buttonContainer2", Translate.Translate("BtnMintBurrito"), this, this.ConfirmMint, null, {fontSize: 38, fontFamily: "BangersRegular"});
        this.barnButton = new Helpers.Button(this.sys.game.scale.gameSize.width / 2 - 300, this.sys.game.scale.gameSize.height - 75, 0.75, "buttonContainer2", Translate.Translate("BtnGoBarn"), this, this.GoToEstablo, null, {fontSize: 40, fontFamily: "BangersRegular"});
        
        let remainToBuy = await Near.CanBuyTokens();
        await this.loadingScreen.OnComplete();
        this.burroTienda = this.add.sprite(180, this.sys.game.scale.gameSize.height + 2300, "burrito").setOrigin(0);
        this.tienda = this.add.sprite(50, this.sys.game.scale.gameSize.height + 2270, "tienda2").setOrigin(0);
        this.sign = this.add.text(257, this.sys.game.scale.gameSize.height + 2554, Translate.Translate("SignBuyStrw"), {fontSize: 20 , fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5, align: "center"}).setOrigin(0.5);
        if(remainToBuy == 0){
            this.comprarBtn = new Helpers.Button(360,  this.sys.game.scale.gameSize.height + 2350, 0.25, "buttonContainer2", Translate.Translate("BtnBuyStrw"), this, this.BuyTokens, null, {fontSize: 20, fontFamily: "BangersRegular"}, false)
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
        this.sound.add("acoustic-motivation", { loop: true, volume: Helpers.SettingsButton.GetVolume()}).play();
    }
    update(){
        if(this.clouds == null || this.camera == null || this.background) return;
        let cursors = this.input.keyboard.createCursorKeys();
        this.clouds.tilePositionX += 1
        this.camera?.setBounds(0,0,this.background.displayWidth, this.background.displayHeight);

        if (cursors.up.isDown) this.cameras.main.scrollY -= 24;
        else if (cursors.down.isDown) this.cameras.main.scrollY += 24;
    }
    GoToEstablo = () =>{
        if(!this.canNavigate || Helpers.Alert.isAlert) return;
        clearInterval(this.counterInterval);
        localStorage.removeItem("lastScene");
        this.scene.start("Establo");
    }
    BackToMainMenu = () =>{
        if(!this.canNavigate || Helpers.Alert.isAlert) return;
        clearInterval(this.counterInterval);
        localStorage.removeItem("lastScene");
        this.scene.start(this.isPrevScene ? "newMap" :"MainMenu");
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
        if(!this.canNavigate || Helpers.Alert.isAlert)
            return;
        let currentSTRW = await Near.GetSTRWToken();
        await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, Translate.Translate("TleMintBurritoAlert"), (Translate.Translate("MsgMintBurritoAlert") + currentSTRW + " $STRW."), Translate.Translate("BtnMintBurritoAlert"), Translate.Translate("BtnCancelAlert"))
        .then(async(result) => { 
            if (result){
                if(currentSTRW >= 50_000) {
                    if((await Near.GetCurrentNears()) >= 5){
                        this.canNavigate = false;
                        this.mintButton.GetComponents().visible = false;
                        this.barnButton.GetComponents().visible = false;
                        localStorage.setItem("action", "mintBurrito");
                        localStorage.setItem("lastScene", "MinarBurrito");
                        this.loadingScreen2 = new Helpers.LoadingScreen(this);
                        await this.Delay(5000)
                        //let minar = JSON.parse('{"attack":"8","burrito_type":"Volador","defense":"7","description":"Este es un burrito de tipo Volador","global_win":"0","hp":"5","level":"1","media":"QmQcTRnmdFhWa1j47JZAxr5CT1Cdr5AfqdhnrGpSdr28t6","name":"Burrito Volador #81","owner_id":"jesusrobles.testnet","speed":"5","win":"0"}')
                        let minar = await Near.NFTMint();
                        this.hudTokens.UpdateTokens();
                        await this.loadingScreen2.OnComplete(); 
                        this.MintBurrito(minar);
                        localStorage.removeItem("action");
                        localStorage.removeItem("lastScene");
                    } else {
                        await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, null, Translate.Translate("DontHaveEnoughNearForMint"), Translate.Translate("BtnCancelAlert"))
                    }
                } else{
                    await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, null, Translate.Translate("DontHaveEnoughSTRWForMint"), Translate.Translate("BtnCancelAlert"))
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
        this.card = new Helpers.Card(this.sys.game.scale.gameSize.width / 2, -1000, minar, this, false, false, false).GetComponents();
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
        if(!this.canNavigate || Helpers.Alert.isAlert)
            return;
        let remain = await Near.CanBuyTokens();
        if(remain == 0){
            await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, Translate.Translate("TleBuyStrwAlert"), Translate.Translate("MsgBuyStrwAlert"), Translate.Translate("BtnBuyStrw"), Translate.Translate("BtnCancelAlert"))
            .then(async(result) =>{
                if (result){
                    if((await Near.GetCurrentNears()) >= 1){
                        this.canNavigate = false;
                        localStorage.setItem("action", "mintBurrito");
                        localStorage.setItem("lastScene", "MinarBurrito");
                        this.loadingScreen2 = new Helpers.LoadingScreen(this);
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
                        await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, null, Translate.Translate("DontHaveEnoughNearForBuyStraw"), Translate.Translate("BtnCancelAlert"));
                    }
                }
            });
        } else{
            await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, Translate.Translate("TleNoBuyStrwAlert"), Translate.Translate("MsgNoBuyStrwAlert"), Translate.Translate("BtnAccept"))
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