import * as Near  from "../src/near.js";
import * as Helpers from "../src/Helpers/Helpers.js";

class Pradera extends Phaser.Scene{
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
    preload(){
        this.load.spritesheet("loading_screen", "../src/images/Loading_screen sprite.webp", { frameWidth: 512, frameHeight: 512 });
        this.load.image("loading_bg", "../src/images/loading_bg.png");
        this.loadingScreen = new Helpers.LoadingScreen(this);

        this.load.image("background", "../src/images/Pradera/Map background.png");
        this.load.image("island", "../src/images/Pradera/Island.png");
        this.load.spritesheet("water", "../src/images/Pradera/Agua_sprites.webp", {frameWidth: 1920, frameHeight: 1080});
        this.load.spritesheet("details", "../src/images/Pradera/Detalles_sprites.webp", {frameWidth: 1920, frameHeight: 1080});

        this.load.image("burrito", "../src/images/Burrito Agua.png");
        this.load.image("gloves", "../src/images/fightTest.png");
        this.load.image("buttonContainer3", "../src/images/button.png");

        this.load.spritesheet("burrito_gris", "../src/images/Pradera/Gris_sprites.png", {frameWidth: 213, frameHeight: 222})
        this.load.json('shape', '../src/images/Pradera/Island.json');
    }
    async create(){
        let shape = this.cache.json.get('shape');
        this.background = this.add.image(0,0, "background").setOrigin(0).setScale(1);

        this.anims.create({ key: "waterLoop", frameRate: 24, frames: this.anims.generateFrameNumbers("water", { start: 0, end: 22 }), repeat: -1 });
        this.add.sprite(0, 0, "water").play("waterLoop").setOrigin(0);

        this.island = this.add.image(0,0, "island").setOrigin(0).setScale(1);
        
        //this.matter.add.fromPhysicsEditor(0, 0, shape.Island, { isStatic: true})

        this.anims.create({ key: "detailLoop", frameRate: 24, frames: this.anims.generateFrameNumbers("details", { start: 0, end: 22 }), repeat: -1 });
        this.add.sprite(0, 0, "detail").play("detailLoop").setOrigin(0);

        new Helpers.Button(this.sys.game.scale.gameSize.width / 2 + 750,  100, 0.5, "buttonContainer3", "Volver a menu principal", this, this.BackToMainMenu, null, {fontSize: 30, fontFamily: "BangersRegular"});

        this.physics.world.setBounds(0,0,this.background.displayWidth, this.background.displayHeight, true, true, true, true);
        this.camera = this.cameras.main;

        this.anims.create({ key: 'walkUp', frames: this.anims.generateFrameNumbers('burrito_gris', { frames: [0, 1, 2] }), frameRate: 12, repeat: -1 });
        this.anims.create({ key: "walkRight", frames: this.anims.generateFrameNumbers('burrito_gris', { frames: [3, 4, 5] }), frameRate: 12, repeat: -1 })
        this.anims.create({ key: 'walkDown', frames: this.anims.generateFrameNumbers('burrito_gris', { frames: [6, 7, 8] }), frameRate: 12, repeat: -1 });
        this.burrito = this.physics.add.sprite(this.sys.game.scale.gameSize.width / 2, this.sys.game.scale.gameSize.height / 2, "burrito_gris", 0).setOrigin(0.5).setScale(0.35).setCollideWorldBounds(true);
        
        this.physics.world.enable(this.burrito);

        //this.burrito.body.setSize(this.burrito.width * (1/0.35) * 2, this.burrito.height * (1/0.35) * 2)
        this.burrito.play("walkRight");
        this.burrito.setCollideWorldBounds(true);
        this.burrito.onWorldBounds = true;

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
        this.detailText = this.add.text(100,100)

        this.silo = this.add.zone(700, 700, 100, 100).setRectangleDropZone(300, 300);
        this.physics.world.enable(this.silo);
        this.siloCollider = this.physics.add.overlap(this.silo, this.burrito, ()=> {this.ShowAlert("¿Quieres entrar al silo?", "Aqui puedes minar un nuevo burrito", "MinarBurrito") }, null, this);

        this.establo = this.add.zone(580, 550, 80, 80).setRectangleDropZone(80, 80);
        this.physics.world.enable(this.establo);
        this.establoCollider = this.physics.add.overlap(this.establo, this.burrito, ()=> {this.ShowAlert("¿Quieres entrar al establo?", "Aqui podras ver tus burritos, seleccionar algun burrito, curarlos y subirlos de nivel", "Establo") }, null, this);

        this.coliseo = this.add.zone(1280, 300, 200, 200).setRectangleDropZone(600, 600);
        this.physics.world.enable(this.coliseo);
        this.coliseoCollider = this.physics.add.overlap(this.coliseo, this.burrito, this.ShowAlert, null, this);

        await this.loadingScreen.OnComplete();
    }
   
    ShowAlert = (title, description, scene) => {
        if(!this.showAlert){
            Swal.fire({
                icon: 'info',
                title: title,
                html: description,
                showCancelButton: true,
                confirmButtonText: 'Entrar',
            }).then((result) => {
                if(result.isConfirmed)
                    this.scene.start(scene);
            })
            this.showAlert = true;
        }
    }
    Battle(burrito, triggerZone){
        triggerZone.disableBody(true, true);
        triggerZone.destroy();
        Swal.fire({
            icon: 'info',
            title: 'Burrito salvaje ha aparecido',
            html: `Un burrito salvaje ha aparecido, ¿deseas enfrentarte a el?<br>Se desconoce el nivel y las estadisticas del burrito, una vez entrando en combate si huyes, se te restara una vida`,
            showCancelButton: true,
            confirmButtonText: 'Pelear',
            cancelButtonText: "Huir"
          }).then((result) => {
            if (result.isConfirmed) {
                this.GoToBattle();
            }
          })
    }
    GoToBattle(){
        this.scene.start("Battle");
    }
    update(){        
        this.showAlert = Phaser.Geom.Intersects.RectangleToRectangle(this.burrito.getBounds(), this.silo.getBounds()) | Phaser.Geom.Intersects.RectangleToRectangle(this.burrito.getBounds(), this.establo.getBounds()) | Phaser.Geom.Intersects.RectangleToRectangle(this.burrito.getBounds(), this.coliseo.getBounds());
        this.camera.setBounds(0,0,this.background.displayWidth, this.background.displayHeight);
        this.camera.startFollow(this.burrito);

        this.keyboardMovement();
        
        let distance = Phaser.Math.Distance.Between(this.burrito.x, this.burrito.y, this.target.x, this.target.y);
        
        if(this.burrito.body.speed > 0){
            this.PlayAnimation();
            if(distance < 4 && !this.isKeyboard)
                this.burrito.body.reset(this.target.x, this.target.y)
        } else{
            this.StopAnimation();
        }
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
        if(this.burrito.anims.isPlaying) {
            this.burrito.stop();
        }
    }
    BackToMainMenu = () => {
        localStorage.removeItem("lastScene");
        this.scene.start("MainMenu");
    }
    MouseMovement(){

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
        } else {
            this.velocity.y = 0;
        }

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
        } else {
            this.velocity.x = 0;
        }
        if(this.isKeyboard){
            this.burrito.setVelocity(this.velocity.x * this.speed, this.velocity.y * this.speed);
        }
    }
    clampAngle(angle){
        let result = angle - Math.ceil(angle / 360) * 360;
        if(result < 0)
            result += 360;
        return result;
    }
}
export{ Pradera };