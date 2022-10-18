import { Button, Alert, LoadingScreen, Card, TokenHud, DialogueBox } from '../Helpers/Helpers.js'
import * as Near from '../Near.js';
import { Translate } from '../Language/Translate.js'

export default class Hospital extends Phaser.Scene{
    counter = 0;
    canMove = true;
    speed = 150;
    target = new Phaser.Math.Vector2();
    showAlert = false;

    constructor(){
        super("Hospital");
    }
    preload(){ 
        this.game.sound.stopAll();
        this.sound.removeAll();
     }
    create(){
        this.loadAssets();
    }
    async loadAssets(){
        if(localStorage.getItem("burrito_selected") != null){
            //let burritoPlayerSkin = await Near.GetNFTToken(localStorage.getItem("burrito_selected"));
            //this.load.spritesheet("miniBurrito", `../src/images/Pradera/burrito_${this.burritoMediaToSkin(burritoPlayerSkin.media)}.png`, {frameWidth: 51, frameHeight: 53});
        }
        this.load.spritesheet("miniBurrito", '../src/assets/Images/Pradera/burrito_agua.png', {frameWidth: 51, frameHeight: 53});

        this.load.spritesheet("capsulas", '../src/assets/Images/Hospital/capsulas.png', {frameWidth:239, frameHeight:294});
        this.load.image("hospital_background", '../src/assets/Images/Hospital/Interior Hospital.png');

        this.textures.remove("cards")
        this.load.spritesheet("cards", '../src/assets/Images/Cards/cards.png', {frameWidth: 1080, frameHeight: 1080});
        this.load.image("burrito_muerto", '../src/assets/Images/Establo/gravestone.png');
        this.load.image("left_arrow", '../src/assets/Images/Establo/left_arrow.png');
        this.load.image("right_arrow", '../src/assets/Images/Establo/right_arrow.png');
        this.load.image("seleccion_panel", '../src/assets/Images/Coliseo/Seleccion.png');
        this.load.image("informacion_incursion", '../src/assets/Images/Coliseo/Informacion_incursion.png');
        this.load.image("cerrar", '../src/assets/Images/cerrar.png');
        this.load.image("QmULzZNvTGrRxEMvFVYPf1qaBc4tQtz6c3MVGgRNx36gAq", '../src/assets/Images/Burritos/Burrito Relampago.png');
        this.load.image("QmZEK32JEbJH3rQtXL9BqQJa2omXfpjuXGjbFXLiV2Ge9D",  '../src/assets/Images/Burritos/Burrito Planta.png');
        this.load.image("QmQcTRnmdFhWa1j47JZAxr5CT1Cdr5AfqdhnrGpSdr28t6", '../src/assets/Images/Burritos/Burrito Fuego.png');
        this.load.image("QmbMS3P3gn2yivKDFvHSxYjVZEZrBdxyZtnnnJ62tVuSVk", '../src/assets/Images/Burritos/Burrito Agua.png');

        this.load.image("tokenHud", '../src/assets/Images/HUD/Information.png');
        this.load.spritesheet("tokenIcon", '../src/assets/Images/HUD/Tokens.png', {frameWidth: 49, frameHeight: 50});

        this.load.image("dialog",  '../src/assets/Images/Dialog.png');

        this.load.once("complete", this.start, this);
        this.load.start(); 
        console.log(this.asd);
    }
    GetCapsuleStatus(capsule){
        if(capsule.burrito_id == "")
            return 0;

        let now = Date.now() /1000 |0
        let finish = parseInt(capsule.finish_time.toString().substring(0, capsule.finish_time.toString().length - 9));

        if(finish > now)
            return 1;
        else if(finish < now) 
            return 2;
    }
    async start(){
        this.loadingScreen = new LoadingScreen(this);
        this.add.image(0,0, "hospital_background").setOrigin(0);
        this.hudTokens = new TokenHud(200, 200, this, await Near.GetCurrentNears(), await Near.GetSTRWToken());
        new Button(this.game.config.width / 2,  60, 0.5, "buttonContainer", Translate.Translate("BtnBackToMeadow"), this, () => {this.scene.start("newMap")}, {fontSize: 24, fontFamily: "BangersRegular"});
        this.capsulesStatus = await Near.GetPlayerCapsules();
        this.requiredSTRW = await Near.GetStrwCost();
        console.log(this.capsulesStatus);

        let capsule1 = this.add.sprite(this.game.config.width / 2 - 455, 250, "capsulas", this.GetCapsuleStatus(this.capsulesStatus.capsule1)).setOrigin(0.5)//.setInteractive(this.input.makePixelPerfect()).on("pointerdown", ()=>{ this.UseCapsule(1) });
        let capsule2 = this.add.sprite(this.game.config.width/ 2 + 30, 250, "capsulas", this.GetCapsuleStatus(this.capsulesStatus.capsule2)).setOrigin(0.5)//.setInteractive(this.input.makePixelPerfect()).on("pointerdown", ()=>{ this.UseCapsule(2) });
        let capsule3 = this.add.sprite(this.game.config.width / 2 + 455, 250, "capsulas", this.GetCapsuleStatus(this.capsulesStatus.capsule3)).setOrigin(0.5)//.setInteractive(this.input.makePixelPerfect()).on("pointerdown", ()=>{ this.UseCapsule(3) });
        this.capsules = [capsule1, capsule2, capsule3];

        this.anims.create({ key: 'walkUp', frames: this.anims.generateFrameNumbers('miniBurrito', { frames: [0, 1, 2] }), frameRate: 12, repeat: 0 });
        this.anims.create({ key: "walkRight", frames: this.anims.generateFrameNumbers('miniBurrito', { frames: [3, 4, 5] }), frameRate: 12, repeat: 0 })
        this.anims.create({ key: 'walkDown', frames: this.anims.generateFrameNumbers('miniBurrito', { frames: [6, 7, 8] }), frameRate: 12, repeat: 0 });
        this.burrito = this.physics.add.sprite(400, this.sys.game.scale.gameSize.height / 2 + 50, "miniBurrito", 0).setOrigin(0.5).setScale(3).setCollideWorldBounds(true);
        
        //this.burrito.onWorldBounds = false;
        
        this.Cursors = this.input.keyboard.createCursorKeys();
        this.velocity = {x: 0, y: 0};
        this.input.on("pointerdown", function(pointer){
            if(!this.burrito.anims.isPlaying && !Alert.isAlert && !this.isPanel){
                this.isKeyboard = false;
                this.target.x = Number(pointer.worldX.toFixed(1));
                this.target.y = Number(pointer.worldY.toFixed(1));
                this.physics.moveToObject(this.burrito, this.target, this.speed);
            }
        }, this);
        
        let colliders = [
            { x: this.game.config.width/2, y: 140, w: 1200, h: 7 },
            { x: this.game.config.width/2, y: 985, w: 1200, h: 7 },
            { x: 1580, y: this.game.config.height/2, w: 7, h: 900 },
            { x: 365, y: this.game.config.height/2 - 230, w: 7, h: 350 },
            { x: 365, y: this.game.config.height/2 + 305, w: 7, h: 250 },
            { x: this.game.config.width/2 - 455, y: 200, w: 150, h: 80 },//capusle 1
            { x: this.game.config.width/2 + 30, y: 200, w: 150, h: 80 },//capsule 2
            { x: this.game.config.width/2 + 455, y: 200, w: 150, h: 80 },//capsule 3
            { x: this.game.config.width/2 - 700, y: this.game.config.height/2 + 50, w: 100, h: 180 },//exit
            
        ];
        
        let triggers = [
            { x: this.game.config.width/2 - 455, y: 300, w: 100, h: 80, variable: "capsule1", event: ()=>{ this.ViewCapsule(1)} },//capusle 1
            { x: this.game.config.width/2 + 30, y: 300, w: 100, h: 80, variable: "capsule2", event: ()=>{ this.ViewCapsule(2); } },//capsule 2
            { x: this.game.config.width/2 + 455, y: 300, w: 100, h: 80, variable: "capsule3", event: ()=>{ this.ViewCapsule(3); } },//capsule 3
            { x: this.game.config.width/2 - 650, y: this.game.config.height / 2 + 50, w: 100, h: 180, variable: "exit", event:()=>{ this.ShowAlert("Regresar a la pradera", "¿Quieres regresar a la pradera?", "newMap") } },//exit
        ];

        colliders.forEach(c =>{
            let zone = this.add.zone(c.x, c.y, c.w, c.h);
            this.physics.world.enable(zone);
            zone.body.setImmovable(true);
            this.physics.add.collider(this.burrito, zone, (burrito, _)=>{ burrito.body.stop(); this.burrito.stop();});
        })
        let circle = this.physics.add.staticSprite(this.game.config.width/2 - 135, this.game.config.height/2 - 5).setCircle(150)//.setCollideWorldBounds(true);
        this.physics.add.collider(this.burrito, circle);
        triggers.forEach(c =>{
            let zone = this.add.zone(c.x, c.y, c.w, c.h);
            if(c.variable !== 'undefined')
                window[c.variable] = zone;
            this.physics.world.enable(zone);
            zone.body.setImmovable(true);
            this.physics.add.overlap(this.burrito, zone, c.event);
        })

        await this.loadingScreen.OnComplete();
        let text = ["Bienvenido al hospital", "Puedes dejar a tus burritos aqui para que se recuperen", `El precio de cada cápsula es de $${this.requiredSTRW} STRW`, "Selecciona alguna cápsula que esté disponible para ingresar a tu burrito"];
        //new DialogueBox(this, 700, 500, text, true, .8, ()=>{this.isPanel = false;});
    }
    ShowAlert = async(title, description, scene) => {
        if(!this.showAlert){
            this.showAlert = true;
            this.burrito.body.stop();
            this.burrito.stop();
            await Alert.Fire(this, title, description, "Ir a pradera", "Cancelar")
            .then(async (result) => {
                if(result && scene != null) {
                    this.scene.start(scene);
                }
            });
        }
    }
    ViewCapsule = async (capsule) => {
        if(!this.showAlert){
            this.showAlert = true;
            console.log("stopasd");
            this.burrito.body.stop();
            this.burrito.stop();
            //await Alert.Fire(this, "title", "description", Translate.Translate("BtnGoSiteAlert"), Translate.Translate("BtnCancelAlert"))
            await this.UseCapsule(capsule)
        }
    }
    update(){
        if(this.isPanel || Alert.isAlert || this.burrito == null || this.target == null){
            return;
        }
        if(window["capsule1"] != null && window["capsule2"] != null && window["capsule3"] != null && window["exit"] != null)
            this.showAlert = Phaser.Geom.Intersects.RectangleToRectangle(this.burrito.getBounds(), window["capsule1"].getBounds()) 
                            | Phaser.Geom.Intersects.RectangleToRectangle(this.burrito.getBounds(), window["capsule2"].getBounds()) 
                            | Phaser.Geom.Intersects.RectangleToRectangle(this.burrito.getBounds(), window["capsule3"].getBounds())
                            | Phaser.Geom.Intersects.RectangleToRectangle(this.burrito.getBounds(), window["exit"].getBounds());

        if(this.canMove){
            let distance = Phaser.Math.Distance.Between(this.burrito.x, this.burrito.y, this.target.x, this.target.y);
            if(this.burrito.body.speed > 0){
                this.PlayAnimation();
                //this.footStepsSFX.setMute(false); 
                if(distance < 4 && !this.isKeyboard)
                    this.burrito.body.reset(this.target.x, this.target.y)
            } else{
                this.StopAnimation();
                try { //this.footStepsSFX.setMute(true); 
                } catch{}
            }
            
            this.keyboardMovement();
        }
    }
    StopAnimation(){
        if(this.burrito !== null && this.burrito.anims.isPlaying)
            this.burrito.stop();
    } 
    keyboardMovement(){
        if(this.velocity == null || this.Cursors == null || this.burrito == null)
            return;
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
        if(this.isKeyboard && this.burrito.body != null)
            this.burrito.setVelocity(this.velocity.x * this.speed, this.velocity.y * this.speed);
        
    }
    clampAngle(angle){
        let result = angle - Math.ceil(angle / 360) * 360;
        if(result < 0) result += 360;
        return result;
    }
    PlayAnimation() {
        if(this.isKeyboard)
            return;
        if(!this.burrito.anims.isPlaying) {
            let direction = {x: this.target.x -  this.burrito.x, y: this.target.y - this.burrito.y};
            let angle = this.clampAngle(Math.atan2(direction.y, direction.x) * (180 / Math.PI));

            if(angle >= 315 && angle < 360 || (angle >= 0 && angle < 45)){
                this.burrito.flipX = false;
                this.burrito.play("walkRight");
            }
            if(angle >= 45 && angle < 135){
                this.burrito.play("walkUp");
            }
            if(angle >= 135 && angle < 225){
                this.burrito.flipX = true;
                this.burrito.play("walkRight");
            }
            if(angle >= 225 && angle < 315){
                this.burrito.play("walkDown");
            }
        }
    }
    async UseCapsule(capsule){
            if(this.isPanel) return ;
            this.isPanel = true;

            let capsuleUI = this.capsules[capsule - 1]
            let selectedCapsule = this.capsulesStatus[`capsule${capsule}`];
            let now = Date.now() /1000 |0
            let finish = parseInt(selectedCapsule.finish_time.toString().substring(0, selectedCapsule.finish_time.toString().length - 9));
            this.capsulesStatus = await Near.GetPlayerCapsules();

            if(selectedCapsule.burrito_id != "" && now > finish){            
                this.loadingScreen = new LoadingScreen(this);
                await Near.WithdrawBurritoOwnerHospital(capsule);
                await this.loadingScreen.OnComplete();
                new DialogueBox(this, 700, 500, ["¡Tu burrito está listo!, ya volverá a tu establo para que puedas volver a usarlo"], true, 0.8, ()=>{this.isPanel = false;});
                capsuleUI.setTexture("capsulas", 0);
                return;
                
            } else if(now < finish || window["isCapsule" + capsule]){
                let text = [this.Contdown(parseInt(selectedCapsule.finish_time.toString().substring(0, selectedCapsule.finish_time.toString().length - 6)))]
                new DialogueBox(this, 700, 500, text, true, 0.8, ()=>{this.isPanel = false;});
                return;

            }
            
            if( await Near.GetSTRWToken() >= this.requiredSTRW){
                this.CreatePanel(capsule);
            }
            else{
                new DialogueBox(this, 700, 500, ["No tienes suficientes $STRW para ingresar a tu burrito"], true, 0.8, ()=>{this.isPanel = false;});
            }
    }
    async CreatePanel(capsule){
        this.isPanel =true;
        this.totalTokens = await Near.NFTSupplyForOwner();
        this.panelContainer = this.add.container(this.game.config.width / 2, this.game.config.height / 2).setScale(0.75);
        this.panelContainer.add(this.add.image(0, 0, "seleccion_panel"));
        this.panelContainer.add(this.add.text(28, 496, Translate.Translate("SingBurritos"), {fontSize: 60, fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5, align: "center"}).setOrigin(0.5));
        this.panelContainer.add(this.add.text(0, -430, "Hospital", {fontSize: 120, fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5, align: "center"}).setOrigin(0.5));
        this.panelContainer.add(new Button(- 500, 85, 1, "left_arrow", null, this, ()=>{ this.Navigate(-1); }).GetComponents());
        this.panelContainer.add(new Button(500, 85, 1, "right_arrow", null, this, ()=>{ this.Navigate(1); }).GetComponents());
        this.panelContainer.add(new Button(600, -500, 0.25, "cerrar", null, this, ()=>{ this.panelContainer.destroy(); this.isPanel = false; }).GetComponents());
        this.SpawnCards(capsule);
    }
    SpawnCards = async(capsule) => {
        this.cards = [];
        let burritos = await Near.NFTTokensForOwner(0 + 6 * this.counter, 6);
        burritos.forEach((burrito, index) => {
            let card = new Card( (300 * (index % 3)) - 300, (380 * Math.floor(index / 3)) - 125, burrito, this, true, false, false, false).setScale(0.35).On(() => { this.EnterBurrito(burrito, capsule)});
            this.panelContainer.add(card.GetComponents());
            this.cards.push(card)
        });
    }
    async EnterBurrito(burrito, capsule){
        /*this.loadingScreen = new LoadingScreen(this);
        await Near.DecreaseAllBurritoHp(burrito.token_id);
        await this.loadingScreenOnComplete();
        return;*/
        this.loadingScreen = new LoadingScreen(this);
        let result = await Near.RegisterInHospital(burrito.token_id, capsule);
        this.panelContainer.destroy(); 
        this.isPanel = false; 
        await this.loadingScreen.OnComplete();
        new DialogueBox(this, 700, 500, ["Listo, ahora debes esperar una época para volver por tu burrito"], true, 0.8, ()=>{this.isPanel = true;});
        this.capsules[capsule - 1].setTexture("capsulas", 1);
        window["isCapsule" + capsule] = true;
    }
    Contdown(remainToBuy) {
        let hour = Math.abs(Date.now() - remainToBuy) / 36e5;
        let minutes = (hour % 1) * 60;
        let seconds = (minutes % 1) * 60;

        return `Tu burrito estará listo en ${parseInt(hour).toString().padStart(2, '0')} horas, ${parseInt(minutes).toString().padStart(2, '0')} minutos y ${parseInt(seconds).toString().padStart(2, '0')} segundos`;
    }
}