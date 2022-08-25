import * as Near  from "../src/near.js";
import * as Helpers from "../src/Helpers/Helpers.js";
import { Translate } from "../src/Translate.js";

export class NewMap extends Phaser.Scene{
    tmpX = 0;
    tmpY = 0;
    canMove = true;
    speed = 500;
    target = new Phaser.Math.Vector2();
    
    constructor(){
        super("newMap");
    }
    preload(){

    }
    create(){
        this.loadAssets();
    }
    CameraLerp(){
        if(this.burrito == null)
            return;

        let x = Math.floor(this.burrito?.x / 1920) * 1920;
        let y = Math.floor(this.burrito?.y / 1080) * 1080;

        if(x != this.tmpX || y != this.tmpY){
            console.log("must move");
            this.burrito?.body.stop();
            this.StopAnimation();
            this.canMove =false;
            this.tweens.timeline({
                duration:2000,
                delay:100,
                tweens:[{
                    targets: this.cameras.main,
                    scrollX: x,
                    scrollY: y,
                    onComplete: ()=>{this.canMove=true;}
                }]
            })
            this.tmpX = x;
            this.tmpY = y;
        }
    }
    update(){
        if(false)
            this.CameraLerp();
        else if(this.burrito != null)
            this.cameras.main.startFollow(this.burrito);

        if(this.canMove){
            let distance = Phaser.Math.Distance.Between(this.burrito?.x, this.burrito?.y, this.target?.x, this.target?.y);
            if(this.burrito?.body.speed > 0){
                this.PlayAnimation();
                if(distance < 4 && !this.isKeyboard)
                    this.burrito?.body.reset(this.target.x, this.target.y)
            } else{
                this.StopAnimation();
            }
            
            this.keyboardMovement();
        }
    }
    loadAssets(){
        this.load.image("map1_test", "../src/images/pradera test.png")
        this.load.spritesheet("miniBurrito", `../src/images/Pradera/burrito_agua.png`, {frameWidth: 51, frameHeight: 53});

        this.load.once("complete", this.start, this);
        this.load.start(); 
    }
    start(){
        let map = [
            ["map1_test", "map1_test", "map1_test", "map1_test" ],
            ["map1_test", "map1_test", "map1_test", "map1_test" ],
            ["map1_test", "map1_test", "map1_test", "map1_test" ],
            ["map1_test", "map1_test", "map1_test", "map1_test" ],
        ];
        map.forEach((row, y) => {
            row.forEach((_, x)=>{
                this.add.image(x * 1920, y * 1080, map[x][y]).setOrigin(0);
            })
        });
        this.cameras.main.setBounds(0,0, 1920 * 4, 1080 * 4);
        this.physics.world.bounds.width = 1920 * 4;
        this.physics.world.bounds.height = 1080 * 4;
        
        this.burrito = this.physics.add.sprite(this.sys.game.scale.gameSize.width / 2, this.sys.game.scale.gameSize.height / 2, "miniBurrito", 0).setOrigin(0.5).setScale(3).setCollideWorldBounds(true);
        this.burrito.setCollideWorldBounds(true);
        this.burrito.onWorldBounds = false;
        this.anims.create({ key: 'walkUp', frames: this.anims.generateFrameNumbers('miniBurrito', { frames: [0, 1, 2] }), frameRate: 12, repeat: -1 });
        this.anims.create({ key: "walkRight", frames: this.anims.generateFrameNumbers('miniBurrito', { frames: [3, 4, 5] }), frameRate: 12, repeat: -1 })
        this.anims.create({ key: 'walkDown', frames: this.anims.generateFrameNumbers('miniBurrito', { frames: [6, 7, 8] }), frameRate: 12, repeat: -1 });
        this.burrito.play("walkRight");

        this.Cursors = this.input.keyboard.createCursorKeys();
        this.velocity = {x: 0, y: 0};

        this.input.on("pointerdown", function(pointer){
            if(!this.burrito.anims.isPlaying && !Helpers?.Alert.isAlert){
                this.isKeyboard = false;
                this.target.x = Number(pointer.worldX.toFixed(1));
                this.target.y = Number(pointer.worldY.toFixed(1));
                this.physics.moveToObject(this.burrito, this.target, 500);
            }
        }, this);

        //
    }
    keyboardMovement(){
        if(this.velocity == null)
            return;
        if(this.Cursors?.up.isDown || this.Cursors?.down.isDown){
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
        if(this.burrito?.anims.isPlaying)
            this.burrito.stop();
    } 
    clampAngle(angle){
        let result = angle - Math.ceil(angle / 360) * 360;
        if(result < 0) result += 360;
        return result;
    }
}