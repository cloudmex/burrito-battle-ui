import *  as Near from '../Near.js';
import { Translate } from '../Language/Translate.js'

export class Button {
    constructor(x, y, scale, img, label, scene, downCallback, fontStyle, useScrollFactor = true, setPixelPerfect = true) {
        this.buttonResult = scene.add.container(x, y)
        .setDepth(5);
        
        this.scene = scene;
        this.button = scene.add.sprite(0,0, img)
        .setScale(scale)
        .on("pointerdown", ()=>{ this.PointerDown(downCallback);})
        .on('pointerover', ()=>{
            this.scene.sound.add("button-hover", { loop: false, volume: SettingsButton.GetVolumeSFX()}).play();
            this.button.setTint (0xaaaaaa);}
            )
        .on("pointerout", ()=>{this.button.setTint (0xffffff);});
        
        if(setPixelPerfect)
            this.button.setInteractive(scene.input.makePixelPerfect())
        else 
            this.button.setInteractive()
            
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
            if(this.text != null)
                this.text.setScrollFactor(0);
            this.button.setScrollFactor(0);
        }
    }
    GetComponents(){
        return this.buttonResult;
    }
    PointerDown(downCallback){
        if(downCallback !== null){
            this.scene.sound.add("button-click", { loop: false, volume: SettingsButton.GetVolumeSFX()}).play();
            setTimeout(() => {
                downCallback();
            }, 500);
        }
    }    
}
export class Alert{
    //static isAlert = false;
    static Fire(scene, title, description, acceptBtn = Translate.Translate("BtnAccept"), cancelBtn = null){
        return new Promise(async (result)=>{
            if(this.IsDefined(this.isAlert) && this.isAlert){
                return result(false);
            }
            this.scene = scene;
            this.isAlert = true;
            let isMini = title == null;
            
            this.alertResult = scene.add.container(scene.game.config.width / 2, scene.game.config.height * 1.5).setScrollFactor(0).setDepth(5);
            this.alertResult.add(scene.add.image(0, 0, isMini ? "miniAlert" : "alert"));
            this.alertResult.add(scene.add.text(0, -360, title, { fontSize:64 , fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5, align: "center", wordWrap: { width: 800 } }).setOrigin(0.5));
            this.alertResult.add(this.descriptionText = scene.add.text(0, isMini ? -180 : -240, description, { fontSize:45 , fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5, align: "center", wordWrap: { width: 800 } }).setOrigin(0.5, 0));
            
            this.alertResult.add(new Button(cancelBtn == null ? 0 : -220 , isMini ? 135 : 350, 0.6, "buttonContainer", acceptBtn, scene, async()=> {await this.Hide(); await result(true);}, { fontSize:40 , fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5 } ).GetComponents());
            if(cancelBtn != null && !isMini){
                this.alertResult.add(new Button(220 , 350, 0.6, "buttonContainer", cancelBtn, scene, async()=> { await this.Hide(); await result(false);}, { fontSize:40 , fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5 } ).GetComponents());
            }
            
            scene.tweens.timeline({
                ease: 'Cubic',
                tweens:[ { 
                    delay: 1,
                    duration: 750,
                    targets: this.alertResult,
                    y: scene.game.config.height/2,
                    offset:0
                }
            ]});
        });
    }
    static Hide() { 
        return new Promise( (result) =>{
            this.scene.tweens.timeline({
                ease: 'Cubic',
                tweens:[ { 
                    duration: 750,
                    delay:1,
                    targets: this.alertResult,
                    y: this.scene.game.config.height * 1.5,
                    offset:0, 
                    onComplete: ()=>{ 
                        this.alertResult.destroy(); 
                        this.isAlert = false; 
                        //delete this; 
                        result(null); 
                    }
                }
            ]});
            
        });
    }
    
    static IsDefined(obj){
        return typeof obj !== "undefined";
    }
}
export class LoadingScreen {
    constructor(scene){
        let animation = Phaser.Math.Between(1, 2);
        this.loadingBackground = scene.add.image(0, 0, "loading_bg").setScale(120).setOrigin(0).setAlpha(0.9).setScrollFactor(0);
        this.loadingScreen = scene.add.sprite(scene.sys.game.scale.gameSize.width / 2, scene.sys.game.scale.gameSize.height / 2, `loading_screen_${animation}`, 0).setOrigin(0.5).setScrollFactor(0);
        this.loadingScreen.depth = 10;
        this.loadingBackground.depth = 10;
        
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
export class SettingsButton{
    static GetVolume(){
        return localStorage.getItem("volume");
    }
    static GetVolumeSFX(){
        return localStorage.getItem("volumeSFX");
    }
    constructor(x, y, scene, scale, Callback){
        this.isPanel = false;
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.scale = scale;
        this.Callback = Callback;

        if(localStorage.getItem("volume") === null)
            localStorage.setItem("volume", 0.5);
        if(localStorage.getItem("volumeSFX") === null)
            localStorage.setItem("volumeSFX", 0.5);
        if(localStorage.getItem("language") === null){
            localStorage.setItem("language", "en");
        }

        this.settingsButtonResult = scene.add.container(x, y)
        this.button = scene.add.sprite(0, 0 ,"engrane")
        .setInteractive(scene.input.makePixelPerfect())
        .setScale(scale)
        .on("pointerdown", ()=>{ 
            this.scene.sound.add("button-click", { loop: false, volume: SettingsButton.GetVolumeSFX()}).play();
            this.ShowOptionsPanel();
        })
        .on('pointerover',()=>{
            this.scene.sound.add("button-hover", { loop: false, volume: SettingsButton.GetVolumeSFX()}).play(); 
            this.button.setTint (0xaaaaaa);
        })
        .on("pointerout", ()=>{this.button.setTint (0xffffff);});
        this.settingsButtonResult.add(this.button);
    }
    ShowOptionsPanel(){
        if(this.isPanel)
            return;
        Alert.isAlert = this.isPanel = true;
        this.ambientVolume = parseFloat(Alert.IsDefined(localStorage.getItem("volume")) ?  localStorage.getItem("volume") : 0);
        this.SFXVolume = parseFloat(Alert.IsDefined(localStorage.getItem("volumeSFX")) ?  localStorage.getItem("volumeSFX") : 0);
        this.prevLang = this.language = localStorage.getItem("language") !== 'null' ? localStorage.getItem("language") : "en";
        this.configContainer = this.scene.add.container(this.scene.game.config.width / 2, this.scene.game.config.height/2).setDepth(6);
        this.configContainer.add(this.scene.add.image(0, 0, "options"));
        
        this.configContainer.add(this.scene.add.text(0, -335, Translate.Translate("Settings"), { fontSize:72, fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5, align: "center"}).setOrigin(0.5));
        this.configContainer.add(this.scene.add.text(0, -200, Translate.Translate("Language"), { fontSize:60 , fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5, align: "center"}).setOrigin(0.5));
        this.configContainer.add(this.engImg = this.scene.add.sprite(200, -115, "languages", localStorage.getItem("language") === "es" ? 0 : 1).setInteractive(this.scene.input.makePixelPerfect()).on("pointerdown", ()=>{ 
            this.language = "en"; 
            this.engImg.setTexture("languages", 1); 
            this.espImg.setTexture("languages", 2);
        }).setScale(0.2));
        this.configContainer.add(this.espImg = this.scene.add.sprite(-200, -115, "languages",  localStorage.getItem("language") === "es" ? 3 : 2).setInteractive(this.scene.input.makePixelPerfect()).on("pointerdown", ()=>{ this.language = "es"; this.espImg.setTexture("languages", 3); this.engImg.setTexture("languages", 0);}).setScale(0.2));

        this.configContainer.add(this.scene.add.text(0, -25, Translate.Translate("Volume"), { fontSize:60 , fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5, align: "center"}).setOrigin(0.5));
        this.configContainer.add(this.scene.add.image(0, 50, "volume"));
        this.configContainer.add(new Button(-360, 50, 1, "volume_off", null, this.scene, ()=>{    
            if(this.ambientVolume - 0.1 >= 0){
                this.ambientVolume -= 0.1;
                this.ambientVolumeHandler.setX(-310 + (620 * this.ambientVolume));
            }
        }, null, false, false).GetComponents());
        this.configContainer.add(this.ambientVolumeHandler = this.scene.add.image(-310 + (620 * this.ambientVolume), 50, "volume_handler"));
        this.configContainer.add(new Button(360, 50, 1, "volume_on", null, this.scene, () => { 
            if(this.ambientVolume + 0.1 <= 1){
                this.ambientVolume += 0.1;
                this.ambientVolumeHandler.setX(-310 + (620 * this.ambientVolume));
            }
        }, null, false, false).GetComponents());

        this.configContainer.add(this.scene.add.text(0, 125, Translate.Translate("SFX"), { fontSize:60 , fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5, align: "center"}).setOrigin(0.5));
        this.configContainer.add(this.scene.add.image(0, 200, "volume"));
        this.configContainer.add(new Button(-360, 200, 1, "volume_off", null, this.scene, ()=>{
            if(this.SFXVolume - 0.1 >= 0){
                this.SFXVolume -= 0.1;
                this.SFXVolumeHandler.setX(-310 + (620 * this.SFXVolume));
            }
        }, null, false, false).GetComponents());
        this.configContainer.add(this.SFXVolumeHandler = this.scene.add.image(-310 + (620 * this.SFXVolume), 200, "volume_handler"));
        this.configContainer.add(new Button(360, 200, 1, "volume_on", null, this.scene, () =>{
            if(this.SFXVolume + 0.1 <= 1){
                this.SFXVolume += 0.1;
                this.SFXVolumeHandler.setX(-310 + (620 * this.SFXVolume));
            }
        }, null, false, false).GetComponents());

        this.configContainer.add(new Button(0, 280, 0.5, "buttonContainer", Translate.Translate("Apply"), this.scene, ()=>{
            let prevVolumeSFX = localStorage.getItem("volumeSFX");
            localStorage.setItem("language", this.language);
            localStorage.setItem("volume", this.ambientVolume.toFixed(1));
            localStorage.setItem("volumeSFX", this.SFXVolume.toFixed(1));
            this.configContainer.destroy();
            Alert.isAlert = this.isPanel = false;
            if(this.language != this.prevLang || prevVolumeSFX != this.SFXVolume)
                location.reload();
        }, { fontSize:45 , fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5, align: "center"}, false).GetComponents())
    }
    GetComponents(){
        return this.buttonResult;
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
        this.card.setInteractive(this.scene.input.makePixelPerfect()).on("pointerdown", event);
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
    GetComponents = () => { 
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
export class TokenHud{
    TokenHud;
    burritoOverHUD = false;
    constructor(x, y, scene, currentNEAR, currentSTRW, player, useScrollFactor = false){
        this.TokenHud = {x, y, scene, player};

        this.hudResult = scene.add.container(x, y).setDepth(5).setScrollFactor(useScrollFactor ? 0 : 1);
        
        this.hudResult.add(this.nearHud = scene.add.image(-40, -150, "tokenHud"));
        this.hudResult.add(this.strwHud = scene.add.image(-40, -80, "tokenHud"));
        this.hudResult.add(this.nearToken = scene.add.image(-140, -150, "tokenIcon", 1));
        this.hudResult.add(this.strwToken = scene.add.image(-140, -80, "tokenIcon", 0));
        this.hudResult.add(this.strwText = scene.add.text(-56, -100, currentSTRW, { fontSize: 34, fontFamily: "BangersRegular" }));// cantidad de STRW Tokens del usuario
        this.hudResult.add(this.nearText = scene.add.text(-56, -171, currentNEAR, { fontSize: 34, fontFamily: "BangersRegular" }));// cantidad de NEAR Tokens del usuario

        this.hudResult.add(this.zone = scene.add.zone(-40, -115, this.nearHud.width, this.nearHud.height * 2.5));
        scene.physics.world.enable(this.zone);
    }
    Update(){
        this.hudResult.setPosition(this.TokenHud.scene.cameras.main.scrollX + this.TokenHud.x, this.TokenHud.scene.cameras.main.scrollY + this.TokenHud.y)
        if(this.burritoOverHUD != this.CheckOverlap()){
            this.burritoOverHUD = this.CheckOverlap();
            this.SetAlpha(this.burritoOverHUD ? 0.1 : 1)
        }
    }
    GetComponents () { 
        return this.hudResult;
    }
    async UpdateTokens(){
        let nears = await Near.GetCurrentNears();
        let strw = await Near.GetSTRWToken();
        this.strwText.setText(strw);
        this.nearText.setText(nears)
    }
    
    CheckOverlap() {
        var boundsA = this.zone.getBounds();
        var boundsB = this.TokenHud.player.getBounds();
    
        return Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundsB);
    }
    SetAlpha(alpha){
        this.hudResult.setAlpha(alpha);
    }
}
export class BackMainMenuHud{
    burritoOverHUD = false;
    constructor(x, y, scene, player){
        this.ButtonHud = {x, y, scene, player};
        this.hudcontainer = new Button(0, 0, 0.5, "buttonContainer", Translate.Translate("BtnGoMainMenu"), scene, scene.BackToMainMenu, {fontSize: 24, fontFamily: "BangersRegular"}, false, false).GetComponents().setDepth(5);
        this.hudcontainer.add(this.zone = scene.add.zone(0, 0, 300, 80));
        scene.physics.world.enable(this.zone);
    }
    Update(){
        this.hudcontainer.setPosition(this.ButtonHud.scene.cameras.main.scrollX + this.ButtonHud.x, this.ButtonHud.scene.cameras.main.scrollY + this.ButtonHud.y)
        if(this.burritoOverHUD != this.CheckOverlap()){
            this.burritoOverHUD = this.CheckOverlap();
            this.SetAlpha(this.burritoOverHUD ? 0.1 : 1)
        }
    }
    
    CheckOverlap() {
        var boundsA = this.hudcontainer.getBounds();
        var boundsB = this.ButtonHud.player.getBounds();
    
        return Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundsB);
    }
    SetAlpha(alpha){
        this.hudcontainer.setAlpha(alpha);
    }
}
export class BurritoHud{
    BurritoHud;
    burritoOverHUD = false;
    constructor(x, y, burrito, scene, player){
        this.BurritoHud = {x, y, burrito, scene, player };

        this.hudResult = scene.add.container(x, y).setDepth(5);
        this.hudResult.add(this.hud = scene.add.image(0, 0, "hud", this.GetIndexByType(burrito.burrito_type)));
        this.hudResult.add(this.burrito = scene.add.image(-83, -51, "burritoHud", this.GetSkinBurrito(burrito.media)));//Imagen del burrito en HUD     
        this.hudResult.add(scene.add.text(130, -82, burrito.hp, { fontSize: 50, fontFamily: "BangersRegular" }));//health
        this.hudResult.add(scene.add.text(130, 26, burrito.win, { fontSize: 50, fontFamily: "BangersRegular" }));//wins
        this.hudResult.add(this.zone = scene.add.zone(0, 0, this.hud.width, this.hud.height));

        scene.physics.world.enable(this.zone);

    }
    Update(){
        this.hudResult.setPosition(this.BurritoHud.scene.cameras.main.scrollX + this.BurritoHud.x, this.BurritoHud.scene.cameras.main.scrollY + this.BurritoHud.y)
        if(this.burritoOverHUD != this.CheckOverlap()){
            this.burritoOverHUD = this.CheckOverlap();
            this.SetAlpha(this.burritoOverHUD ? 0.1 : 1)
        }
    }
    CheckOverlap() {
        var boundsA = this.zone.getBounds();
        var boundsB = this.BurritoHud.player.getBounds();
    
        return Phaser.Geom.Intersects.RectangleToRectangle(boundsA, boundsB);
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
        this.hudResult.setAlpha(alpha);
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
            this.sliderResult.add(scene.add.text(10, -105, Translate.Translate("MsgLevel") + ": " + room.burrito_cpu_level, { fontSize: 45, fontFamily: "BangersRegular", color: 'white' , stroke: 0x000000, strokeThickness: 5}).setScale(-1, 1));
            this.sliderResult.add(scene.add.text(108, 45, Translate.Translate("MsgHealth") + ": " + parseFloat(isIncursion ? room.health : room.health_cpu).toFixed(2), { fontSize: 45, fontFamily: "BangersRegular", color: 'white', stroke: 0x000000, strokeThickness: 5 }).setScale(-1, 1));
        }else{
            this.sliderResult.add(scene.add.text(-150, -105, Translate.Translate("MsgLevel") + ": " + (isIncursion ? room.level : room.level_b1), { fontSize: 45, fontFamily: "BangersRegular", color: 'white', stroke: 0x000000, strokeThickness: 5 }))
            this.sliderResult.add(scene.add.text(-150, 45, Translate.Translate("MsgHealth") + ": " + parseFloat(isIncursion ? room.health : room.health_player).toFixed(2), { fontSize: 45, fontFamily: "BangersRegular", color: 'white', stroke: 0x000000, strokeThickness: 5 }))
        }
    }
    SetValue(value){
        this.fill.setCrop(0, 0, this.fill.width * value, this.fill.height);
        const components = this.sliderResult.list;
        if(this.isCPU){
            components[6].setText(Translate.Translate("MsgHealth") + ": " + (value*this.room.start_health_cpu).toFixed(2));
        }else{
            components[6].setText(Translate.Translate("MsgHealth") + ": " + (value * (this.isIncursion ? this.room.health : this.room.start_health_player)).toFixed(2));
        }
        return this;
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

        this.action1.setInteractive(scene.input.makePixelPerfect()).on("pointerdown", ()=> { 
            this.SendAction();
            this.actions.Action1(); 
        });
        this.action2.setInteractive(scene.input.makePixelPerfect()).on("pointerdown", ()=> {
            if((this.IsMyTurn() ? battle.strong_attack_player : battle.shields_player) > 0){ 
                this.SendAction();
                this.actions.Action2();
            } else {
                Alert.Fire(this.scene, null, Translate.Translate("MsgNotAccion"))
            }
        });
        this.ShowActions();

        this.action1
            .on('pointerover', () => {
                this.action1.setTint (this.overColor);
                this.actionsResult.add(this.text1 = scene.add.text(this.IsMyTurn() ? -55 : -38, this.IsMyTurn() ? -272 : -290, this.IsMyTurn() ? Translate.Translate("MsgAttack") : Translate.Translate("MsgPassTurn"), {fontSize: 30, fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5}));
            })
            .on("pointerout", () => {
                this.action1.setTint (this.outColor);
                this.text1.destroy();
            });
        this.action2
            .on('pointerover', () => {
                this.action2.setTint (this.overColor);
                this.text.visible = false;
                this.actionsResult.add(this.text2 = scene.add.text(this.IsMyTurn() ? 185 : 175, this.IsMyTurn() ? -130: -102, this.IsMyTurn() ? Translate.Translate("MsgHeavyAttack") : Translate.Translate("MsgDefense"), {fontSize: 28, fontFamily: "BangersRegular", stroke: 0x000000, strokeThickness: 5}));
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
export class BattleEnd{
    constructor(x, y, scene, isVictoria, STRWTokens, isIncursion = false){
        this.resultUI = scene.add.container(x, y);
        scene.anims.create({ key: "backgroundAnim", frames: scene.anims.generateFrameNumbers("background_animation", { frames: [0, 1, 2, 3] }), frameRate: 24, repeat: 0 });
        this.resultUI.add(this.backgroundAnimation = scene.add.sprite(0, 0));
        this.backgroundAnimation.play("backgroundAnim");

        scene.anims.create({ key: "finishAnim", frames: scene.anims.generateFrameNumbers(isVictoria ? "victoria" : "derrota", { frames: scene.Range(0, 18)}), frameRate: 24, repeat: 0 });
        this.resultUI.add(this.animation = scene.add.sprite(0, 0));
        this.animation.play("finishAnim");
        setTimeout(() => {
            if(!isIncursion){
                this.resultUI.add(scene.add.text(245, 390, `+${STRWTokens}`, {fontSize:40, fontFamily:"BangersRegular"}).setOrigin(0.5));
                this.resultUI.add(scene.add.text(-255, 390, isVictoria ? "+1" : "-1", {fontSize:40, fontFamily:"BangersRegular"}).setOrigin(0.5));
            } 
            this.resultUI.add(scene.add.text(10, -305, isVictoria ? Translate.Translate("MsgVictory") : Translate.Translate("MsgDefeat"), {fontSize: 100, fontFamily:"BangersRegular", stroke: 0x000000, strokeThickness: 5, align: "center"}).setOrigin(0.5));
            this.resultUI.add(this.burrito = scene.add.sprite(0, 30).setScale(0.75));
            if(isVictoria)
                this.burrito.play("victoria_Player");
            else if(!isIncursion)
                this.burrito.play("derrota_Player");

        }, 1000);  
    }
}
export class DialogueBox{
    i = 0;
    iText = 0;
    constructor(scene, x, y, text, flip, scale, callback){
        this.text = text;
        this.callback = callback;
        this.container = scene.add.container(scene.game.config.width/2, scene.game.config.height - 200);
        this.container.add(this.dialogue_boxImage = scene.add.image(0, 0, "dialog").setFlip(flip).setScale(scale));
        this.container.add(this.texto = scene.add.text((-this.dialogue_boxImage.width / 2 + 60) * scale, (-this.dialogue_boxImage.height / 2 + 60) * scale, "", { fontSize: 60, fontFamily: "BangersRegular", color: 'white', stroke: 0x000000, strokeThickness: 5, wordWrap: { width: 1100 }}).setOrigin(0).setScale(scale))
        
        this.TypeWriter(this.iText);
    }
    TypeWriter=(n) =>{
        if(this.i < this.text[n].length){
            this.texto.text += this.text[n].charAt(this.i);
            this.i++;
            setTimeout(()=>{this.TypeWriter(n)}, 30);
        } else{ 
            setTimeout(()=>{
                this.texto.text =""
                this.dialogue_boxImage.setVisible(false); 
                setTimeout(() => {
                    if(this.iText < this.text.length - 1){
                        this.iText++;
                        this.i=0;
                        this.dialogue_boxImage.setVisible(true); 
                        this.TypeWriter(this.iText);
                    } else{
                        this.callback();
                        this.container.destroy();
                    }
                }, 500);
            }, 1000)
        }
    }
}
export class InfoCard{
    InfoCard;
    constructor(x, y, burrito, scene, interactuable = false){
        this.InfoCard = {x, y, burrito, scene };
        const components = scene.bigCard.GetComponents().list
        components[1].visible = false;
        for (const item of components) {
            if(item.type === "Text") {
                item.visible = false;      
            }
        }

        this.cardResult = scene.add.container(x, y).setScrollFactor(0)
        this.numBurrito = burrito.name.split("#", 2);
        console.log(Translate.Translate(burrito.burrito_type));
        this.cardResult.add(scene.add.text(-100, -235, "Burrito #" + this.numBurrito[1] + "\n" + Translate.Translate("Type") + burrito.burrito_type + "\n" + Translate.Translate("Level") + burrito.level+ "\n" + Translate.Translate("Wins") + burrito.win + "\n" + Translate.Translate("Lifes") + burrito.hp + "\n" + Translate.Translate("Strength") + burrito.attack + "\n" + Translate.Translate("Defense") + burrito.defense + "\n" + Translate.Translate("Speed") + burrito.speed, { fontSize: 45, fontFamily: "BangersRegular", color: 'white' }));
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
export class Carousel{
    constructor(scene, values){
        this.counter = 0;
        this.scene = scene;
        this.values = values
        this.Draw(0);
        new Button(scene.game.config.width / 2 - 600, scene.game.config.height / 2 - 200, 1, "left_arrow", null, scene, ()=>{ this.Navigate(-1); }, {fontSize: 30, fontFamily: "BangersRegular"});
        new Button(scene.game.config.width / 2 + 600,  scene.game.config.height / 2 - 200, 1, "right_arrow", null, scene, ()=>{ this.Navigate(1); }, {fontSize: 30, fontFamily: "BangersRegular"});
    }
    Navigate(nav){
        if(this.counter + nav >= 0 && this.counter + nav < this.values.length){
            this.counter += nav;    
            this.Update();
        }
    }
    Draw(value){
        this.scene.anims.create({key: 'currentAnim', frames: this.scene.anims.generateFrameNumbers(this.values[value].image.img, {frames: this.scene.Range(0, this.values[value].image.frames - 1)}), frameRate: 2, repeat: -1 });

        this.image = this.scene.add.sprite(this.scene.game.config.width / 2, this.scene.game.config.height / 2 - 200).setScale(1.5);
        this.image.play("currentAnim");
        this.title = this.scene.add.text(this.scene.game.config.width / 2, this.scene.game.config.height / 2 + 150, Translate.Translate(this.values[value].title), { fontSize: 80, fontFamily: "BangersRegular", align: "center", wordWrap: { width: 900 }}).setOrigin(0.5);
        this.description = this.scene.add.text(this.scene.game.config.width / 2, this.scene.game.config.height / 2 + 300, Translate.Translate(this.values[value].description), { fontSize: 40, fontFamily: "BangersRegular", align: "center", wordWrap: { width: 800 }}).setOrigin(0.5);
    }
    Update(){
        this.scene.anims.remove("currentAnim")
        this.scene.anims.create({key: 'currentAnim', frames: this.scene.anims.generateFrameNumbers(this.values[this.counter].image.img, {frames: this.scene.Range(0, this.values[this.counter].image.frames - 1)}), frameRate: 3, repeat: -1 });
        this.image.play("currentAnim");

        //this.image.setTexture(this.values[this.counter].image);
        this.title.setText(Translate.Translate(this.values[this.counter].title));
        this.description.setText(Translate.Translate(this.values[this.counter].description));
    }
}