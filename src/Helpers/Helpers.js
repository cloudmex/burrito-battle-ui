export class Button{
    text;
    constructor(x, y, scale, img, label, scene, downCallback, upCallback, fontStyle) {
        this.buttonResult = scene.add.container(x, y).setScrollFactor(0);

        this.button = scene.add.sprite(0,0, img)
        .setScrollFactor(0)
        .setScale(scale)
        .setInteractive()
        .on("pointerdown", ()=>{ this.PointerDown(downCallback);})
        .on("pointerup", () => { this.PointerUp(upCallback); })
        .on('pointerover', this.PointerOver)
        .on("pointerout", this.PointerOut);
        
        this.buttonResult.add(this.button)

        if(label !== null){
            this.text = scene.add.text(0, 10, label)
            .setScrollFactor(0)
            .setOrigin(0.5)
            .setStyle(fontStyle)
            .setPadding({ left: 0, right: 0, top: 0, bottom: 32 });
            this.buttonResult.add(this.text);
        }
    }
    GetComponents(){
        return this.buttonResult;
    }
    PointerDown(downCallback){
        if(downCallback !== null){
            downCallback();
        }
    }
    PointerUp(upCallback){
        if(upCallback !== null){
            upCallback();
        }
    }
   PointerOver = () => {
        this.button.setTint (0xaaaaaa);
    }
    PointerOut = () => {
        this.button.setTint (0xffffff);
    }
    
}
export class LoadingScreen {
    constructor(scene){
        let animation = Phaser.Math.Between(1, 2);
        this.loadingBackground = scene.add.image(0, 0, "loading_bg").setScale(120).setOrigin(0).setAlpha(0.9);
        this.loadingScreen = scene.add.sprite(scene.sys.game.scale.gameSize.width / 2, scene.sys.game.scale.gameSize.height / 2, `loading_screen_${animation}`, 0).setOrigin(0.5);
        this.loadingScreen.depth = 1;
        this.loadingBackground.depth = 1;
        scene.anims.create({ key: "loading", frames: scene.anims.generateFrameNumbers(`loading_screen_${animation}`), frameRate: 24, repeat: -1 });
        this.loadingScreen.play("loading")
    }
    async OnComplete(){
        setTimeout(()=> { this.Destroy(); }, 0);
    }
    Destroy(){
        this.loadingScreen.destroy(); 
        this.loadingBackground.destroy();
    }
}
export class Card{
    Card;
    Active = true;
    enabledColor = 0xffffff;
    overColor = 0xaaaaaa
    disabledColor = 0x666666;

    constructor(x, y, burrito, scene, interactuable = false, isEstablo = false){
        this.scene = scene;
        this.burrito = burrito;
        this.Card = {x: x, y: y, burrito: burrito, scene: scene };
        this.Active = burrito.hp > 0;

        this.cardResult = scene.add.container(x, y).setScrollFactor(0);
        this.card = scene.add.image(0, 0, "cards", this.GetIndexByType(burrito.burrito_type));
        this.cardResult.add(this.card);
        this.cardResult.add(this.burrito = scene.add.image(0, 0, this.Active ? burrito.media : "burrito_muerto"));
        if(this.Active)
            this.burrito.setScale(.4);

        this.cardResult.add(this.levelText = scene.add.text(-300, - 400, burrito.level, { fontSize: 90, fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5 }).setOrigin(0.3, 0));//level
        this.cardResult.add(scene.add.text(-180, - 380, burrito.name.split("#", 1), { fontSize: 60, fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5 }).setOrigin(-0.02, 0));//name

        this.cardResult.add(this.Level = scene.add.sprite(325, -150, "level", Math.round((burrito.win / 10) * 24)));
        scene.anims.create({ key: "resetLevel", frames: scene.anims.generateFrameNumbers("level", { frames: [24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0]}), frameRate: 24, repeat: 0 });
        if(burrito.win < 10){
            this.cardResult.add(this.winsText = scene.add.text(310, - 180, burrito.win, { fontSize: 60, fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5 }).setOrigin(0.1, 0));//wins    
        }else{
            this.cardResult.add(this.winsText = scene.add.text(310, - 180, burrito.win, { fontSize: 60, fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5 }).setOrigin(0.25, 0));//wins
        }
        this.cardResult.add( this.Heart = scene.add.sprite(325,0,"heart", Math.round((burrito.hp / 5) * 24)));
        scene.anims.create({ key: "recoverHealth", frames: scene.anims.generateFrameNumbers("heart", { frames: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]}), frameRate: 24, repeat: 0 });
        this.cardResult.add(this.heartText = scene.add.text(310, - 40, burrito.hp, { fontSize: 60, fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5 }).setOrigin(0.1, 0));//health

        if(burrito.attack <= 9){
            this.cardResult.add(scene.add.text(-195, 365, burrito.attack, { fontSize: 90, fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5 }).setOrigin(0.1, 0));//attack
        }else{
            this.cardResult.add(scene.add.text(-195, 365, burrito.attack, { fontSize: 90, fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5 }).setOrigin(0.3, 0));//attack
        }

        if(burrito.defense <= 9 ){
            this.cardResult.add(scene.add.text(0, 320, burrito.defense, { fontSize: 90, fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5 }).setOrigin(0.1, 0));//defense
        }else{
            this.cardResult.add(scene.add.text(0, 320, burrito.defense, { fontSize: 90, fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5 }).setOrigin(0.3, 0));//defense    
        }

        if(burrito.speed <= 9){
            this.cardResult.add(scene.add.text(195, 365, burrito.speed, { fontSize: 90, fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5 }).setOrigin(-0.1, 0));//speed
        }else{
            this.cardResult.add(scene.add.text(195, 365, burrito.speed, { fontSize: 90, fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5 }).setOrigin(0.2, 0));//speed
        }

        if(localStorage.getItem("burrito_selected") == burrito.token_id && isEstablo)
            this.cardResult.add(this.selected = scene.add.image(300, -350, "selected").setScale(0.35));

        if(interactuable){
            this.card
            .on('pointerover', this.PointerOver)
            .on("pointerout", this.PointerOut);
        }
        this.card.setTint (this.Active ? this.enabledColor : this.disabledColor);
    }
    RecoverHealth() {
        this.Heart.setFrame(0);
        this.heartText.setText(0);
        setTimeout(() => {
            this.Heart.play("recoverHealth");
            this.heartText.setText(5);
          }, 1500);
    }
    
    ResetLevel(){ 
        this.levelText.setText(parseInt(this.Card.burrito.level) - 1);
        this.Level.setFrame(23);
        this.winsText.setText(10);
        setTimeout(() => {
            this.Level.play("resetLevel");
            this.winsText.setText(0);
            this.levelText.setText(this.Card.burrito.level);
          }, 1500);
    }
    PointerOver = () => {
         this.card.setTint (this.overColor);
     }
    PointerOut = () => {
        this.card.setTint (this.Active ? this.enabledColor : this.disabledColor);
    }
    On(event){
        this.card.setInteractive().on("pointerdown", event);
        return this;
    }
    GetIndexByType(type){
        switch(type){
            case "Agua": return 0;
            case "Volador": return 1;
            case "Fuego": return 2;
            case "Planta": return 3;
            case "Eléctrico": return 4;
            default: return 0;
        }
    }
    setScale(value){
        this.cardResult.setScale(value);
        return this;
    }
    GetComponents () { 
        return this.cardResult;
    }
    setSelected(value){
        if(value){
            this.cardResult.add(this.selected = this.scene.add.image(300, -350, "selected").setScale(0.35));
        } else if(this.selected != null) {
            this.selected.destroy();
            this.selected = null;
        }
    }
}
export class Slider{
    constructor(x, y, scene, head){
        this.sliderResult = scene.add.container(x, y).setScrollFactor(0);
        
        this.sliderResult.add(scene.add.sprite(0, 0, "slider_background").setOrigin(0.5));
        this.sliderResult.add(scene.add.sprite(-280, 0, "burritos", head));
        this.sliderResult.add(scene.add.sprite(84, -5, "slider_fill", 2).setOrigin(0.5));
        this.sliderResult.add(this.fill = scene.add.sprite(84, -5, "slider_fill", 1));
        this.sliderResult.add(scene.add.sprite(84, -5, "slider_fill", 0));
    }
    SetValue(value){
        this.fill.setCrop(0, 0, this.fill.width * value, this.fill.height);
        return this;
    }
    SetFlipX(value){
        this.sliderResult.setScale(value ? -1 : 1, 1);
        return this;
    }
}
export class Actions{
    scene;
    constructor(x, y, scene, battle, actions){
        this.scene = scene;
        this.actions = actions;
        this.battle = battle;
        this.actionsResult = scene.add.container(x, y);
        this.actionsResult.add(this.action1 = scene.add.sprite(0, 0, "actions", this.IsMyTurn() ? 2 : 0).setAlpha(0));//weak

        this.actionContainer = scene.add.container(0, 0);
        this.actionsResult.add(this.actionContainer);
        this.actionContainer.add(this.action2 = scene.add.sprite(0, 0, "actions", this.IsMyTurn() ? 3 : 1).setAlpha(0));//strong
        this.actionContainer.add(this.text = scene.add.text(10, 0, this.IsMyTurn() ? battle.strong_attack_player : battle.shields_player, {fontSize: 60, fontFamily: "BangersRegular"}).setAlpha(0));

        this.action1.setInteractive().on("pointerdown", ()=> { 
            this.SendAction();
            this.actions.Action1(); 
        });
        this.action2.setInteractive().on("pointerdown", ()=> {
            if((this.IsMyTurn() ? battle.strong_attack_player : battle.shields_player) > 0){ 
                this.SendAction();
                this.actions.Action2();
            } else {Swal.fire({
                position: 'top-end',
                icon: 'error',
                title: 'No puedes realizar esta accion',
                showConfirmButton: false,
                timer: 1000
              })
            }
        });
        this.ShowActions();
    }
    ShowActions(){
        let distance = 250;
        
        this.scene.tweens.timeline({
            ease: 'Power2',
            duration: 1500,
            delay:1000,
            tweens:[
            {
                alpha: 1, 
                targets: this.action1,
                x: 0,
                y: -distance,
                offset: 0
            },
            { 
                targets: this.actionContainer,
                x: distance * 0.9396 /* cos(angle = 20) */,
                y: -distance * 0.342 /* sin(angle = 20) */,
                offset:0
            },
            {
                targets: [this.text,this.action2],
                alpha: 1, 
                offset:0
            },
        ]});
    }
    IsMyTurn() {
        return this.battle.turn == "Player";
    }
    SetFlipX(value){
        this.actionsResult.setScale(value ? -1 : 1, 1);
        this.action1.setScale(value ? -1 : 1, 1);
        this.action2.setScale(value ? -1 : 1, 1);
        this.text.setScale(value ? -1 : 1, 1);

        return this;
    }
    SendAction(){
        this.scene.tweens.timeline({
            ease: 'Power2',
            duration: 1500,
            tweens:[
            {
                alpha: 0, 
                targets: [this.action1, this.actionContainer, this.text],
                x: 0,
                y: 0,
                offset:0,
                onComplete: ()=>{ this.actionsResult.destroy()}
            }
        ]}); 
    }
}
export class InfoCard{
    InfoCard;
    constructor(x, y, burrito, scene, interactuable = false){
        this.InfoCard = {x, y, burrito, scene };


        //console.log('scene',scene.bigCard)
        const components = scene.bigCard.GetComponents().list
        components[1].visible = false;
        for (const item of components) {
            if(item.type === "Text") {

                item.visible = false        
            }
        }

        this.cardResult = scene.add.container(x, y).setScrollFactor(0)
        this.numBurrito = burrito.name.split("#", 2);

        this.cardResult.add(scene.add.text(-100, -235, "Burrito #"+this.numBurrito[1]+"\nTipo: "+burrito.burrito_type+"\nnivel: "+burrito.level+"\nVictorias: "+burrito.win+" \nVidas: "+burrito.hp+"\nFuerza: "+burrito.attack+"\nDefensa: "+burrito.defense+"\nVelocidad: "+burrito.speed, { fontSize: 45, fontFamily: "BangersRegular", color: 'white' }));

    }
    
    setScale(value){
        this.cardResult.setScale(value);
        return this;
    }
    setTint(value) {
        this.infoCard.setTint(0x808080);
        this.burrito.setTint(0x808080)
        return this;
    }
    GetComponents () { 
        return this.cardResult;
    }
}


export class BurritoHud{
    BurritoHud;
    constructor(x, y, burrito, scene){
        this.BurritoHud = {x, y, burrito, scene };

        this.hudResult = scene.add.container(x, y).setScrollFactor(0);
        this.hud = scene.add.image(0, 0, "hud", this.GetIndexByType(burrito.burrito_type));   //HUD segun el tipo
        this.hudResult.add(this.hud);
        this.burrito = scene.add.image(-83, -51, "burritoHud", this.GetSkinBurrito(burrito.media));  //Imagen del burrito en HUD     
        this.hudResult.add(this.burrito);
        this.hudResult.add(scene.add.text(130, -82, burrito.hp, { fontSize: 50, fontFamily: "BangersRegular" }));//health
        this.hudResult.add(scene.add.text(130, 26, burrito.win, { fontSize: 50, fontFamily: "BangersRegular" }));//wins

    }

    GetIndexByType(type){
        switch(type){
            case "Agua": return 0;
            case "Volador": return 1;
            case "Fuego": return 2;
            case "Planta": return 3;
            case "Eléctrico": return 4;
            default: return 0;
        }
    }

    GetSkinBurrito(media){
        switch(media){
            case "QmbMS3P3gn2yivKDFvHSxYjVZEZrBdxyZtnnnJ62tVuSVk": return 0;
            case "QmQcTRnmdFhWa1j47JZAxr5CT1Cdr5AfqdhnrGpSdr28t6": return 1;
            case "QmZEK32JEbJH3rQtXL9BqQJa2omXfpjuXGjbFXLiV2Ge9D": return 2;
            case "QmULzZNvTGrRxEMvFVYPf1qaBc4tQtz6c3MVGgRNx36gAq": return 3;
            default: return 0;
        }
    }
}

export class TokenHud{
    TokenHud;
    constructor(x, y, scene, currentNEAR, currentSTRW){
        this.TokenHud = {x, y, scene};

        this.cantidad = (currentNEAR.available/1000000000000000000000000)+"";
        this.decimales = this.cantidad.split(".");
        this.disponible = this.decimales[0]+"."+(this.decimales[1].substring(0, 2));

        this.hudResult = scene.add.container(x, y).setScrollFactor(0);
        this.nearHud = scene.add.image(-40, -150, "tokenHud");
        this.strwHud = scene.add.image(-40, -80, "tokenHud");
        this.hudResult.add(this.nearHud);
        this.hudResult.add(this.strwHud);
        this.nearToken = scene.add.image(-140, -150, "tokenIcon", 1);// Icono de NEAR Token
        this.strwToken = scene.add.image(-140, -80, "tokenIcon", 0);// Icono de STRW Token
        this.hudResult.add(this.nearToken);
        this.hudResult.add(this.strwToken);
        this.hudResult.add(scene.add.text(-56, -100, currentSTRW, { fontSize: 34, fontFamily: "BangersRegular" }));// cantidad de STRW Tokens del usuario
        this.hudResult.add(scene.add.text(-56, -171, this.disponible, { fontSize: 34, fontFamily: "BangersRegular" }));// cantidad de NEAR Tokens del usuario
    }
}
export class BattleEnd{
    constructor(x, y, scene, isVictoria, STRWTokens){
        this.resultUI = scene.add.container(x, y);
        scene.anims.create({ key: "backgroundAnim", frames: scene.anims.generateFrameNumbers("background_animation", { frames: [0, 1, 2, 3] }), frameRate: 24, repeat: 0 });
        this.resultUI.add(this.backgroundAnimation = scene.add.sprite(0, 0));
        this.backgroundAnimation.play("backgroundAnim");

        scene.anims.create({ key: "finishAnim", frames: scene.anims.generateFrameNumbers( isVictoria ? "victoria" : "derrota", { frames: scene.Range(0, 18)}), frameRate: 24, repeat: 0 });
        this.resultUI.add(this.animation = scene.add.sprite(0, 0));
        this.animation.play("finishAnim");
        setTimeout(() => {
            this.resultUI.add(scene.add.text(245, 390, `+${STRWTokens}`, {fontSize:40, fontFamily:"BangersRegular"}).setOrigin(0.5));
            this.resultUI.add(scene.add.text(-255, 390, isVictoria ? "+1" : "-1", {fontSize:40, fontFamily:"BangersRegular"}).setOrigin(0.5));
        }, 1000);
    }
}