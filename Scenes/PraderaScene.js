import * as Near  from "../src/near.js";
import * as Helpers from "../src/Helpers/Helpers.js";

export class Pradera extends Phaser.Scene{
    gloves;
    speed = 200;
    angle = 0;
    flag = false;
    showAlert = false;
    isKeyboard = true;
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
        
        this.load.spritesheet("details", "../src/images/Pradera/Detalles.webp", {frameWidth: 1920, frameHeight: 1080});
        this.load.spritesheet("nubes", "../src/images/Pradera/Nubes.webp", {frameWidth: 1920, frameHeight: 1080});

        //this.load.image("gloves", "../src/images/fightTest.png");
        this.load.image("buttonContainer3", "../src/images/button.png");

        

        this.load.spritesheet("burritoHud", "../src/images/HUD/Burritos.png", {frameWidth: 215, frameHeight: 305});
        this.load.spritesheet("hud", "../src/images/HUD/HUD.png", {frameWidth: 390, frameHeight: 226});
        this.load.image("tokenHud", "../src/images/HUD/Information.png");
        this.load.spritesheet("tokenIcon", "../src/images/HUD/Tokens.png", {frameWidth: 49, frameHeight: 50});
    }
    async create(){
        this.background = this.add.image(0,0, "background").setOrigin(0).setScale(1);
        //this.anims.create({ key: "waterLoop", frameRate: 24, frames: this.anims.generateFrameNumbers("water", { start: 0, end: 22 }), repeat: -1 });
        //this.add.sprite(0, 0, "water").play("waterLoop").setOrigin(0);
        this.map = this.add.image(0, 0, "map").setOrigin(0).setScale(1);
        //this.map = this.physics.add.image(960, 540, "map");
        //this.anims.create({ key: "detailLoop", frameRate: 24, frames: this.anims.generateFrameNumbers("details", { start: 0, end: 22 }), repeat: -1 });
        //this.add.sprite(0, 0, "detail").play("detailLoop").setOrigin(0);

        if(localStorage.getItem("burrito_selected") == null){
            await this.loadingScreen.OnComplete();
            Swal.fire({
                icon: 'info',
                title: 'Ningun burrito seleccionado',
                html: `Para poder navegar por el mapa y luchar contra otros burritos necesitas seleccionar uno de tus burritos.<br><br>Ve al establo para poder seleccionar algun burrito de los que ya tienes o al silo para minar un nuevo burrito.`,
                showCancelButton: true,
                confirmButtonText: 'Ir a establo',
                cancelButtonText: "Ir a silo"
            }).then((result) =>{
                if(result.isConfirmed)
                    this.scene.start("Establo");
                else
                    this.scene.start("MinarBurrito");
            });
            return;
        }
        this.LoadSpriteSheet();
    }
    async LoadSpriteSheet(){
        console.log(await Near.GetNFTToken(localStorage.getItem("burrito_selected"))); 
        let burritoPlayerSkin = await Near.GetNFTToken(localStorage.getItem("burrito_selected"));
        this.load.spritesheet("miniBurrito", `../src/images/Pradera/burrito_${this.burritoMediaToSkin(burritoPlayerSkin.media)}.png`, {frameWidth: 51, frameHeight: 53});
        this.load.once("complete", this.CreateScene, this);
        this.load.start();
    }
    async CreateScene(){
        this.burritoPlayer = await Near.GetNFTToken(localStorage.getItem("burrito_selected"));
        if(this.burritoPlayer.hp <= 0)
            Swal.fire({ icon: 'info', title: 'Tu burrito se ha quedado sin vida', html: `El burrito seleccionado no cuenta suficiente vida, para continuar selecciona un burrito diferente para poder seguir navegando en el mapa o luchando`, confirmButtonText: 'Ir a establo' }).then(async (result) => { if (result.isConfirmed) this.scene.start("Establo"); });


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

        this.anims.create({ key: "detailLoop", frameRate: 24, frames: this.anims.generateFrameNumbers("details", { start: 0, end: 22 }), repeat: -1 });
        this.add.sprite(0, 0, "detail").play("detailLoop").setOrigin(0);
        this.anims.create({ key: "nubesLoop", frameRate: 24, frames: this.anims.generateFrameNumbers("nubes", { start: 0, end: 22 }), repeat: -1 });
        this.add.sprite(0, 0, "nubes").play("nubesLoop").setOrigin(0);

        this.hudTokens = new Helpers.TokenHud(200, 200, this, await Near.GetAccountBalance(), await Near.GetSTRWToken());
        this.hudBurrito = new Helpers.BurritoHud(200, 960, await Near.GetNFTToken(localStorage.getItem("burrito_selected")), this);

        this.Cursors = this.input.keyboard.createCursorKeys();
        this.velocity = {x: 0, y: 0};

        this.input.on("pointerdown", function(pointer){
            if(!this.burrito.anims.isPlaying){
                this.isKeyboard = false;
                this.target.x = Number(this.input.mousePointer.worldX.toFixed(1));
                this.target.y = Number(this.input.mousePointer.worldY.toFixed(1));
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

        this.silo = this.add.zone(460, 740, 155, 300).setRectangleDropZone(300, 300);
        this.physics.world.enable(this.silo);
        this.siloCollider = this.physics.add.overlap(this.silo, this.burrito, ()=> {this.ShowAlert("¿Quieres entrar al silo?", "Aqui puedes minar un nuevo burrito.", "MinarBurrito") }, null, this);

        this.establo = this.add.zone(255, 510, 140, 120).setRectangleDropZone(80, 80);
        this.physics.world.enable(this.establo);
        this.establoCollider = this.physics.add.overlap(this.establo, this.burrito, ()=> {this.ShowAlert("¿Quieres entrar al establo?", "Aqui podras ver tus burritos, seleccionar algun burrito, curarlos y subirlos de nivel.", "Establo") }, null, this);

        this.coliseo = this.add.zone(1595, 135, 250, 250).setRectangleDropZone(600, 600);
        this.physics.world.enable(this.coliseo);
        this.coliseoOverlap = this.physics.add.overlap(this.coliseo, this.burrito, this.stopBurrito, null, this);
        this.coliseoCollider = this.physics.add.collider(this.coliseo, this.burrito, this.ShowAlert, null, this);
        

        this.bordoIzq = this.add.zone(0, 0, 1, this.sys.game.scale.gameSize.height * 2);
        this.physics.world.enable(this.bordoIzq);
        this.bordoIzqCollider = this.physics.add.overlap(this.bordoIzq, this.burrito, this.stopBurrito, null, this);

        this.bordoDer = this.add.zone(1920, 0, 1, this.sys.game.scale.gameSize.height * 2);
        this.physics.world.enable(this.bordoDer);
        this.bordoDerCollider = this.physics.add.overlap(this.bordoDer, this.burrito, this.stopBurrito, null, this);

        this.bordoSup = this.add.zone(0, 0, this.sys.game.scale.gameSize.width * 2, 1);
        this.physics.world.enable(this.bordoSup);
        this.bordoSupCollider = this.physics.add.overlap(this.bordoSup, this.burrito, this.stopBurrito, null, this);

        this.bordoInf = this.add.zone(0, 1080, this.sys.game.scale.gameSize.width * 2, 1);
        this.physics.world.enable(this.bordoInf);
        this.bordoInfCollider = this.physics.add.overlap(this.bordoInf, this.burrito, this.stopBurrito, null, this);    

        this.hudBurritoZone = this.add.zone(0, 1080, 790, 600);
        this.physics.world.enable(this.hudBurritoZone);
        this.physics.add.overlap(this.burrito, this.hudBurritoZone, this.hudBurritoAlpha, null, this);

        this.hudTokensZone = this.add.zone(0, 0, 630, 350);
        this.physics.world.enable(this.hudTokensZone);
        this.physics.add.overlap(this.burrito, this.hudTokensZone, this.hudTokensAlpha, null, this);

        this.buttonZone = this.add.zone(960, 58, 295, 75);
        this.physics.world.enable(this.buttonZone);
        this.physics.add.overlap(this.burrito, this.buttonZone, this.buttonAlpha, null, this);

        this.siloFront = this.add.zone(456, 810, 93, 1);
        this.physics.world.enable(this.siloFront);
        this.physics.add.collider(this.burrito, this.siloFront, this.stopBurrito, null, this);

        this.establoFront = this.add.zone(254, 526, 120, 1);
        this.physics.world.enable(this.establoFront);
        this.physics.add.collider(this.burrito, this.establoFront, this.stopBurrito, null, this);

        this.castilloFront = this.add.zone(1408, 845, 335, 1);
        this.physics.world.enable(this.castilloFront);
        this.physics.add.collider(this.burrito, this.castilloFront, this.stopBurrito, null, this);

        this.molinoFront = this.add.zone(676, 338, 45, 1);
        this.physics.world.enable(this.molinoFront);
        this.physics.add.collider(this.burrito, this.molinoFront, this.stopBurrito, null, this);

        this.fogataFront1 = this.add.zone(681, 420, 55, 1);
        this.physics.world.enable(this.fogataFront1);
        this.physics.add.collider(this.burrito, this.fogataFront1, this.stopBurrito, null, this);

        this.fogataFront2 = this.add.zone(407, 166, 55, 1);
        this.physics.world.enable(this.fogataFront2);
        this.physics.add.collider(this.burrito, this.fogataFront2, this.stopBurrito, null, this);

        this.fogataFront3 = this.add.zone(776, 181, 55, 1);
        this.physics.world.enable(this.fogataFront3);
        this.physics.add.collider(this.burrito, this.fogataFront3, this.stopBurrito, null, this);

        this.arbolFront1 = this.add.zone(184, 320, 25, 1);
        this.physics.world.enable(this.arbolFront1);
        this.physics.add.collider(this.burrito, this.arbolFront1, this.stopBurrito, null, this);

        this.arbolFront2 = this.add.zone(131, 622, 25, 1);
        this.physics.world.enable(this.arbolFront2);
        this.physics.add.collider(this.burrito, this.arbolFront2, this.stopBurrito, null, this);

        this.arbolFront3 = this.add.zone(85, 862, 25, 1);
        this.physics.world.enable(this.arbolFront3);
        this.physics.add.collider(this.burrito, this.arbolFront3, this.stopBurrito, null, this);

        this.arbolFront4 = this.add.zone(414, 1068, 25, 1);
        this.physics.world.enable(this.arbolFront4);
        this.physics.add.collider(this.burrito, this.arbolFront4, this.stopBurrito, null, this);

        this.arbolFront5 = this.add.zone(695, 668, 25, 1);
        this.physics.world.enable(this.arbolFront5);
        this.physics.add.collider(this.burrito, this.arbolFront5, this.stopBurrito, null, this);

        this.arbolFront6 = this.add.zone(765, 376, 25, 1);
        this.physics.world.enable(this.arbolFront6);
        this.physics.add.collider(this.burrito, this.arbolFront6, this.stopBurrito, null, this);

        this.arbolFront7 = this.add.zone(493, 221, 25, 1);
        this.physics.world.enable(this.arbolFront7);
        this.physics.add.collider(this.burrito, this.arbolFront7, this.stopBurrito, null, this);

        this.arbolFront8 = this.add.zone(875, 215, 25, 1);
        this.physics.world.enable(this.arbolFront8);
        this.physics.add.collider(this.burrito, this.arbolFront8, this.stopBurrito, null, this);

        this.arbolFront9 = this.add.zone(843, 28, 25, 1);
        this.physics.world.enable(this.arbolFront9);
        this.physics.add.collider(this.burrito, this.arbolFront9, this.stopBurrito, null, this);

        this.cactusFront1 = this.add.zone(1231.5, 291, 14, 1);
        this.physics.world.enable(this.cactusFront1);
        this.physics.add.collider(this.burrito, this.cactusFront1, this.stopBurrito, null, this);

        this.cactusFront2 = this.add.zone(1368.5, 61, 14, 1);
        this.physics.world.enable(this.cactusFront2);
        this.physics.add.collider(this.burrito, this.cactusFront2, this.stopBurrito, null, this);

        this.cactusFront3 = this.add.zone(1726.5, 420, 14, 1);
        this.physics.world.enable(this.cactusFront3);
        this.physics.add.collider(this.burrito, this.cactusFront3, this.stopBurrito, null, this);

        this.cactusFront4 = this.add.zone(1847.5, 311, 14, 1);
        this.physics.world.enable(this.cactusFront4);
        this.physics.add.collider(this.burrito, this.cactusFront4, this.stopBurrito, null, this);

        this.ramasFront1 = this.add.zone(1148.5, 726, 14, 1);
        this.physics.world.enable(this.ramasFront1);
        this.physics.add.collider(this.burrito, this.ramasFront1, this.stopBurrito, null, this);

        this.ramasFront2 = this.add.zone(1222.5, 1029, 14, 1);
        this.physics.world.enable(this.ramasFront2);
        this.physics.add.collider(this.burrito, this.ramasFront2, this.stopBurrito, null, this);

        this.ramasFront3 = this.add.zone(1637.5, 1048, 14, 1);
        this.physics.world.enable(this.ramasFront3);
        this.physics.add.collider(this.burrito, this.ramasFront3, this.stopBurrito, null, this);

        this.ramasFront4 = this.add.zone(1722.5, 860, 14, 1);
        this.physics.world.enable(this.ramasFront4);
        this.physics.add.collider(this.burrito, this.ramasFront4, this.stopBurrito, null, this);

        this.ramasFront5 = this.add.zone(1669.5, 627, 14, 1);
        this.physics.world.enable(this.ramasFront5);
        this.physics.add.collider(this.burrito, this.ramasFront5, this.stopBurrito, null, this);

        await this.loadingScreen.OnComplete();
    }
    update(){        
        if(localStorage.getItem("burrito_selected")  == null || this.burrito == null || this.burrito.body == null || this.silo == null || Swal.isVisible() || this.touching)
            return;

        this.touchingHudBurritoZone();
        this.touchingHudTokensZone();
        this.touchingButtonZone();
        this.immovableZones();
        
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
    burritoMediaToSkin = (media) => {
        switch(media){
            case "QmULzZNvTGrRxEMvFVYPf1qaBc4tQtz6c3MVGgRNx36gAq": return "electrico";
            case "QmZEK32JEbJH3rQtXL9BqQJa2omXfpjuXGjbFXLiV2Ge9D": return "planta";
            case "QmQcTRnmdFhWa1j47JZAxr5CT1Cdr5AfqdhnrGpSdr28t6": return "fuego";
            case "QmbMS3P3gn2yivKDFvHSxYjVZEZrBdxyZtnnnJ62tVuSVk": return "agua";
        }
    }
    ShowAlert = (title, description, scene) => {
        if(!this.showAlert){
            
            this.burrito.body.stop();
            this.burrito.stop();
            Swal.fire({
                icon: 'info',
                title: title,
                html: description,
                showCancelButton: true,
                confirmButtonText: 'Entrar',
            }).then((result) => {
                if(result.isConfirmed) this.scene.start(scene);
            })
            this.showAlert = true;
        }
    }
    Battle(burrito, triggerZone){
        burrito.body.stop();
        this.burrito.stop();
        triggerZone.disableBody(true, true);
        triggerZone.destroy();
        Swal.fire({
            icon: 'info',
            title: 'Burrito salvaje ha aparecido',
            html: `Un burrito salvaje ha aparecido, ¿deseas enfrentarte a el?<br><br>Se desconoce el nivel y las estadisticas del burrito, una vez entrando en combate si huyes, se te restara una vida.`,
            showCancelButton: true,
            confirmButtonText: 'Pelear',
            cancelButtonText: "Huir"
          }).then((result) => {
            if (result.isConfirmed) this.GoToBattle();
          })
    }
    GoToBattle(){
        this.scene.start("Battle");
    }
    
    PlayAnimation() {
        if(!this.burrito.anims.isPlaying) {
            let direction = {x: this.target.x -  this.burrito.x, y: this.target.y - this.burrito.y};
            let angle = this.clampAngle(Math.atan2(direction.y, direction.x) * (180 / Math.PI));

            if(angle >= 315 && angle < 360 || (angle >= 0 && angle < 45)){
                this.burrito.flipX = false;
                this.burrito.play("walkRight");
            }
            else if(angle >= 45 && angle < 135){
                this.burrito.play("walkUp");
            }
            else if(angle >= 135 && angle < 225){
                this.burrito.flipX = true;
                this.burrito.play("walkRight");
            }
            else if(angle >= 225 && angle < 315){
                this.burrito.play("walkDown");
            }
        }
    }
    StopAnimation(){
        if(this.burrito.anims.isPlaying)
            this.burrito.stop();
    }
    BackToMainMenu = () => {
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
        this.burrito.stop();
        this.burrito.body.stop();
    }

    touchingHudBurritoZone(){
        if(this.hudBurritoZone.body == null)
            return;
        let touching = !this.hudBurritoZone.body.touching.none || this.hudBurritoZone.body.embedded;
        let wasTouching = !this.hudBurritoZone.body.wasTouching.none;

        if (touching && !wasTouching) this.burrito.emit("overlapHudBurritoStart");
        else if (!touching && wasTouching) this.burrito.emit("overlapHudBurritoEnd");
    }

    hudBurritoAlpha(){
        const componentsHudBurrito = this.hudBurrito.GetComponents().list;
        this.burrito.on("overlapHudBurritoStart", function(){
            for (const item of componentsHudBurrito) {
                if(item.type === "Text") {
                    item.visible = false        
                }
                if(item.type === "Image"){
                    item.setAlpha(0.2);
                }
            }
        });
        this.burrito.on("overlapHudBurritoEnd", function() {
            for (const item of componentsHudBurrito) {
                if(item.type === "Text") {
                    item.visible = true        
                }
                if(item.type === "Image"){
                    item.setAlpha(1);
                }
            }
          });
    }

    touchingHudTokensZone(){
        if(this.hudTokensZone.body == null)
            return;
        let touching = !this.hudTokensZone.body.touching.none || this.hudTokensZone.body.embedded;
        let wasTouching = !this.hudTokensZone.body.wasTouching.none;

        if (touching && !wasTouching) this.burrito.emit("overlapHudTokensStart");
        else if (!touching && wasTouching) this.burrito.emit("overlapHudTokensEnd");
    }

    hudTokensAlpha(){
        const componentsHudTokens = this.hudTokens.GetComponents().list;
        this.burrito.on("overlapHudTokensStart", function(){
            for (const item of componentsHudTokens) {
                if(item.type === "Text") {
                    item.visible = false        
                }
                if(item.type === "Image"){
                    item.setAlpha(0.2);
                }
            }
        });
        this.burrito.on("overlapHudTokensEnd", function() {
            for (const item of componentsHudTokens) {
                if(item.type === "Text") {
                    item.visible = true        
                }
                if(item.type === "Image"){
                    item.setAlpha(1);
                }
            }
          });
    }

    touchingButtonZone(){
        if(this.buttonZone.body == null)
            return;
        let touching = !this.buttonZone.body.touching.none || this.buttonZone.body.embedded;
        let wasTouching = !this.buttonZone.body.wasTouching.none;

        if (touching && !wasTouching) this.burrito.emit("overlapButtonStart");
        else if (!touching && wasTouching) this.burrito.emit("overlapButtonEnd");
    }

    buttonAlpha(){
        const componentsButton = this.button.GetComponents().list;
        this.burrito.on("overlapButtonStart", function(){
            for (const item of componentsButton) {
                if(item.type === "Text") {
                    item.visible = false        
                }
                if(item.type === "Sprite"){
                    item.setAlpha(0.2);
                }
            }
        });
        this.burrito.on("overlapButtonEnd", function() {
            for (const item of componentsButton) {
                if(item.type === "Text") {
                    item.visible = true        
                }
                if(item.type === "Sprite"){
                    item.setAlpha(1);
                }
            }
          });
    }

    immovableZones(){
        if(this.siloFront.body == null || this.establoFront.body == null || this.coliseo.body == null || this.castilloFront.body == null || this.molinoFront.body == null || this.fogataFront1.body == null || this.fogataFront2.body == null || this.fogataFront3.body == null || this.arbolFront1.body == null || this.arbolFront2.body == null || this.arbolFront3.body == null || this.arbolFront4.body == null || this.arbolFront5.body == null || this.arbolFront6.body == null || this.arbolFront7.body == null || this.arbolFront8.body == null || this.arbolFront9.body == null || this.cactusFront1.body == null || this.cactusFront2.body == null || this.cactusFront3.body == null || this.cactusFront4.body == null || this.ramasFront1.body == null || this.ramasFront2.body == null || this.ramasFront3.body == null || this.ramasFront4.body == null || this.ramasFront5.body == null)
            return;
        this.siloFront.body.setImmovable(true);
        this.establoFront.body.setImmovable(true);
        this.coliseo.body.setImmovable(true);
        this.castilloFront.body.setImmovable(true);
        this.molinoFront.body.setImmovable(true);
        this.fogataFront1.body.setImmovable(true);
        this.fogataFront2.body.setImmovable(true);
        this.fogataFront3.body.setImmovable(true);
        this.arbolFront1.body.setImmovable(true);
        this.arbolFront2.body.setImmovable(true);
        this.arbolFront3.body.setImmovable(true);
        this.arbolFront4.body.setImmovable(true);
        this.arbolFront5.body.setImmovable(true);
        this.arbolFront6.body.setImmovable(true);
        this.arbolFront7.body.setImmovable(true);
        this.arbolFront8.body.setImmovable(true);
        this.arbolFront9.body.setImmovable(true);
        this.cactusFront1.body.setImmovable(true);
        this.cactusFront2.body.setImmovable(true);
        this.cactusFront3.body.setImmovable(true);
        this.cactusFront4.body.setImmovable(true);
        this.ramasFront1.body.setImmovable(true);
        this.ramasFront2.body.setImmovable(true);
        this.ramasFront3.body.setImmovable(true);
        this.ramasFront4.body.setImmovable(true);
        this.ramasFront5.body.setImmovable(true);
    }
}