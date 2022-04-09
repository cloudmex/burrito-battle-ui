import * as Near  from "../src/near.js";
import * as Helpers from "../src/Helpers/Helpers.js";

class Pradera extends Phaser.Scene{
    gloves;
    speed = 260;
    angle = 0;
    flag = false;

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
    }
    create(){
        this.background = this.add.image(0,0, "background").setOrigin(0).setScale(1);

        this.anims.create({ key: "waterLoop", frameRate: 24, frames: this.anims.generateFrameNumbers("water", { start: 0, end: 22 }), repeat: -1 });
        this.add.sprite(0, 0, "water").play("waterLoop").setOrigin(0);

        this.island = this.add.image(0,0, "island").setOrigin(0).setScale(1);

        this.anims.create({ key: "detailLoop", frameRate: 24, frames: this.anims.generateFrameNumbers("details", { start: 0, end: 22 }), repeat: -1 });
        this.add.sprite(0, 0, "detail").play("detailLoop").setOrigin(0);

        new Helpers.Button(this.sys.game.scale.gameSize.width / 2 + 750,  100, 0.5, "buttonContainer3", "Volver a menu principal", this, this.BackToMainMenu, null, {fontSize: 30, fontFamily: "BangersRegular"});

        this.physics.world.setBounds(0,0,this.background.displayWidth, this.background.displayHeight, true, true, true, true);
        this.camera = this.cameras.main;

        this.burrito = this.physics.add.image(this.sys.game.scale.gameSize.width / 2, this.sys.game.scale.gameSize.height / 2, "burrito");
        this.burrito.setScale(0.05);
        this.burrito.setCollideWorldBounds(true);
        this.burrito.onWorldBounds = true;

        /*this.gloves = this.physics.add.group().createMultiple(
            {
                key: "gloves",
                repeat: 1,
                setScale: { x: 0.1, y: 0.1},
                setXY:
                {
                    x: Phaser.Math.RND.between(0, 800),
                    y: Phaser.Math.RND.between(0, 600)
                }
                //setXY: {x: this.sys.game.scale.gameSize.width * Math.random(), y: this.sys.game.scale.gameSize.height * Math.random(), stepX:  }//{x: this.sys.game.scale.gameSize.width / 2 + 800, y: this.sys.game.scale.gameSize.height / 2 }
            }
        )
        this.physics.add.collider(this.gloves);

        this.collide = this.physics.add.overlap(this.burrito, this.gloves, this.battle, null, this);
        */
        this.Cursors = this.input.keyboard.createCursorKeys();
        this.velocity = {x: 0, y: 0};
        
        //this.text = this.add.text(this.sys.game.scale.gameSize.width / 2, 100, `velocity (${this.velocity.x}, ${this.velocity.y})`, {fontSize: 30, backgroundColor: 0xffffff});
        
        //this.physics.moveToObject(this.burrito, this.glove, 200)
        
        this.input.on("pointerdown", function(pointer){
            this.target.x = Number(this.input.mousePointer.worldX.toFixed(1));
            this.target.y = Number(this.input.mousePointer.worldY.toFixed(1));
            this.physics.moveToObject(this.burrito, this.target, 400);
        }, this)
    }
    target = new Phaser.Math.Vector2();
    /*async battle(burrito, glove){
        if(!this.flag){
            glove.disableBody(true, true);
            Near.CreateBattlePlayerCpu();
            console.log("pelea");
            this.flag = true;
        }
    }*/
    update(){
        this.camera.setBounds(0,0,this.background.displayWidth, this.background.displayHeight);
        this.camera.startFollow(this.burrito);
        
        this.input.on("pointerdown", this.mouseMovement);

        this.keyboardMovement();
        //this.burrito.setVelocity(this.velocity.x * this.speed, this.velocity.y * this.speed);
        this.burrito.flipY = this.angle > 90 && this.angle < 270;
        this.burrito.setAngle(this.angle);

        //this.text.setText(`velocity (${this.velocity.x}, ${this.velocity.y})\nangle: ${this.clampAngle(this.angle)}\nposition: (${this.burrito.x}, ${this.burrito.y})`);
        
        var distance = Phaser.Math.Distance.Between(this.burrito.x, this.burrito.y, this.target.x, this.target.y);
        
        if(this.burrito.body.speed > 0)
            if(distance <4)
                this.burrito.body.reset(this.target.x, this.target.y)
    }
    BackToMainMenu = () => {
        localStorage.removeItem("lastScene");
        this.scene.start("MainMenu");
    }
    mouseMovement =() => {
        this.position = { x: this.game.input.mousePointer.x, y: this.game.input.mousePointer.y };
    }
    keyboardMovement(){
        if(this.Cursors.up.isDown || this.Cursors.down.isDown){
            if(this.Cursors.up.isDown){
                this.velocity.y = -1;
            } else if(this.Cursors.down.isDown){
                this.velocity.y = 1;
            }
            this.angle = Math.atan2(this.velocity.y, this.velocity.x) * (180 / Math.PI);
        } else {
            this.velocity.y = 0;
        }

        if(this.Cursors.right.isDown || this.Cursors.left.isDown){
            if(this.Cursors.right.isDown){
                this.velocity.x = 1;
            } else if(this.Cursors.left.isDown){
                this.velocity.x = -1;
            }
            this.angle = Math.atan2(this.velocity.y, this.velocity.x) * (180 / Math.PI);
        } else {
            this.velocity.x = 0;
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