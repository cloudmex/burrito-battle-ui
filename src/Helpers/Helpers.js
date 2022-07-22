import * as Near  from "../near.js";
export class Button{
    text;
    constructor(x, y, scale, img, label, scene, downCallback, upCallback, fontStyle, useScrollFactor = true) {
        this.buttonResult = scene.add.container(x, y);
        
        this.scene = scene;
        this.button = scene.add.sprite(0,0, img)
        .setScale(scale)
        .setInteractive()
        .on("pointerdown", ()=>{ this.PointerDown(downCallback);})
        .on("pointerup", () => { this.PointerUp(upCallback); })
        .on('pointerover', this.PointerOver)
        .on("pointerout", this.PointerOut);
        
        this.buttonResult.add(this.button)

        if(label !== null){
            this.text = scene.add.text(0, 10, label)
            .setOrigin(0.5)
            .setStyle(fontStyle)
            .setPadding({ left: 0, right: 0, top: 0, bottom: 32 });
            this.buttonResult.add(this.text);
        }
        if(useScrollFactor){
            this.buttonResult.setScrollFactor(0);
            this.text?.setScrollFactor(0);
            this.button?.setScrollFactor(0);
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
        this.loadingBackground = scene.add.image(0, 0, "loading_bg").setScale(120).setOrigin(0).setAlpha(0.9).setScrollFactor(0);
        this.loadingScreen = scene.add.sprite(scene.sys.game.scale.gameSize.width / 2, scene.sys.game.scale.gameSize.height / 2, `loading_screen_${animation}`, 0).setOrigin(0.5).setScrollFactor(0);
        this.loadingScreen.depth = 4;
        this.loadingBackground.depth = 4;
        scene.anims.create({ key: "loading", frames: scene.anims.generateFrameNumbers(`loading_screen_${animation}`), frameRate: 24, repeat: -1 });
        this.loadingScreen.play("loading");
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
    overColor = 0xaaaaaa;
    disabledColor = 0x666666;

    constructor(x, y, burrito, scene, interactuable = false, isEstablo = false, displayOverIcons = true, isBigCard = false){
        this.scene = scene;
        this.burrito = burrito;
        this.Card = {x: x, y: y, burrito: burrito, scene: scene };
        this.Active = burrito.hp > 0;

        this.cardResult = scene.add.container(x, y).setScrollFactor(0);
        this.card = scene.add.image(0, 0, burrito.cards == null ? "cards" : "mega_cards", this.GetIndexByType(burrito.burrito_type));
        this.cardResult.add(this.card);
        if(burrito.media != null)
            this.cardResult.add(this.burritoImg = scene.add.image(0, 0, this.Active ? burrito.media : "burrito_muerto"));

        if(this.Active)
            this.burritoImg.setScale(.4);

        this.cardResult.add(this.levelText = scene.add.text(-275, - 400, burrito.level, { fontSize: 90, fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5, align: "center" }).setOrigin(0.5, 0));//level
        this.cardResult.add(scene.add.text(-180, - 380, burrito.name.split("#", 1), { fontSize: 60, fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5 }).setOrigin(-0.02, 0));//name

        if(displayOverIcons){
            this.cardResult.add(this.Level = scene.add.sprite(325, -150, "level", Math.round((burrito.win / 10) * 24)));
            scene.anims.create({ key: "resetLevel", frames: scene.anims.generateFrameNumbers("level", { frames: [24,23,22,21,20,19,18,17,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0]}), frameRate: 24, repeat: 0 });
        }
        this.cardResult.add(this.winsText = scene.add.text(325, - 180, burrito.win, { fontSize: 60, fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5, align: "center" }).setOrigin(0.5, 0));//wins
        if(displayOverIcons){
            this.cardResult.add( this.Heart = scene.add.sprite(325,0,"heart", Math.round((burrito.hp / 5) * 24)));
            scene.anims.create({ key: "recoverHealth", frames: scene.anims.generateFrameNumbers("heart", { frames: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24]}), frameRate: 24, repeat: 0 });
        }
        this.cardResult.add(this.heartText = scene.add.text(325, - 40, burrito.hp, { fontSize: 60, fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5, align: "center" }).setOrigin(0.5, 0));//health

        this.cardResult.add(this.attackText = scene.add.text(-175, 365, burrito.attack, { fontSize: 90, fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5, align: "center" }).setOrigin(0.5/*burrito.attack <= 9 ? 0.1 : 0.3*/, 0));//attack
        this.cardResult.add(this.defenseText = scene.add.text(25, 320, burrito.defense, { fontSize: 90, fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5, align: "center" }).setOrigin(0.5/*burrito.defense <= 9 ? 0.1 : 0.3*/, 0));//defense
        this.cardResult.add(this.speedText = scene.add.text(225, 365, burrito.speed, { fontSize: 90, fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5, align: "center" }).setOrigin(0.5/*burrito.speed <= 9 ? -0.1 : 0.2*/, 0));//speed

        if(localStorage.getItem("burrito_selected") == burrito.token_id && isEstablo && !isBigCard)
            this.cardResult.add(this.selected = scene.add.image(300, -350, "selected").setScale(0.35));

        if(interactuable)
            this.card.on('pointerover', this.PointerOver).on("pointerout", this.PointerOut);
        if(burrito.media != null)
            this.card.setTint (this.Active? this.enabledColor : this.disabledColor);
    }
    RecoverHealth(newBurrito) {
        this.burritoImg.setTexture("burrito_muerto");
        this.burritoImg.setScale(1);
        this.Heart.setFrame(0);
        this.heartText.setText(0);
        setTimeout(() => {
            this.Heart.play("recoverHealth");
            setTimeout(() => {
                this.heartText.setText(newBurrito.hp);
                this.burritoImg.setTexture(newBurrito.media);
                this.burritoImg.setScale(.4);
            }, 1500);
        }, 1500);
    }
    
    ResetLevel(newBurrito){
        this.levelText.setText(parseInt(newBurrito.level) - 1);
        this.Level.setFrame(23);
        this.winsText.setText(10); 
        setTimeout(() => {
            this.Level.play("resetLevel");
            this.winsText.setText(0);
            this.levelText.setText(this.Card.burrito.level);
        
            setTimeout(() => {
                this.winsText.setText(0);
                this.levelText.setText(this.Card.burrito.level);
                this.attackText.setText(newBurrito.attack);
                this.defenseText.setText(newBurrito.defense);
                this.speedText.setText(newBurrito.speed);
            }, 1500);
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
    constructor(x, y, scene, head, room, isCPU = false, isIncursion = false){
        this.room = room;
        this.isCPU = isCPU;
        this.isIncursion = isIncursion;
        this.sliderResult = scene.add.container(x, y).setScrollFactor(0);
        
        this.sliderResult.add(scene.add.sprite(0, 0, "slider_background").setOrigin(0.5));
        this.sliderResult.add(scene.add.sprite(-275, 0, "burritos", head));
        this.sliderResult.add(scene.add.sprite(84, -5, "slider_fill", 2).setOrigin(0.5));
        this.sliderResult.add(this.fill = scene.add.sprite(84, -5, "slider_fill", 1));
        this.sliderResult.add(scene.add.sprite(84, -5, "slider_fill", 0));
        if(isCPU){
            this.sliderResult.setScale(-1, 1);
            this.sliderResult.add(scene.add.text(10, -105, "Nivel: "+room.burrito_cpu_level, { fontSize: 45, fontFamily: "BangersRegular", color: 'white' , stroke: 0x000000, strokeThickness: 5}).setScale(-1, 1));
            this.sliderResult.add(scene.add.text(108, 45, "Salud: "+parseFloat(isIncursion ? room.health : room.health_cpu).toFixed(2), { fontSize: 45, fontFamily: "BangersRegular", color: 'white', stroke: 0x000000, strokeThickness: 5 }).setScale(-1, 1));
        }else{
            this.sliderResult.add(scene.add.text(-150, -105, "Nivel: " + (isIncursion ? room.level : room.level_b1), { fontSize: 45, fontFamily: "BangersRegular", color: 'white', stroke: 0x000000, strokeThickness: 5 }))
            this.sliderResult.add(scene.add.text(-150, 45, "Salud: "+parseFloat(isIncursion ? room.health : room.health_player).toFixed(2), { fontSize: 45, fontFamily: "BangersRegular", color: 'white', stroke: 0x000000, strokeThickness: 5 }))
        }
    }
    SetValue(value){
        this.fill.setCrop(0, 0, this.fill.width * value, this.fill.height);
        const components = this.sliderResult.list;
        if(this.isCPU){
            components[6].setText("Salud: "+ (value*this.room.start_health_cpu).toFixed(2));
        }else{
            components[6].setText("Salud: " + (value * (this.isIncursion ? this.room.health : this.room.start_health_player)).toFixed(2));
        }
        return this;
    }
}
export class BossSlider{
    constructor(x, y, scene){
        this.scene = scene;
        this.SliderResult = scene.add.container(x, y).setScrollFactor(0);

        //this.SliderResult.add(scene.add.sprite(0, 0, "slider_background").setOrigin(0.5));
        this.SliderResult.add(scene.add.sprite(84, -5, "slider_background_mega", 0).setOrigin(0.5));
        this.SliderResult.add(this.fill = scene.add.sprite(84, -5, "slider_background_mega", 1).setOrigin(0.5).setScale(0.9));
        this.SliderResult.add(scene.add.sprite(84, -5, "slider_background_mega", 2).setOrigin(0.5).setScale(0.9));
    }
    SetScale(value){
        this.SliderResult.setScale(value);
        return this;
    }
    SetValue(value){
        this.fill.setCrop(0, 0, this.fill.width * value, this.fill.height);
        return this;
    }
    GetComponent(){
        return this.SliderResult;
    }
}
export class Actions{
    scene;
    outColor = 0xffffff;
    overColor = 0xaaaaaa;
    constructor(x, y, scene, battle, actions){
        this.scene = scene;
        this.actions = actions;
        this.battle = battle;
        this.actionsResult = scene.add.container(x, y);
        this.actionsResult.add(this.action1 = scene.add.sprite(0, 0, "actions", this.IsMyTurn() ? 2 : 0).setAlpha(0));//weak

        this.actionContainer = scene.add.container(0, 0);
        this.actionsResult.add(this.actionContainer);
        this.actionContainer.add(this.action2 = scene.add.sprite(0, 0, "actions", this.IsMyTurn() ? 3 : 1).setAlpha(0));//strong
        this.actionContainer.add(this.text = scene.add.text(10, 0, this.IsMyTurn() ? battle.strong_attack_player : battle.shields_player, {fontSize: 60, fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5}).setAlpha(0));

        this.action1.setInteractive().on("pointerdown", ()=> { 
            this.SendAction();
            this.actions.Action1(); 
        });
        this.action2.setInteractive().on("pointerdown", ()=> {
            if((this.IsMyTurn() ? battle.strong_attack_player : battle.shields_player) > 0){ 
                this.SendAction();
                this.actions.Action2();
            } else {
                Alert.Fire(this.scene, this.scene.game.config.width / 2, this.scene.game.config.height/2, null, "No puedes realizar esta accion")
            }
        });
        this.ShowActions();

        this.action1
            .on('pointerover', () => {
                this.action1.setTint (this.overColor);
                this.actionsResult.add(this.text1 = scene.add.text(this.IsMyTurn() ? -55 : -38, this.IsMyTurn() ? -272 : -290, this.IsMyTurn() ? "Ataque" : "Pasar\nTurno", {fontSize: 30, fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5}));
            })
            .on("pointerout", () => {
                this.action1.setTint (this.outColor);
                this.text1.destroy();
            });
        this.action2
            .on('pointerover', () => {
                this.action2.setTint (this.overColor);
                this.text.visible = false;
                this.actionsResult.add(this.text2 = scene.add.text(this.IsMyTurn() ? 185 : 175, this.IsMyTurn() ? -130: -102, this.IsMyTurn() ? "Ataque\nPesado" : "Defensa", {fontSize: 28, fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5}));
            })
            .on("pointerout", () => {
                this.action2.setTint(this.outColor);
                this.text.visible = true;
                this.text2.destroy();
            });
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
                item.visible = false;      
            }
        }

        this.cardResult = scene.add.container(x, y).setScrollFactor(0)
        this.numBurrito = burrito.name.split("#", 2);

        this.cardResult.add(scene.add.text(-100, -235, "Burrito #"+this.numBurrito[1]+"\nTipo: "+burrito.burrito_type+"\nNivel: "+burrito.level+"\nVictorias: "+burrito.win+" \nVidas: "+burrito.hp+"\nFuerza: "+burrito.attack+"\nDefensa: "+burrito.defense+"\nVelocidad: "+burrito.speed, { fontSize: 45, fontFamily: "BangersRegular", color: 'white' }));

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

    GetComponents () { 
        return this.hudResult;
    }

    SetAlpha(alpha){
        this.hud.setAlpha(alpha);
        this.burrito.setAlpha(alpha)
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
        this.hudResult.add(this.strwText = scene.add.text(-56, -100, currentSTRW, { fontSize: 34, fontFamily: "BangersRegular" }));// cantidad de STRW Tokens del usuario
        this.hudResult.add(this.nearText = scene.add.text(-56, -171, this.disponible, { fontSize: 34, fontFamily: "BangersRegular" }));// cantidad de NEAR Tokens del usuario
    }

    GetComponents () { 
        return this.hudResult;
    }
    async UpdateTokens(){
        let nears = ((await Near.GetAccountBalance()).available / 1000000000000000000000000).toFixed(2);
        let strw = await Near.GetSTRWToken();
        this.strwText.setText(strw);
        this.nearText.setText(nears)
    }
}
export class BattleEnd{
    constructor(x, y, scene, isVictoria, STRWTokens, isIncursion = false){
        this.resultUI = scene.add.container(x, y);
        scene.anims.create({ key: "backgroundAnim", frames: scene.anims.generateFrameNumbers("background_animation", { frames: [0, 1, 2, 3] }), frameRate: 24, repeat: 0 });
        this.resultUI.add(this.backgroundAnimation = scene.add.sprite(0, 0));
        this.backgroundAnimation.play("backgroundAnim");

        scene.anims.create({ key: "finishAnim", frames: scene.anims.generateFrameNumbers( isVictoria ? "victoria" : "derrota", { frames: scene.Range(0, 18)}), frameRate: 24, repeat: 0 });
        this.resultUI.add(this.animation = scene.add.sprite(0, 0));
        this.animation.play("finishAnim");
        setTimeout(() => {
            if(isIncursion){
                this.resultUI.add(scene.add.text(245, 390, `+${STRWTokens}`, {fontSize:40, fontFamily:"BangersRegular"}).setOrigin(0.5));
                this.resultUI.add(scene.add.text(-255, 390, isVictoria ? "+1" : "-1", {fontSize:40, fontFamily:"BangersRegular"}).setOrigin(0.5));
            }
            this.resultUI.add(this.burrito = scene.add.sprite(0, 30).setScale(0.75));
            this.burrito.play(isVictoria ? "victoria_Player" : "derrota_Player");
        }, 1000);
    }
}

export class Alert{
    static isAlert = false;
    static Fire(scene, x, y, title, description, acceptBtn = "Aceptar", cancelBtn = null){
        return new Promise(async (result)=>{
            if(this.IsDefined(this.isAlert) && this.isAlert)
                return result(false);
            this.scene = scene;
            this.isAlert = true;
            let isMini = title == null;
            this.alertResult = scene.add.container(x, scene.game.config.height * 1.5).setScrollFactor(0);
            this.alertResult.add(scene.add.image(0, 0, isMini ? "miniAlert" : "alert"));
            this.alertResult.add(scene.add.text(0, -360, title, { fontSize:70 , fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5, align: "center", wordWrap: { width: 800 } }).setOrigin(0.5));
            this.alertResult.add(this.descriptionText = scene.add.text(0, isMini ? -180 : -240, description, { fontSize:45 , fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5, align: "center", wordWrap: { width: 800 } }).setOrigin(0.5, 0));
            
                this.alertResult.add(new Button(cancelBtn == null ? 0 : -220 , isMini ? 135 : 350, 0.6, "buttonContainer", acceptBtn, scene, async()=> {await this.Hide(); await result(true);}, null, { fontSize:40 , fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5 } ).GetComponents());
                if(cancelBtn != null && !isMini)
                    this.alertResult.add(new Button(220 , 350, 0.6, "buttonContainer", cancelBtn, scene, async()=> { await this.Hide(); await result(false);}, null, { fontSize:40 , fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5 } ).GetComponents());
            scene.tweens.timeline({
                ease: 'Cubic',
                tweens:[ { 
                    delay: 1,
                    duration: 750,
                    targets: this.alertResult,
                    y: y,
                    offset:0
                }
            ]});
        });
    }
    static Hide = () => { 
        return new Promise( (result) =>{
            this.scene.tweens.timeline({
                ease: 'Cubic',
                tweens:[ { 
                    duration: 750,
                    delay:1,
                    targets: this.alertResult,
                    y: this.scene.game.config.height * 1.5,
                    offset:0, 
                    onComplete: ()=>{ this.alertResult.destroy(); this.isAlert = false; delete this; result(null); }
                }
            ]});
            
        });
    }
    
    static IsDefined = (obj) => {
        return typeof obj !== "undefined";
    }
}

export class Incursion{
    constructor(x, y, scene, scale){
        this.x = x;
        this.y = y;
        this.scene = scene;
        this.scale = scale;
        this.incursionResult = scene.add.container(x, y).setScrollFactor(0).setScale(this.scale);
    }
}