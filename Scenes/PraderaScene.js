import * as Near  from "../src/near.js";
import * as Helpers from "../src/Helpers/Helpers.js";

class Pradera extends Phaser.Scene{
    gloves;
    speed = 200;
    angle = 0;
    flag = false;
    isKeyboard = true;
    
    constructor(){
        super("Pradera");
    }
    preload(){
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
    create(){
        var shape = this.cache.json.get('shape');
        this.background = this.add.image(0,0, "background").setOrigin(0).setScale(1);

        this.anims.create({ key: "waterLoop", frameRate: 24, frames: this.anims.generateFrameNumbers("water", { start: 0, end: 22 }), repeat: -1 });
        this.add.sprite(0, 0, "water").play("waterLoop").setOrigin(0);

        this.island = this.add.image(0,0, "island").setOrigin(0).setScale(1);
        //this.arcade.add.sprite(0,0, "", "", {shape: shape.Island})

        this.anims.create({ key: "detailLoop", frameRate: 24, frames: this.anims.generateFrameNumbers("details", { start: 0, end: 22 }), repeat: -1 });
        this.add.sprite(0, 0, "detail").play("detailLoop").setOrigin(0);

        new Helpers.Button(this.sys.game.scale.gameSize.width / 2 + 750,  100, 0.5, "buttonContainer3", "Volver a menu principal", this, this.BackToMainMenu, null, {fontSize: 30, fontFamily: "BangersRegular"});

        this.physics.world.setBounds(0,0,this.background.displayWidth, this.background.displayHeight, true, true, true, true);
        this.camera = this.cameras.main;

        this.anims.create({ key: 'walkUp', frames: this.anims.generateFrameNumbers('burrito_gris', { frames: [0, 1, 2] }), frameRate: 12, repeat: -1 });
        this.anims.create({ key: "walkRight", frames: this.anims.generateFrameNumbers('burrito_gris', { frames: [3, 4, 5] }), frameRate: 12, repeat: -1 })
        this.anims.create({ key: 'walkDown', frames: this.anims.generateFrameNumbers('burrito_gris', { frames: [6, 7, 8] }), frameRate: 12, repeat: -1 });
        this.burrito = this.physics.add.sprite(this.sys.game.scale.gameSize.width / 2, this.sys.game.scale.gameSize.height / 2).setOrigin(0.5).setScale(0.35);
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
    }
    target = new Phaser.Math.Vector2();
   
    update(){
        this.camera.setBounds(0,0,this.background.displayWidth, this.background.displayHeight);
        this.camera.startFollow(this.burrito);

        this.keyboardMovement();
        
        var distance = Phaser.Math.Distance.Between(this.burrito.x, this.burrito.y, this.target.x, this.target.y);
        
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
            var direction = {x: this.target.x -  this.burrito.x, y: this.target.y - this.burrito.y};
            var angle = this.clampAngle(Math.atan2(direction.y, direction.x) * (180 / Math.PI));

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
        var result = angle - Math.ceil(angle / 360) * 360;
        if(result < 0)
            result += 360;
        return result;
    }
}
export{ Pradera };