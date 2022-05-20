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
        this.load.image("map", "../src/images/Pradera/Map_redesign.png");
        //this.load.spritesheet("water", "../src/images/Pradera/Agua_sprites.webp", {frameWidth: 1920, frameHeight: 1080});
        //this.load.spritesheet("details", "../src/images/Pradera/Detalles_sprites.webp", {frameWidth: 1920, frameHeight: 1080});

        //this.load.image("gloves", "../src/images/fightTest.png");
        this.load.image("buttonContainer3", "../src/images/button.png");

        if(localStorage.getItem("burrito_selected") != null){
            let burritoPlayer = await Near.GetNFTToken(localStorage.getItem("burrito_selected"));
            this.load.spritesheet("miniBurrito", `../src/images/Pradera/burrito_${this.burritoMediaToSkin(burritoPlayer.media)}.png`, {frameWidth: 51, frameHeight: 53});
        }

        this.load.spritesheet("burritoHud", "../src/images/HUD/Burritos.png", {frameWidth: 215, frameHeight: 305});
        this.load.spritesheet("hud", "../src/images/HUD/HUD.png", {frameWidth: 390, frameHeight: 226});
        this.load.image("tokenHud", "../src/images/HUD/Information.png");
        this.load.spritesheet("tokenIcon", "../src/images/HUD/Tokens.png", {frameWidth: 49, frameHeight: 50});
    }
    async create(){
        this.background = this.add.image(0,0, "background").setOrigin(0).setScale(1);
        //this.anims.create({ key: "waterLoop", frameRate: 24, frames: this.anims.generateFrameNumbers("water", { start: 0, end: 22 }), repeat: -1 });
        //this.add.sprite(0, 0, "water").play("waterLoop").setOrigin(0);
        //this.map = this.add.image(0, 0, "map").setOrigin(0).setScale(1);
        this.map = this.physics.add.image(960, 540, "map");
        //this.anims.create({ key: "detailLoop", frameRate: 24, frames: this.anims.generateFrameNumbers("details", { start: 0, end: 22 }), repeat: -1 });
        //this.add.sprite(0, 0, "detail").play("detailLoop").setOrigin(0);
        new Helpers.Button(this.sys.game.scale.gameSize.width / 2,  60, 0.5, "buttonContainer3", "Volver a menu principal", this, this.BackToMainMenu, null, {fontSize: 24, fontFamily: "BangersRegular"});

        this.hudTokens = new Helpers.TokenHud(200, 200, this, await Near.GetAccountBalance(), await Near.GetSTRWToken());
        this.hudBurrito = new Helpers.BurritoHud(200, 960, await Near.GetNFTToken(localStorage.getItem("burrito_selected")), this);

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

        this.burritoPlayer = await Near.GetNFTToken(localStorage.getItem("burrito_selected"));
        if(this.burritoPlayer.hp <= 0)
            Swal.fire({ icon: 'info', title: 'Tu burrito se ha quedado sin vida', html: `El burrito seleccionado no cuenta suficiente vida, para continuar selecciona un burrito diferente para poder seguir navegando en el mapa o luchando`, confirmButtonText: 'Ir a establo' }).then(async (result) => { if (result.isConfirmed) this.scene.start("Establo"); });

        this.burrito = this.physics.add.sprite(this.sys.game.scale.gameSize.width / 2, this.sys.game.scale.gameSize.height / 2, "miniBurrito", 0).setOrigin(0.5).setScale(1).setCollideWorldBounds(true);
        this.physics.world.enable(this.burrito);
        this.burrito.setCollideWorldBounds(true);
        this.burrito.onWorldBounds = true;

        this.physics.world.setBounds(0,0,this.background.displayWidth, this.background.displayHeight, true, true, true, true);
        this.camera = this.cameras.main;

        this.anims.create({ key: 'walkUp', frames: this.anims.generateFrameNumbers('miniBurrito', { frames: [0, 1, 2] }), frameRate: 12, repeat: -1 });
        this.anims.create({ key: "walkRight", frames: this.anims.generateFrameNumbers('miniBurrito', { frames: [3, 4, 5] }), frameRate: 12, repeat: -1 })
        this.anims.create({ key: 'walkDown', frames: this.anims.generateFrameNumbers('miniBurrito', { frames: [6, 7, 8] }), frameRate: 12, repeat: -1 });
        this.burrito.play("walkRight");

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
        this.coliseoCollider = this.physics.add.overlap(this.coliseo, this.burrito, this.ShowAlert, null, this);

        await this.loadingScreen.OnComplete();
    }
    update(){        
        if(localStorage.getItem("burrito_selected")  == null || this.burrito == null || this.silo == null || Swal.isVisible())
            return;

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
}