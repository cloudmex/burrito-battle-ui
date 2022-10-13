import { Button, Alert, LoadingScreen, SettingsButton, Card, TokenHud, Slider, Actions, BattleEnd } from '../Helpers/Helpers.js'
import *  as Near from '../Near.js';
import {Translate} from '../Language/Translate.js'

export default class Battle extends Phaser.Scene{
    constructor(){
        super("Battle");
        this.currentBattle;
        this.alertVisible = false;
    }
    preload(){
        this.load.spritesheet("burritos", '../src/assets/Images/Battle/Burritos.png', { frameWidth: 200, frameHeight: 268});
        this.load.image("slider_background", '../src/assets/Images/Battle/slider_background.png');
        this.load.spritesheet("slider_fill", '../src/assets/Images/Battle/slider_fill.png', { frameWidth: 512, frameHeight: 89 });
        this.load.image("background_Battle", '../src/assets/Images/Establo/Background.webp');
        this.load.image("field_background", '../src/assets/Images/Battle/field_background.png');
        this.load.image("desert_background", '../src/assets/Images/Battle/desert_background.png');
        this.load.spritesheet("actions", '../src/assets/Images/Battle/battle_actions.png', {frameWidth: 160, frameHeight: 160});
    }
    async create(){
        this.sound.stopAll();
        this.sound.removeAll();
        this.sound.pauseOnBlur = false;
        Alert.isAlert = false;
        await Translate.LoadJson();
        
        
        if(localStorage.getItem("battle_background") == "desert")
            this.add.image(0, 0, "desert_background").setOrigin(0);
        else if(localStorage.getItem("battle_background") == "pradera")
            this.add.image(0, 0, "field_background").setOrigin(0);
        else
            this.add.image(0, 0, "background_Battle").setOrigin(0);
        new Button(this.game.config.width / 2 , 50, 0.5, "buttonContainer", Translate.Translate("MsgSurrender"), this, this.GiveUp , {fontSize: 30, fontFamily: "BangersRegular"});
        localStorage.setItem("lastScene", "Battle");
        
       await this.GetBattle().then(async () => {
           if(localStorage.getItem("burritoCPU") == null)
            localStorage.setItem("burritoCPU", this.RandomBurrito());
            this.burritoSkinCPU = localStorage.getItem("burritoCPU");

            await Near.GetNFTToken(localStorage.getItem("burrito_selected")).then(async (result)=>{
                this.burritoSkinPlayer = result;
                await this.loadSpriteSheet(this.burritoMediaToSkin(result.media), this.burritoSkinCPU);
            });
       });
    }
    
    async GetBattle(){
        let info = await Near.GetInfoByURL();
        if(info != null){
            try{
                this.currentBattle = JSON.parse(info.receipts_outcome[6].outcome.logs[0]);
                localStorage.removeItem("tempBattle");
            } catch {
                this.currentBattle = JSON.parse(info.receipts_outcome[0].outcome.logs[0]);
            }
            if(localStorage.getItem("tempBattle") != null){
                this.battleAnims = this.DiffStatus(this.Diff(this.currentBattle, JSON.parse(localStorage.getItem("tempBattle"))))
                this.tmpBattle = JSON.parse(localStorage.getItem("tempBattle"));
                localStorage.removeItem("tempBattle");
            } 
        } else {
            //this.currentBattle = { status: "2", player_id: "jesusrobles.testnet", burrito_id: "28", accesories_attack_b1: "0", accesories_defense_b1: "0", accesories_speed_b1: "0", attack_b1: "5", defense_b1: "9", speed_b1: "6", level_b1: "1", accesories_attack_b2: "0", accesories_defense_b2: "0", accesories_speed_b2: "0", turn: "CPU", strong_attack_player: "3", shields_player: "3", start_health_player: "20", health_player: "20", strong_attack_cpu: "3", shields_cpu: "3", start_health_cpu: "36", health_cpu: "36", burrito_cpu_level: "3", burrito_cpu_type: "Volador", burrito_cpu_attack: "8", burrito_cpu_defense: "15", burrito_cpu_speed: "13", rewards: "" }
            //return;
            let isInBattle = await Near.IsInBattle();
            if(isInBattle){
                this.currentBattle = await Near.GetBattleActiveCpu();
            } else{
                this.currentBattle = await Near.CreateBattlePlayerCpu();
            }
            console.log(this.currentBattle)
        }
    }
    async LoadBurritos(){
        //#region Burrito Player
        this.CreateAnimations("Player");
        this.burritoPlayer = this.add.sprite(this.game.config.width /2 - 700, this.game.config.height - 300, "burrito_idle_player").setOrigin(0.5);
        this.burritoPlayer.play("idle_Player");
        
        //this.sliderPlayer = new Slider(this.game.config.width / 2 - 550, 150, this, this.burritoMediaToSkinHead(this.burritoSkinPlayer.media), this.currentBattle)
        //.SetValue(parseFloat(this.currentBattle.health_player) / parseFloat(this.currentBattle.start_health_player));
        if(this.currentBattle.rewards == "")
            this.CreateActionsMenu();
        //#endregion

        //#region Burrito CPU
        this.CreateAnimations("CPU");
        this.burritoCPU = this.add.sprite(this.game.config.width / 2 + 700, this.game.config.height - 300, "burrito_idle_CPU", 0).setOrigin(0.5).setFlipX(true);
        this.burritoCPU.play("idle_CPU");
        
        let healthCPU = 1;
        let healthPlayer = 1;
        try{
            healthPlayer = parseFloat(this.tmpBattle.health_player) / parseFloat(this.tmpBattle.start_health_player);
            healthCPU = parseFloat(this.tmpBattle.health_cpu) / parseFloat(this.tmpBattle.start_health_cpu);
        } catch{
            healthPlayer = parseFloat(this.currentBattle.health_player) / parseFloat(this.currentBattle.start_health_player);
            healthCPU = parseFloat(this.currentBattle.health_cpu) / parseFloat(this.currentBattle.start_health_cpu);
        }

        this.sliderPlayer = new Slider(this.game.config.width / 2 - 550, 150, this, this.burritoMediaToSkinHead(this.burritoSkinPlayer.media), this.currentBattle)
        .SetValue(healthPlayer);
        this.sliderCPU = new Slider(this.game.config.width / 2 + 550, 150, this, this.burritoMediaToSkinHead(this.burritoSkinCPU), this.currentBattle, true)
        .SetValue(healthCPU);

        if(this.IsDefined(this.battleAnims))
            this.Animation(this.battleAnims.animPlayer, this.battleAnims.animCPU);
        
        this.sound.add("battle-background", { loop: true, volume: SettingsButton.GetVolume()}).play();
        this.sfxKick1 = this.sound.add("kick_1", {loop: false, volume:SettingsButton.GetVolumeSFX()});
        this.sfxKick2 = this.sound.add("kick_2", {loop: false, volume:SettingsButton.GetVolumeSFX()});
        this.sfxDano = this.sound.add("dano", {loop: false, volume:SettingsButton.GetVolumeSFX()});
        this.sfxCover = this.sound.add("cover", {loop:false, volume:SettingsButton.GetVolumeSFX()});
        await this.loadingScreen.OnComplete();
    }
    Animation(animPlayer, animCPU){
        if(animPlayer === "Ataque1"){
            setTimeout(()=>{ this.sfxKick1.play();}, 200);
        } else if(animPlayer === "Ataque2"){
            setTimeout(()=>{ this.sfxKick2.play();}, 200);
        } else if(animPlayer === "dano"){
            setTimeout(()=>{ this.sfxDano.play();}, 500);
        } else if(animPlayer === "defensa") {
            setTimeout(()=>{this.sfxCover.play(); }, 500);
        }

        if(animCPU === "Ataque1"){
            setTimeout(()=>{ this.sfxKick1.play();}, 200);
        } else if(animCPU === "Ataque2"){
            setTimeout(()=>{ this.sfxKick2.play();}, 200);
        } else if(animCPU === "dano"){
            setTimeout(()=>{ this.sfxDano.play();}, 500);
        } else if(animCPU === "defensa") {
            setTimeout(()=>{this.sfxCover.play();}, 500);
        }

        this.burritoCPU.play(animCPU + "_CPU").once('animationcomplete', () => {
            this.sliderCPU.SetValue(parseFloat(this.currentBattle.health_cpu) / parseFloat(this.currentBattle.start_health_cpu));
            this.AccionLog("CPU", animCPU);
            if(animCPU  !== "derrota"){
                this.burritoCPU.play("idle_CPU");
            } else
                this.BackToPradera("Player");
        });
        this.burritoPlayer.play(animPlayer + "_Player").once('animationcomplete', () => {
            this.sliderPlayer.SetValue(parseFloat(this.currentBattle.health_player) / parseFloat(this.currentBattle.start_health_player));
            this.AccionLog("Player",  animPlayer);
            
            if(animPlayer !== "derrota"){
                this.burritoPlayer.play("idle_Player");
            } else
                this.BackToPradera("CPU");
                
        });
    }
    CreateActionsMenu = async () => {
        new Actions(this.game.config.width / 2 - 600, this.game.config.height - 400, this, this.currentBattle, { Action1: ()=>{ this.Action("Player", 1); }, Action2: ()=> { this.Action("Player", 2); }});
    }
    Action = async(player, index) => {
        let tempBattle = this.currentBattle;
        localStorage.setItem("tempBattle", JSON.stringify(tempBattle));
        let result = await Near.BattlePlayerCPU(this.ActionIndex(index, player));
        
        this.currentBattle = result;
        let diff = this.Diff(this.currentBattle, tempBattle);
        this.DiffStatus(diff);

        if(!this.IsDefined(diff.rewards))
            setTimeout(() => {this.CreateActionsMenu();} , 1000);
    }
    BackToField(){
        localStorage.removeItem("burritoCPU");
        localStorage.removeItem("tempBattle");
        localStorage.removeItem("battle_background");

        localStorage.setItem("lastScene", "Pradera");
        location.reload();
    }
    Loose(){
        this.burritoCPU.play("victoria_CPU");
        this.burritoPlayer.play("derrota_Player");
        this.BackToPradera("CPU");
    }
    Win(){
        this.burritoCPU.play("derrota_CPU");
        this.burritoPlayer.play("victoria_Player");
        this.BackToPradera("Player");
    }
    BackToPradera = (winner) => {
        let isWinner = winner == "Player";
        new BattleEnd(this.game.config.width / 2, this.game.config.height / 2, this, isWinner, this.currentBattle.rewards);
        setTimeout(() => {
            this.BackToField();
        }, 10000);
    }
    IsDefined(obj){
        return typeof obj !== "undefined";
    }
    DiffStatus = (diff) => {
        let _animCPU;
        let _animPlayer;

        if(diff.turn == "Player"){
            _animPlayer = this.IsDefined(diff.strong_attack_player) ? "Ataque2" : "Ataque1";
            _animCPU = this.IsDefined(diff.shields_cpu) ? "defensa" : "dano";
        } else if(diff.turn == "CPU"){
            _animCPU = this.IsDefined(diff.strong_attack_cpu) ? "Ataque2" : "Ataque1";
            _animPlayer = this.IsDefined(diff.shields_player) ? "defensa" : "dano";
        }
        if(this.currentBattle.health_player <= 0){
            _animCPU = "victoria";
            _animPlayer = "derrota";
        }
        if(this.currentBattle.health_cpu <= 0){
            _animCPU = "derrota";
            _animPlayer = "victoria";
        }

        try{
            this.Animation(_animPlayer, _animCPU);
            
        } catch{
            return { "animPlayer": _animPlayer, "animCPU": _animCPU, "healthPlayer": diff.healthPlayer, "healthCPU": diff.healthCPU }
        }
    }
    AccionLog(burrito, accion){
        let result = "";
        let currentBattle = this.currentBattle;
        let tmpBattle = (localStorage.getItem("tempBattle") != null) ? JSON.parse(localStorage.getItem("tempBattle")) : this.tmpBattle;
        
        let damage = parseFloat(tmpBattle["health_" + burrito.toLowerCase()]) - parseFloat(currentBattle["health_" + burrito.toLowerCase()]);
        switch (accion) {
            case "Ataque1":
                result = burrito + ":" + Translate.Translate("MsgWeakAttack"); 
                break;
            case "Ataque2":
                result = burrito + ":" + Translate.Translate("MsgStrongAttack"); 
                break;
            case "dano":
                result = burrito + ":" + Translate.Translate("MsgDamage") + damage.toFixed(2); 
                break;
            case "defensa":
                result = burrito + ":" + Translate.Translate("MsgShield"); 
                break;
            default:
                result = "undefined";
                break;
        }
        if(result != "undefined")
            this.DisplayText(burrito, result);
    }
    DisplayText(burrito, result){
        let text = this.add.text(this.game.config.width / 2 + (burrito == "Player" ? - 700 : 700), 300, result, { fontSize:35   , fontFamily:"BangersRegular", stroke: 0x000000, strokeThickness: 5 })
        .setOrigin(0.5)
        .setTint(0xffffff);
        this.tweens.timeline({
            ease: 'Power2',
            duration: 2000,
            delay:3000,
            tweens:[
            {
                alpha: 0, 
                targets: text,
                y: this.game.config.height / 2,
                onComplete: ()=>{ text.destroy(); }
            }
        ]});
    }
    Diff(obj1, obj2) {
        const result = {};
        if (Object.is(obj1, obj2)) {
            return undefined;
        }
        if (!obj2 || typeof obj2 !== 'object') {
            return obj2;
        }
        Object.keys(obj1 || {}).concat(Object.keys(obj2 || {})).forEach(key => {
            if(obj2[key] !== obj1[key] && !Object.is(obj1[key], obj2[key])) {
                result[key] = obj2[key];
            }
            if(typeof obj2[key] === 'object' && typeof obj1[key] === 'object') {
                const value = diff(obj1[key], obj2[key]);
                if (value !== undefined) {
                    result[key] = value;
                }
            }
        });
        return result;
    }
    ActionIndex(index, player){
        let result = (this.IsMyTurn(player) ? 0 : 2) + index;
        return result.toString();
    }
    GiveUp = async () => {
        await Alert.Fire(this, Translate.Translate("TleSurrenderAlert"), Translate.Translate("MsgSurrenderAlert"), Translate.Translate("BtnWildBurrtitoAlertEscape"), Translate.Translate("BtnKeepFighting"))
        .then(async (result) => { 
            if (result){
                this.loadingScreen = new LoadingScreen(this);
               
                await Near.SurrenderCpu(); 
                await this.loadingScreen.OnComplete();
                this.BackToField();
            } 
        });
    }
    IsMyTurn(player) {
        return this.currentBattle.turn == player;
    }
    Range(start, end) {
        return Array(end - start + 1).fill().map((_, idx) => start + idx);
    }
    RandomBurrito(){
        let values = ["agua", "fuego", "electrico", "planta"];
        return values[Math.floor(Math.random() * values.length)];
    }
    burritoMediaToSkinHead(media){
        switch(media){
            case "planta":
            case "QmZEK32JEbJH3rQtXL9BqQJa2omXfpjuXGjbFXLiV2Ge9D": return 0;
            case "electrico":
            case "QmULzZNvTGrRxEMvFVYPf1qaBc4tQtz6c3MVGgRNx36gAq": return 1;
            case "agua":
            case "QmbMS3P3gn2yivKDFvHSxYjVZEZrBdxyZtnnnJ62tVuSVk": return 2;
            case  "fuego":
            case "QmQcTRnmdFhWa1j47JZAxr5CT1Cdr5AfqdhnrGpSdr28t6": return 3;
        }
    }
    burritoMediaToSkin(media){
        switch(media){
            case "QmULzZNvTGrRxEMvFVYPf1qaBc4tQtz6c3MVGgRNx36gAq": return "electrico";
            case "QmZEK32JEbJH3rQtXL9BqQJa2omXfpjuXGjbFXLiV2Ge9D": return "planta";
            case "QmQcTRnmdFhWa1j47JZAxr5CT1Cdr5AfqdhnrGpSdr28t6": return "fuego";
            case "QmbMS3P3gn2yivKDFvHSxYjVZEZrBdxyZtnnnJ62tVuSVk": return "agua";
        }
    }
    loadSpriteSheet(folderPlayer, folderCPU){ 
        this.scene.remove("Pradera");
        this.loadingScreen = new LoadingScreen(this);

        this.load.spritesheet(`burrito_idle_Player`, `../src/assets/Images/Battle/${folderPlayer}/Espera.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_ataque1_Player`, `../src/assets/Images/Battle/${folderPlayer}/Ataque_ligero.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_ataque2_Player`, `../src/assets/Images/Battle/${folderPlayer}/Ataque_pesado.webp`, {frameWidth: 700, frameHeight: 512});
        this.load.spritesheet(`burrito_defensa_Player`, `../src/assets/Images/Battle/${folderPlayer}/Defensa.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_dano_Player`, `../src/assets/Images/Battle/${folderPlayer}/Dano.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_derrota_Player`, `../src/assets/Images/Battle/${folderPlayer}/Derrota.webp`, {frameWidth: 700, frameHeight: 512});
        this.load.spritesheet(`burrito_victoria_Player`, `../src/assets/Images/Battle/${folderPlayer}/Victoria.webp`, {frameWidth: 512, frameHeight: 512});

        this.load.spritesheet(`burrito_idle_CPU`, `../src/assets/Images/Battle/${folderCPU}/Espera.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_ataque1_CPU`, `../src/assets/Images/Battle/${folderCPU}/Ataque_ligero.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_ataque2_CPU`, `../src/assets/Images/Battle/${folderCPU}/Ataque_pesado.webp`, {frameWidth: 700, frameHeight: 512});
        this.load.spritesheet(`burrito_defensa_CPU`, `../src/assets/Images/Battle/${folderCPU}/Defensa.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_dano_CPU`, `../src/assets/Images/Battle/${folderCPU}/Dano.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_derrota_CPU`, `../src/assets/Images/Battle/${folderCPU}/Derrota.webp`, {frameWidth: 700, frameHeight: 512});
        this.load.spritesheet(`burrito_victoria_CPU`, `../src/assets/Images/Battle/${folderCPU}/Victoria.webp`, {frameWidth: 512, frameHeight: 512});
        
        this.load.spritesheet("derrota", "../src/assets/Images/Battle/Derrota.webp", { frameWidth: 1920, frameHeight: 1080 });
        this.load.spritesheet("victoria", "../src/assets/Images/Battle/Victoria.webp", { frameWidth: 1920, frameHeight: 1080 });
        this.load.spritesheet("background_animation", "../src/assets/Images/Battle/Background.webp", { frameWidth: 1920, frameHeight: 1080 });

        //audio
        this.load.audio("battle-background", '../src/assets/audio/battle.ogg');
        this.load.audio("kick_1", '../src/assets/audio/attack strong.wav');
        this.load.audio("kick_2", '../src/assets/audio/attack weak.wav');
        this.load.audio("dano", '../src/assets/audio/donkey-hit.wav');
        this.load.audio("cover", '../src/assets/audio/cover.wav');

        this.load.once("complete", this.LoadBurritos, this);
        this.load.start();
    }
    CreateAnimations(player){
        this.anims.create({ key: `idle_${player}`, frames: this.anims.generateFrameNumbers(`burrito_idle_${player}`, { frames: this.Range(0, 18)}), frameRate: 24, repeat: -1 });
        this.anims.create({ key: `Ataque1_${player}`, frames: this.anims.generateFrameNumbers(`burrito_ataque1_${player}`, { frames: this.Range(0, 23) }), frameRate: 24, repeat: 0 });
        this.anims.create({ key: `Ataque2_${player}`, frames: this.anims.generateFrameNumbers(`burrito_ataque2_${player}`, { frames: this.Range(0, 20) }), frameRate: 24, repeat: 0 });
        this.anims.create({ key: `defensa_${player}`, frames: this.anims.generateFrameNumbers(`burrito_defensa_${player}`, { frames: this.Range(0, 15) }), frameRate: 24, repeat: 0 });
        this.anims.create({ key: `dano_${player}`, frames: this.anims.generateFrameNumbers(`burrito_dano_${player}`, { frames: this.Range(0, 23) }), frameRate: 24, repeat: 0 });
        this.anims.create({ key: `derrota_${player}`, frames: this.anims.generateFrameNumbers(`burrito_derrota_${player}`, { frames: this.Range(0, 23) }), frameRate: 24, repeat: 0 });
        this.anims.create({ key: `victoria_${player}`, frames: this.anims.generateFrameNumbers(`burrito_victoria_${player}`, { frames: this.Range(0, 23) }), frameRate: 24, repeat: -1 });
    }
}