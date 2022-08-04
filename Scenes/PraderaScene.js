import * as Near  from "../src/near.js";
import * as Helpers from "../src/Helpers/Helpers.js";
import { Translate } from "../src/Translate.js";


export class Pradera extends Phaser.Scene{
    speed = 200;
    angle = 0;
    showAlert = false;
    isKeyboard = true;
    target = new Phaser.Math.Vector2();
    
    constructor(){
        super("Pradera");
    }
    
    async preload(){
        this.game.sound.stopAll();
        this.sound.removeAll();
        this.load.spritesheet("loading_screen_1", `../src/images/loading_screen_1.webp`, { frameWidth: 720, frameHeight: 512 });
        this.load.spritesheet("loading_screen_2", `../src/images/loading_screen_2.webp`, { frameWidth: 512, frameHeight: 512 });
        this.load.image("loading_bg", "../src/images/loading_bg.png");
        this.loadingScreen = new Helpers.LoadingScreen(this);

        this.load.image("background", "../src/images/Pradera/Map background.png");
        this.load.image("map", "../src/images/Pradera/Mapa.png");
        this.load.image("arboles", "../src/images/Pradera/Arboles.png");
        this.load.image("edificiosSup", "../src/images/Pradera/Edificios_sup.png");
        this.load.image("edificiosBase", "../src/images/Pradera/Edificios_base.png");
        this.load.image("coliseoNull", "../src/images/Pradera/Coliseo_normal.png");
        this.load.image("coliseoFinished", "../src/images/Pradera/Coliseo_reconstrucción.png");
        this.load.image("coliseoInProgress", "../src/images/Pradera/Coliseo_jefe.png");
        
        this.load.spritesheet("details", "../src/images/Pradera/Detalles.webp", {frameWidth: 1920, frameHeight: 1080});
        this.load.spritesheet("nubes", "../src/images/Pradera/Nubes.webp", {frameWidth: 1920, frameHeight: 1080});
        this.load.spritesheet("coliseoIncursionWait", "../src/images/Pradera/Coliseo_inicio.webp", {frameWidth: 640, frameHeight: 640});
        this.load.spritesheet("coliseo", "../src/images/Pradera/Coliseo.webp", {frameWidth: 259, frameHeight: 256});
        
        this.load.spritesheet("engrane", "../src/images/Engranajes.webp",{ frameWidth: 500, frameHeight:  468});        
        this.load.image("options", "../src/images/Opciones.png");
        this.load.image("volume_on", "../src/images/volume_on.png");
        this.load.image("volume_off", "../src/images/volume_off.png");
        this.load.image("volume_handler", "../src/images/volume_handler.png");
        this.load.image("volume", "../src/images/volume.png");
        this.load.spritesheet("languages", "../src/images/Idiomas.webp", {frameWidth:1128, frameHeight: 455});

        this.load.image("buttonContainer3", "../src/images/button.png");
        this.load.image("alert", "../src/images/Información 1.png");
        this.load.image("alert_small", "../src/images/Informacion_small.png");
        
        this.load.spritesheet("burritoHud", "../src/images/HUD/Burritos.png", {frameWidth: 215, frameHeight: 305});
        this.load.spritesheet("hud", "../src/images/HUD/HUD.png", {frameWidth: 390, frameHeight: 226});
        this.load.image("tokenHud", "../src/images/HUD/Information.png");
        this.load.spritesheet("tokenIcon", "../src/images/HUD/Tokens.png", {frameWidth: 49, frameHeight: 50});

        this.load.audio("praderaSong", "../src/audio/Pradera.ogg");
        this.load.audio("footSteps", "../src/audio/Footsteps.ogg");
        this.load.audio("button-hover", "./src/audio/button-hover.ogg");
        this.load.audio("button-click", "./src/audio/button-click.ogg");
    }
    async create(){
        await Translate.LoadJson();
        Helpers.Alert.isAlert = false;
        this.sound.add("praderaSong", { loop: true, volume: Helpers.SettingsButton.GetVolume()}).play();
        this.footStepsSFX = this.sound.add("footSteps", {loop:true, volume: Helpers.SettingsButton.GetVolume() * 0.5});
        
        this.footStepsSFX.setMute(true); 
        this.footStepsSFX.play();
        let incursion = await Near.GetActiveIncursion();
        this.background = this.add.image(0,0, "background").setOrigin(0).setScale(1);
        this.map = this.add.image(0, 0, "map").setOrigin(0).setScale(1);
        this.add.image(0, 0, "edificiosBase").setOrigin(0).setScale(1);
        
        if(incursion.status == "Null"){
            this.add.image(1475, 25, "coliseo", 0).setOrigin(0).setScale(1);
        }else if(parseInt(Date.now()) > (parseInt(incursion.finish_time).toString().substring(0, 13) + 108000000)){
            this.add.image(1475, 25, "coliseo", 0).setOrigin(0).setScale(1);
        }else if(parseInt(Date.now()) > parseInt(incursion.finish_time).toString().substring(0, 13) && parseInt(Date.now()) < (parseInt(incursion.finish_time).toString().substring(0, 13) + 108000000)){
            this.add.image(1475, 25, "coliseo", 2).setOrigin(0).setScale(1);
        }else if(parseInt(Date.now()) > parseInt(incursion.start_time).toString().substring(0, 13)){
            this.add.image(1475, 25, "coliseo", 1).setOrigin(0).setScale(1);
        }else{
            this.anims.create({ key: "coliseoIncursionWaitLoop", frameRate: 30, frames: this.anims.generateFrameNumbers("coliseoIncursionWait", { start: 0, end: 74 }), repeat: -1 });
            this.add.sprite(1265, -185, "coliseoIncursionWait").play("coliseoIncursionWaitLoop").setOrigin(0);
        }        

        if(await Near.NFTSupplyForOwner() == 1 && localStorage.getItem("in_incursion")){
            await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, Translate.Translate("TleBurritoInIncursion"), Translate.Translate("MsgBurritoInIncursion"), Translate.Translate("BtnGoColiseum"), Translate.Translate("BtnCancelAlert"))
            .then(async (result) => { if (result) this.scene.start("Coliseo"); });
        }

        if(localStorage.getItem("burrito_selected") == null){
                await this.loadingScreen.OnComplete();
                await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, Translate.Translate("TleSelectedBurritoAlert"), Translate.Translate("MsgSelectedBurritoAlert"), Translate.Translate("BtnGoBarn"), Translate.Translate("BtnGoSilo"))
                .then((result) =>{ this.scene.start(result ? "Establo": "MinarBurrito"); });
        }
        this.LoadSpriteSheet();
    }
    async LoadSpriteSheet(){
        if(localStorage.getItem("burrito_selected") == null)
            return
        let burritoPlayerSkin = await Near.GetNFTToken(localStorage.getItem("burrito_selected"));
        this.load.spritesheet("miniBurrito", `../src/images/Pradera/burrito_${this.burritoMediaToSkin(burritoPlayerSkin.media)}.png`, {frameWidth: 51, frameHeight: 53});
        this.load.once("complete", this.CreateScene, this);
        this.load.start();
    }
    async CreateScene(){
        this.burritoPlayer = await Near.GetNFTToken(localStorage.getItem("burrito_selected"));
        if(this.burritoPlayer.hp <= 0){
            await this.loadingScreen.OnComplete();
            await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, Translate.Translate("TleDeadBurritoAlert"), Translate.Translate("MsgDeadBurritoAlert"), Translate.Translate("BtnGoBarn"))
            .then(async (result) => { if (result) this.scene.start("Establo"); });
        }

        this.burrito = this.physics.add.sprite(this.sys.game.scale.gameSize.width / 2, this.sys.game.scale.gameSize.height / 2, "miniBurrito", 0).setOrigin(0.5).setScale(1).setCollideWorldBounds(true);
        this.physics.world.enable(this.burrito);
        this.burrito.setCollideWorldBounds(true);
        this.burrito.onWorldBounds = true;

        this.add.image(0, 0, "arboles").setOrigin(0).setScale(1);
        this.add.image(0, 0, "edificiosSup").setOrigin(0).setScale(1);
        this.anims.create({ key: "detailLoop", frameRate: 24, frames: this.anims.generateFrameNumbers("details", { start: 0, end: 29 }), repeat: -1 });
        this.add.sprite(0, 0, "detail").play("detailLoop").setOrigin(0);
        this.anims.create({ key: "nubesLoop", frameRate: 24, frames: this.anims.generateFrameNumbers("nubes", { start: 0, end: 29 }), repeat: -1 });
        this.add.sprite(0, 0, "nubes").play("nubesLoop").setOrigin(0);

        this.hudTokens = new Helpers.TokenHud(200, 200, this, await Near.GetCurrentNears(), await Near.GetSTRWToken());

        //this.physics.world.setBounds(0,0,this.background.displayWidth, this.background.displayHeight, true, true, true, true);
        this.camera = this.cameras.main;
        //this.camera.setBounds(0, 0, this.background.displayWidth, this.background.displayHeight);

        this.anims.create({ key: 'walkUp', frames: this.anims.generateFrameNumbers('miniBurrito', { frames: [0, 1, 2] }), frameRate: 12, repeat: -1 });
        this.anims.create({ key: "walkRight", frames: this.anims.generateFrameNumbers('miniBurrito', { frames: [3, 4, 5] }), frameRate: 12, repeat: -1 })
        this.anims.create({ key: 'walkDown', frames: this.anims.generateFrameNumbers('miniBurrito', { frames: [6, 7, 8] }), frameRate: 12, repeat: -1 });
        this.burrito.play("walkRight");

        this.button = new Helpers.Button(this.sys.game.scale.gameSize.width / 2,  60, 0.5, "buttonContainer3", Translate.Translate("BtnGoMainMenu"), this, this.BackToMainMenu, null, {fontSize: 24, fontFamily: "BangersRegular"});

        this.hudBurrito = new Helpers.BurritoHud(200, 960, await Near.GetNFTToken(localStorage.getItem("burrito_selected")), this);

        this.Cursors = this.input.keyboard.createCursorKeys();
        this.velocity = {x: 0, y: 0};

        this.input.on("pointerdown", function(pointer){
            if(!this.burrito.anims.isPlaying && !Helpers.Alert.isAlert){
                this.isKeyboard = false;
                this.target.x = Number(pointer.worldX.toFixed(1));
                this.target.y = Number(pointer.worldY.toFixed(1));
                this.physics.moveToObject(this.burrito, this.target, 150);
            }
        }, this)

        this.zoneBattles = this.physics.add.group();

        for (let i = 0; i < 20; i++) {
            let x = Phaser.Math.RND.between(0, this.game.config.width);
            let y = Phaser.Math.RND.between(0, this.game.config.height);
            this.zoneBattles.create(x, y, null, null, false, true);
        }
        this.physics.add.overlap(this.burrito, this.zoneBattles, this.Battle, null, this);

        //this.coliseoCollider = this.physics.add.collider(this.coliseo, this.burrito, this.stopBurrito, null, this);
        this.coliseo = this.add.zone(1595, 135, 250, 250).setRectangleDropZone(600, 600);
        this.physics.world.enable(this.coliseo);
        this.physics.add.overlap(this.coliseo, this.burrito,()=>{ 
            if(localStorage.getItem("accessType") == "safeMode"){
                    Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, Translate.Translate("TleColiseumFullAccess"), Translate.Translate("MsgColiseumFullAccess"), Translate.Translate("BtnColiseumFullAccess"), Translate.Translate("BtnCancelAlert"))
                    .then((result) =>{
                        if(result){
                            localStorage.setItem("accessType", "fullMode");
                            Near.LoginFullAccess();
                        }
                    });
            } else {
                this.ShowAlert(Translate.Translate("TleGoColiseumAlert"), Translate.Translate("MsgGoColiseumAlert"), "Coliseo");
            }
        
        });

        this.silo = this.add.zone(460, 740, 155, 300);
        this.physics.world.enable(this.silo);
        this.physics.add.overlap(this.burrito, this.silo, ()=>{ this.ShowAlert(Translate.Translate("TleGoSiloAlert"), Translate.Translate("MsgGoSiloAlert"), "MinarBurrito") });

        this.establo = this.add.zone(255, 510, 140, 120);
        this.physics.world.enable(this.establo);
        this.physics.add.overlap(this.establo, this.burrito, ()=> { this.ShowAlert(Translate.Translate("TleGoBarnAlert"), Translate.Translate("MsgGoBarnAlert"), "Establo") });

        this.hudBurritoZone = this.add.zone(0, 1080, 790, 600);
        this.physics.world.enable(this.hudBurritoZone);
        this.physics.add.overlap(this.burrito, this.hudBurritoZone, this.SetAlpha(this.hudBurrito, "overlapHudBurritoStart", "overlapHudBurritoEnd"), null, this);

        this.hudTokensZone = this.add.zone(0, 0, 630, 350);
        this.physics.world.enable(this.hudTokensZone);
        this.physics.add.overlap(this.burrito, this.hudTokensZone, this.SetAlpha(this.hudTokens, "overlapHudTokensStart", "overlapHudTokensEnd"), null, this);

        this.buttonZone = this.add.zone(960, 58, 295, 75);
        this.physics.world.enable(this.buttonZone);
        this.physics.add.overlap(this.burrito, this.buttonZone, this.SetAlpha(this.button, "overlapButtonStart", "overlapButtonEnd"), null, this)
        
        let detailGroup = [];
        let details = [
            { x:this.game.config.width/2, y:0, w:this.game.config.width, h:1 }, { x:this.game.config.width, y:this.game.config.height/2, w:1, h:this.game.config.height }, { x:this.game.config.width/2, y:this.game.config.height, w:this.game.config.width, h:1 }, { x:0, y:this.game.config.height/2, w:1, h:this.game.config.height },
            { x:456, y:810, w:93, h:1 }, { x:245, y:526, w:120, h:1 }, { x:1408, y:845, w:335, h:1 }, { x:676, y:338, w:45, h:1 }, { x:681, y:420, w:55, h:1 }, { x:407, y:166, w:55, h:1 }, { x:776, y:181, w:55, h:1 }, { x:184, y:320, w:25, h:1 },
            { x:131, y:622, w:25, h:1 }, { x:85, y:862, w:25, h:1 }, { x:414, y:1068, w:25, h:1 }, { x:695, y:668, w:25, h:1 }, { x:765, y:376, w:25, h:1 }, { x:493, y:221, w:25, h:1 }, { x:875, y:215, w:25, h:1 }, { x:843, y:28, w:25, h:1 }, { x:1231, y:291, w:14, h:1 }, 
            { x:1368, y:61, w:14, h:1 }, { x:1726, y:420, w:14, h:1 }, { x:1847, y:311, w:14, h:1 }, { x:1148, y:726, w:14, h:1 }, { x:1222, y:1029, w:14, h:1 }, { x:1637, y:1048, w:14, h:1 }, { x:1722, y:860, w:14, h:1 }, { x:1669, y:627, w:14, h:1 },
        ]
        for (let i = 0; i < details.length; i++) {
            let zone = this.add.zone(details[i].x, details[i].y, details[i].w ,details[i].h);
            this.physics.world.enable(zone);
            zone.body.setImmovable(true);
            detailGroup.push(zone);
        }
        this.physics.add.collider(this.burrito, detailGroup, (burrito, _)=>{ burrito.body.stop(); this.burrito.stop();});
        await this.loadingScreen.OnComplete();
    }
    update(){        
        if(localStorage.getItem("burrito_selected")  == null || this.burrito == null || this.Cursors == null || this.burrito.body == null || Helpers.Alert.isAlert || this.silo == null) return;

        this.TouchingZone(this.hudBurritoZone, "overlapHudBurritoStart", "overlapHudBurritoEnd");
        this.TouchingZone(this.hudTokensZone, "overlapHudTokensStart", "overlapHudTokensEnd");
        this.TouchingZone(this.buttonZone, "overlapButtonStart", "overlapButtonEnd");

        this.showAlert = Phaser.Geom.Intersects.RectangleToRectangle(this.burrito.getBounds(), this.silo.getBounds()) | Phaser.Geom.Intersects.RectangleToRectangle(this.burrito.getBounds(), this.establo.getBounds()) | Phaser.Geom.Intersects.RectangleToRectangle(this.burrito.getBounds(), this.coliseo.getBounds());
        let distance = Phaser.Math.Distance.Between(this.burrito.x, this.burrito.y, this.target.x, this.target.y);
        if(this.burrito.body.speed > 0){
            this.PlayAnimation();
            this.footStepsSFX.setMute(false); 
            if(distance < 4 && !this.isKeyboard)
                this.burrito.body.reset(this.target.x, this.target.y)
        } else{
            this.StopAnimation();
            this.footStepsSFX.setMute(true); 
        }
        this.keyboardMovement();
        //this.camera.setBounds(0, 0, this.background.displayWidth, this.background.displayHeight);
    }

    ShowAlert = async(title, description, scene) => {
        if(!this.showAlert){
            this.showAlert = true;
            this.footStepsSFX.setMute(true); 
            this.burrito.body.stop();
            this.burrito.stop();
            await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, title, description, Translate.Translate("BtnGoSiteAlert"), Translate.Translate("BtnCancelAlert"))
            .then(async (result) => {
                if(result && scene != null) {
                    localStorage.setItem("prevScene", "pradera");
                    this.scene.start(scene);
                }
            });
        }
    }
    TouchingZone(zone, overlapStart, overlapEnd){
        if(zone.body == null) return;
        let touching = !zone.body.touching.none || zone.body.embedded;
        let wasTouching = !zone.body.wasTouching.none;

        if (touching && !wasTouching) this.burrito.emit(overlapStart);
        else if (!touching && wasTouching) this.burrito.emit(overlapEnd);
    }
    async Battle(burrito, triggerZone){
        //this.sound.stopAll();
        burrito.body.stop();
        this.burrito.stop();
        this.footStepsSFX.setMute(true); 
        triggerZone.disableBody(true, true);
        triggerZone.destroy();
        await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, Translate.Translate("TleWildBurritoAlert"), Translate.Translate("MsgWildBurritoAlert"), Translate.Translate("BtnWildBurritoAlertFight"), Translate.Translate("BtnWildBurrtitoAlertEscape"))
        .then(async (result) => {
            if (result)
                this.scene.start("Battle");
        });
    }
    SetAlpha(obj, overlapStart, overlapEnd){
        const componentsButton = obj.GetComponents().list;
        this.burrito.on(overlapStart, function(){
            for (const item of componentsButton) {
                if(item.type === "Text")
                    item.visible = false;
                if(item.type === "Sprite" || item.type === "Image")
                    item.setAlpha(0.2);
            }
        });
        this.burrito.on(overlapEnd, function() {
            for (const item of componentsButton) {
                if(item.type === "Text")
                    item.visible = true;
                if(item.type === "Sprite" || item.type === "Image")
                    item.setAlpha(1);
            }
          });
    }
    PlayAnimation() {
        if(!this.burrito.anims.isPlaying) {
            let direction = {x: this.target.x -  this.burrito.x, y: this.target.y - this.burrito.y};
            let angle = this.clampAngle(Math.atan2(direction.y, direction.x) * (180 / Math.PI));

            if(angle >= 315 && angle < 360 || (angle >= 0 && angle < 45)){
                this.burrito.flipX = false;
                this.burrito.play("walkRight");
            }
            else if(angle >= 45 && angle < 135)
                this.burrito.play("walkUp");
            else if(angle >= 135 && angle < 225){
                this.burrito.flipX = true;
                this.burrito.play("walkRight");
            }
            else if(angle >= 225 && angle < 315)
                this.burrito.play("walkDown");
        }
    }
    StopAnimation(){
        if(this.burrito.anims.isPlaying)
            this.burrito.stop();
    }
    BackToMainMenu = async () => {
        localStorage.removeItem("lastScene");
        this.scene.start("MainMenu");
    }
    keyboardMovement(){
        if(this.Cursors.up.isDown || this.Cursors.down.isDown){
            this.isKeyboard = true;
            if(this.Cursors.up.isDown){
                this.velocity.y = -1;
                !this.burrito.anims.isPlaying && this.burrito.play("walkDown");
            } else if(this.Cursors.down.isDown){ 
                this.velocity.y = 1;
                !this.burrito.anims.isPlaying && this.burrito.play("walkUp");
            }
            this.angle = Math.atan2(this.velocity.y, this.velocity.x) * (180 / Math.PI);
        } else
            this.velocity.y = 0;

        if(this.Cursors.right.isDown || this.Cursors.left.isDown){
            this.isKeyboard = true;
            if(this.Cursors.right.isDown){
                this.velocity.x = 1;
                this.burrito.flipX = false;
                !this.burrito.anims.isPlaying && this.burrito.play("walkRight");
            } else if(this.Cursors.left.isDown){
                this.velocity.x = -1;
                this.burrito.flipX = true;
                !this.burrito.anims.isPlaying && this.burrito.play("walkRight");
            }
            this.angle = Math.atan2(this.velocity.y, this.velocity.x) * (180 / Math.PI);
        } else
            this.velocity.x = 0;

        if(this.isKeyboard)
            this.burrito.setVelocity(this.velocity.x * this.speed, this.velocity.y * this.speed);
    }
    clampAngle(angle){
        let result = angle - Math.ceil(angle / 360) * 360;
        if(result < 0) result += 360;
        return result;
    }
    burritoMediaToSkin = (media) => {
        switch(media){
            case "QmULzZNvTGrRxEMvFVYPf1qaBc4tQtz6c3MVGgRNx36gAq": return "electrico";
            case "QmZEK32JEbJH3rQtXL9BqQJa2omXfpjuXGjbFXLiV2Ge9D": return "planta";
            case "QmQcTRnmdFhWa1j47JZAxr5CT1Cdr5AfqdhnrGpSdr28t6": return "fuego";
            case "QmbMS3P3gn2yivKDFvHSxYjVZEZrBdxyZtnnnJ62tVuSVk": return "agua";
        }
    }
}