import * as Near  from "../src/near.js";
import * as Helpers from "../src/Helpers/Helpers.js";

export class Pradera extends Phaser.Scene{
    gloves;
    speed = 200;
    angle = 0;
    flag = false;
    showAlert = false;
    alertVisible = false;
    isKeyboard = true;
    coliseoImage;
    target = new Phaser.Math.Vector2();
    
    constructor(){
        super("Pradera");
    }
    
    async preload(){
        this.load.spritesheet("loading_screen_1", `../src/images/loading_screen_1.webp`, { frameWidth: 720, frameHeight: 512 });
        this.load.spritesheet("loading_screen_2", `../src/images/loading_screen_2.webp`, { frameWidth: 512, frameHeight: 512 });
        this.load.image("loading_bg", "../src/images/loading_bg.png");
        this.loadingScreen = new Helpers.LoadingScreen(this);

        this.load.image("background", "../src/images/Pradera/Map background.png");
        //this.load.image("island", "../src/images/Pradera/Island.png");
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

        //this.load.image("gloves", "../src/images/fightTest.png");
        this.load.image("buttonContainer3", "../src/images/button.png");
        this.load.image("alert", "../src/images/Información 1.png");
        

        this.load.spritesheet("burritoHud", "../src/images/HUD/Burritos.png", {frameWidth: 215, frameHeight: 305});
        this.load.spritesheet("hud", "../src/images/HUD/HUD.png", {frameWidth: 390, frameHeight: 226});
        this.load.image("tokenHud", "../src/images/HUD/Information.png");
        this.load.spritesheet("tokenIcon", "../src/images/HUD/Tokens.png", {frameWidth: 49, frameHeight: 50});
    }
    async create(){
        this.background = this.add.image(0,0, "background").setOrigin(0).setScale(1);
        this.map = this.add.image(0, 0, "map").setOrigin(0).setScale(1);
        this.add.image(0, 0, "edificiosBase").setOrigin(0).setScale(1);
        let incursion = await Near.GetActiveIncursion(); console.log(incursion);

        if(incursion.status == "WaitingPlayers"){
            this.anims.create({ key: "coliseoIncursionWaitLoop", frameRate: 30, frames: this.anims.generateFrameNumbers("coliseoIncursionWait", { start: 0, end: 74 }), repeat: -1 });
            this.add.sprite(1265, -185, "coliseoIncursionWait").play("coliseoIncursionWaitLoop").setOrigin(0);
        } else{
            this.coliseoImage = this.add.image(1475, 25, `coliseo${incursion.status}`).setOrigin(0).setScale(1);
        }
        await this.loadingScreen.OnComplete();

        if(localStorage.getItem("burrito_selected") == null){
                await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, "Ningun burrito seleccionado", "Para poder navegar por el mapa y luchar contra otros burritos necesitas seleccionar uno de tus burritos.Ve al establo para poder seleccionar algun burrito de los que ya tienes o al silo para minar un nuevo burrito.", "Ir a establo", "Ir a silo")
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
        if(this.burritoPlayer.hp <= 0)
            await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, "Tu burrito se ha quedado sin vida", "El burrito seleccionado no cuenta suficiente vida, para continuar selecciona un burrito diferente para poder seguir navegando en el mapa o luchando.", "Ir a establo")
            .then(async (result) => { if (result) this.scene.start("Establo"); });

        console.log(await Near.GetActiveIncursion());

        this.burrito = this.physics.add.sprite(this.sys.game.scale.gameSize.width / 2, this.sys.game.scale.gameSize.height / 2, "miniBurrito", 0).setOrigin(0.5).setScale(1).setCollideWorldBounds(true);
        this.physics.world.enable(this.burrito);
        this.burrito.setCollideWorldBounds(true);
        this.burrito.onWorldBounds = true;

        this.physics.world.setBounds(0,0,this.background.displayWidth, this.background.displayHeight, true, true, true, true);
        this.camera = this.cameras.main;

        this.add.image(0, 0, "arboles").setOrigin(0).setScale(1);
        this.add.image(0, 0, "edificiosSup").setOrigin(0).setScale(1);

        this.anims.create({ key: 'walkUp', frames: this.anims.generateFrameNumbers('miniBurrito', { frames: [0, 1, 2] }), frameRate: 12, repeat: -1 });
        this.anims.create({ key: "walkRight", frames: this.anims.generateFrameNumbers('miniBurrito', { frames: [3, 4, 5] }), frameRate: 12, repeat: -1 })
        this.anims.create({ key: 'walkDown', frames: this.anims.generateFrameNumbers('miniBurrito', { frames: [6, 7, 8] }), frameRate: 12, repeat: -1 });
        this.burrito.play("walkRight");

        this.button = new Helpers.Button(this.sys.game.scale.gameSize.width / 2,  60, 0.5, "buttonContainer3", "Volver a menu principal", this, this.BackToMainMenu, null, {fontSize: 24, fontFamily: "BangersRegular"});

        this.anims.create({ key: "detailLoop", frameRate: 24, frames: this.anims.generateFrameNumbers("details", { start: 0, end: 29 }), repeat: -1 });
        this.add.sprite(0, 0, "detail").play("detailLoop").setOrigin(0);
        this.anims.create({ key: "nubesLoop", frameRate: 24, frames: this.anims.generateFrameNumbers("nubes", { start: 0, end: 29 }), repeat: -1 });
        this.add.sprite(0, 0, "nubes").play("nubesLoop").setOrigin(0);

        this.hudTokens = new Helpers.TokenHud(200, 200, this, await Near.GetAccountBalance(), await Near.GetSTRWToken());
        this.hudBurrito = new Helpers.BurritoHud(200, 960, await Near.GetNFTToken(localStorage.getItem("burrito_selected")), this);

        this.Cursors = this.input.keyboard.createCursorKeys();
        this.velocity = {x: 0, y: 0};

        this.input.on("pointerdown", function(pointer){
            if(!this.burrito.anims.isPlaying && !Helpers.Alert.isAlert){
                this.isKeyboard = false;
                console.log(pointer);
                //this.target.x = Number(this.input.mousePointer.worldX.toFixed(1));
                //this.target.y = Number(this.input.mousePointer.worldY.toFixed(1));
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

        this.silo = this.add.zone(460, 740, 155, 300);
        this.physics.world.enable(this.silo);
        this.physics.add.overlap(this.burrito, this.silo, ()=>{ this.ShowAlert("¿Quieres entrar al silo?", "Aqui puedes minar un nuevo burrito.", "MinarBurrito") });

        this.establo = this.add.zone(255, 510, 140, 120);
        this.physics.world.enable(this.establo);
        this.physics.add.overlap(this.establo, this.burrito, ()=> { this.ShowAlert("¿Quieres entrar al establo?", "Aqui podras ver tus burritos, seleccionar algun burrito, curarlos y subirlos de nivel.", "MinarBurrito") });

        this.coliseo = this.add.zone(1595, 135, 250, 250).setRectangleDropZone(600, 600);
        this.physics.world.enable(this.coliseo);
        this.physics.add.overlap(this.coliseo, this.burrito,()=>{ this.ShowAlert("¿Quieres entrar al Coliseo?", "Aqui puedes participar en incursiones.", "Test") });

        //this.coliseoCollider = this.physics.add.collider(this.coliseo, this.burrito, this.stopBurrito, null, this);
        
        
        this.hudBurritoZone = this.add.zone(0, 1080, 790, 600);
        this.physics.world.enable(this.hudBurritoZone);
        this.physics.add.overlap(this.burrito, this.hudBurritoZone, this.hudBurritoAlpha, null, this);

        this.hudTokensZone = this.add.zone(0, 0, 630, 350);
        this.physics.world.enable(this.hudTokensZone);
        this.physics.add.overlap(this.burrito, this.hudTokensZone, this.hudTokensAlpha, null, this);

        this.buttonZone = this.add.zone(960, 58, 295, 75);
        this.physics.world.enable(this.buttonZone);
        this.physics.add.overlap(this.burrito, this.buttonZone, this.buttonAlpha, null, this)
        
        let detailGroup = [];
        let details = [
            {x:this.game.config.width/2, y:0, w:this.game.config.width, h:1}, {x:this.game.config.width, y:this.game.config.height/2, w:1, h:this.game.config.height }, {x:this.game.config.width/2, y:this.game.config.height, w:this.game.config.width, h:1}, {x:0, y:this.game.config.height/2, w:1, h:this.game.config.height },
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

        this.touchingHudBurritoZone();
        this.touchingHudTokensZone();
        this.touchingButtonZone();

        this.showAlert = Phaser.Geom.Intersects.RectangleToRectangle(this.burrito.getBounds(), this.silo.getBounds()) | Phaser.Geom.Intersects.RectangleToRectangle(this.burrito.getBounds(), this.establo.getBounds()) | Phaser.Geom.Intersects.RectangleToRectangle(this.burrito.getBounds(), this.coliseo.getBounds());
        let distance = Phaser.Math.Distance.Between(this.burrito.x, this.burrito.y, this.target.x, this.target.y);
        if(this.burrito.body.speed > 0){
            this.PlayAnimation();
            if(distance < 4 && !this.isKeyboard)
                this.burrito.body.reset(this.target.x, this.target.y)
        } else
            this.StopAnimation();
            
        this.keyboardMovement();
        this.camera.setBounds(0, 0, this.background.displayWidth, this.background.displayHeight);
    }

    ShowAlert = async(title, description, scene) => {
        if(!this.showAlert){
            this.showAlert = true;
            this.burrito.body.stop();
            this.burrito.stop();
            await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, title, description, "Entrar", "Cancelar")
            .then(async (result) => {
                if(result && scene != null) {
                    localStorage.setItem("prevScene", "pradera");
                    this.scene.start(scene);
                }
            });
        }
    }
    touchingHudBurritoZone(){
        if(this.hudBurritoZone.body == null)
            return;
        let touching = !this.hudBurritoZone.body.touching.none || this.hudBurritoZone.body.embedded;
        let wasTouching = !this.hudBurritoZone.body.wasTouching.none;

        if (touching && !wasTouching) this.burrito.emit("overlapHudBurritoStart");
        else if (!touching && wasTouching) this.burrito.emit("overlapHudBurritoEnd");
    }
    touchingHudTokensZone(){
        if(this.hudTokensZone.body == null)
            return;
        let touching = !this.hudTokensZone.body.touching.none || this.hudTokensZone.body.embedded;
        let wasTouching = !this.hudTokensZone.body.wasTouching.none;

        if (touching && !wasTouching) this.burrito.emit("overlapHudTokensStart");
        else if (!touching && wasTouching) this.burrito.emit("overlapHudTokensEnd");
    } touchingButtonZone(){
        if(this.buttonZone.body == null)
            return;
        let touching = !this.buttonZone.body.touching.none || this.buttonZone.body.embedded;
        let wasTouching = !this.buttonZone.body.wasTouching.none;

        if (touching && !wasTouching) this.burrito.emit("overlapButtonStart");
        else if (!touching && wasTouching) this.burrito.emit("overlapButtonEnd");
    }
    hudBurritoAlpha(){
        const componentsHudBurrito = this.hudBurrito.GetComponents().list;
        this.burrito.on("overlapHudBurritoStart", function(){
            for (const item of componentsHudBurrito) {
                if(item.type === "Text")
                    item.visible = false        
                
                if(item.type === "Image")
                    item.setAlpha(0.2);
            }
        });
        this.burrito.on("overlapHudBurritoEnd", function() {
            for (const item of componentsHudBurrito) {
                if(item.type === "Text")
                    item.visible = true;
                if(item.type === "Image")
                    item.setAlpha(1);
            }
          });
    }
    hudTokensAlpha(){
        const componentsHudTokens = this.hudTokens.GetComponents().list;
        this.burrito.on("overlapHudTokensStart", function(){
            for (const item of componentsHudTokens) {
                if(item.type === "Text")
                    item.visible = false;
                if(item.type === "Image")
                    item.setAlpha(0.2);
            }
        });
        this.burrito.on("overlapHudTokensEnd", function() {
            for (const item of componentsHudTokens) {
                if(item.type === "Text")
                    item.visible = true;
                if(item.type === "Image")
                    item.setAlpha(1);
            }
          });
    }
    async Battle(burrito, triggerZone){
        burrito.body.stop();
        this.burrito.stop();
        triggerZone.disableBody(true, true);
        triggerZone.destroy();
        await Helpers.Alert.Fire(this, this.game.config.width / 2, this.game.config.height / 2, "Burrito salvaje ha aparecido", "Un burrito salvaje ha aparecido, ¿deseas enfrentarte a el?\nSe desconoce el nivel y las estadisticas del burrito, una vez entrando en combate si huyes, se te restara una vida.", "Pelear", "Huir")
        .then(async (result) => {
            if (result.isConfirmed)
                this.GoToBattle();
        });
    }
    buttonAlpha(){
        const componentsButton = this.button.GetComponents().list;
        this.burrito.on("overlapButtonStart", function(){
            for (const item of componentsButton) {
                if(item.type === "Text")
                    item.visible = false;
                if(item.type === "Sprite")
                    item.setAlpha(0.2);
            }
        });
        this.burrito.on("overlapButtonEnd", function() {
            for (const item of componentsButton) {
                if(item.type === "Text")
                    item.visible = true;
                if(item.type === "Sprite")
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
        await Near.DeleteAllIncursions();
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
    stopBurrito(){
        this.burrito?.stop();
        this.burrito?.body.stop();
    }
    GoToBattle(){
        this.scene.start("Battle");
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