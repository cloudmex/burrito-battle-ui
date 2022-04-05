import * as Near  from "../src/near.js";
import * as Helpers from "../src/Helpers/Helpers.js";
class Pradera extends Phaser.Scene{
    gloves;
    speed = 260;
    angle = 0;
    constructor(){
        super("Pradera");
    }
    preload(){
        this.load.image("map", "../src/images/Mapa.png");
        this.load.image("burrito", "../src/images/Burrito Agua.png");
        this.load.image("gloves", "../src/images/fightTest.png");
        this.load.image("buttonContainer3", "../src/images/button.png");
    }
    create(){
        this.background = this.add.image(0,0, "map").setOrigin(0).setScale(2);
        new Helpers.Button(this.sys.game.scale.gameSize.width / 2 + 750,  100, 0.5, "buttonContainer3", "Volver a menu principal", this, this.BackToMainMenu, null, {fontSize: 30, fontFamily: "BangersRegular"});
        this.physics.world.setBounds(0,0,this.background.displayWidth, this.background.displayHeight, true, true, true, true);
        this.camera = this.cameras.main;

        this.burrito = this.physics.add.sprite(this.sys.game.scale.gameSize.width / 2, this.sys.game.scale.gameSize.height / 2, "burrito");
        this.burrito.setScale(0.25);
        this.burrito.setCollideWorldBounds(true);
        this.burrito.onWorldBounds = true;

        this.gloves = this.physics.add.group().createMultiple(
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
        this

        this.collide = this.physics.add.overlap(this.burrito, this.gloves, this.battle, null, this);
        
        this.Cursors = this.input.keyboard.createCursorKeys();
        this.velocity = {x: 0, y: 0};
        
        this.text = this.add.text(this.sys.game.scale.gameSize.width / 2, 100, `velocity (${this.velocity.x}, ${this.velocity.y})`, {fontSize: 30, backgroundColor: 0xffffff});
    }
    flag = false;
    async battle(burrito, glove){
        if(!this.flag){
            glove.disableBody(true, true);
            Near.GetBattleActiveCpu();
            //Near.CreateBattlePlayerCpu();
            console.log("pelea");
            this.flag = true;
        }
    }
    update(){
        this.camera.setBounds(0,0,this.background.displayWidth, this.background.displayHeight);
        this.camera.startFollow(this.burrito);
        
        this.input.on("pointerdown", this.mouseMovement);

        this.keyboardMovement();
        this.burrito.setVelocity(this.velocity.x * this.speed, this.velocity.y * this.speed);
        this.burrito.flipY = this.angle > 90 && this.angle < 270;
        this.burrito.setAngle(this.angle);

        this.text.setText(`velocity (${this.velocity.x}, ${this.velocity.y})\nangle: ${this.clampAngle(this.angle)}`);
    }
    BackToMainMenu = () =>{
        localStorage.removeItem("lastScene");
        this.scene.start("MainMenu");
    }
    mouseMovement =() => {
        this.position = { x: this.game.input.mousePointer.x, y: this.game.input.mousePointer.y };
        //console.log(JSON.stringify(this.position));
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