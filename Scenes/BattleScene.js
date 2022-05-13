import * as Near  from "../src/near.js";
import * as Helpers from "../src/Helpers/Helpers.js";

export class Battle extends Phaser.Scene{
    currentBattle;
    constructor(){
        super("Battle");
    }
    async preload(){
        this.load.spritesheet("loading_screen_1", `../src/images/loading_screen_1.webp`, { frameWidth: 720, frameHeight: 512 });
        this.load.spritesheet("loading_screen_2", `../src/images/loading_screen_2.webp`, { frameWidth: 512, frameHeight: 512 });
        this.load.image("loading_bg", "../src/images/loading_bg.png");
        this.loadingScreen = new Helpers.LoadingScreen(this);

        this.load.spritesheet("burritos", "../src/images/Battle/Burritos.png", { frameWidth: 200, frameHeight: 268});
        this.load.image("slider_background", "../src/images/Battle/slider_background.png");
        this.load.spritesheet("slider_fill", "../src/images/Battle/slider_fill.png", { frameWidth: 800, frameHeight: 89 });
        
        this.load.image("background_Battle", "../src/images/Establo/Background.webp")
        this.load.image("burrito", "../src/images/Burrito Agua.png");
        this.load.image("buttonContainer3", "../src/images/button.png");
        this.load.spritesheet("actions", "../src/images/Battle/battle_actions.png", {frameWidth: 128, frameHeight: 128})

        
        if(localStorage.getItem("burritoCPU") == null)
           localStorage.setItem("burritoCPU", this.RandomBurrito());
        this.burritoSkinCPU = localStorage.getItem("burritoCPU");

        this.burritoSkinPlayer = await Near.GetNFTToken(localStorage.getItem("burrito_selected"));

        this.loadSpriteSheet("Player", this.burritoMediaToSkin(this.burritoSkinPlayer.media));
        this.loadSpriteSheet("CPU", this.burritoSkinCPU);
    }
    async create(){
        this.add.image(0, 0, "background_Battle").setOrigin(0);
        new Helpers.Button(this.game.config.width / 2 , 50, 0.5, "buttonContainer3", "Rendirse", this, this.GiveUp , null, {fontSize: 30, fontFamily: "BangersRegular"});
        localStorage.setItem("lastScene", "Battle");
        let info = await Near.GetInfoByURL();
        if(info != null){
            this.currentBattle = info.receipts_outcome[0].outcome.logs[0];
        } else {
            let isInBattle = await Near.IsInBattle();
            if(isInBattle){
                this.currentBattle = await Near.GetBattleActiveCpu();
            } else { 
                this.currentBattle = await Near.CreateBattlePlayerCpu();
            }
        }
        //this.currentBattle = JSON.parse('{"accesories_attack_b1":"0","accesories_attack_b2":"0","accesories_defense_b1":"0","accesories_defense_b2":"0","accesories_speed_b1":"0","accesories_speed_b2":"0","attack_b1":"8","burrito_cpu_attack":"8","burrito_cpu_defense":"7","burrito_cpu_level":"1","burrito_cpu_speed":"6","burrito_cpu_type":"Planta","burrito_id":"2","defense_b1":"7","health_cpu":"11","health_player":"20","level_b1":"1","player_id":"jesus13th.testnet","shields_cpu":"3","shields_player":"3","speed_b1":"5","start_health_cpu":"11","start_health_player":"20","status":"2","strong_attack_cpu":"3","strong_attack_player":"3","turn":"CPU"}');

        //#region Burrito Player
        this.CreateAnimations("Player");
        this.burritoPlayer = this.add.sprite(this.game.config.width /2 - 700, this.game.config.height - 300, "burrito_idle_player").setOrigin(0.5);
        this.burritoPlayer.play("idle_Player");
        this.sliderPlayer = new Helpers.Slider(this.game.config.width / 2 - 550, 150, this, this.burritoMediaToSkinHead(this.burritoSkinPlayer.media)).SetValue(parseFloat(this.currentBattle.health_player) / parseFloat(this.currentBattle.start_health_player)).SetFlipX(false);
        this.CreateActionsMenu();
        //#endregion

        //#region Burrito CPU
        this.CreateAnimations("CPU");
        this.burritoCPU = this.add.sprite(this.game.config.width / 2 + 700, this.game.config.height - 300, "burrito_idle_CPU", 0).setOrigin(0.5).setFlipX(true);
        this.burritoCPU.play("idle_CPU");
        this.sliderCPU = new Helpers.Slider(this.game.config.width / 2 + 550, 150, this, this.burritoMediaToSkinHead(this.burritoSkinCPU)).SetValue(parseFloat(this.currentBattle.health_cpu) / parseFloat(this.currentBattle.start_health_cpu)).SetFlipX(true);
        //#endregion
        await this.loadingScreen.OnComplete();
    }
    burritoMediaToSkinHead(media){
        switch(media){
            case "QmULzZNvTGrRxEMvFVYPf1qaBc4tQtz6c3MVGgRNx36gAq" || "fuego": return 1;
            case "QmZEK32JEbJH3rQtXL9BqQJa2omXfpjuXGjbFXLiV2Ge9D" || "planta": return 0;
            case "QmQcTRnmdFhWa1j47JZAxr5CT1Cdr5AfqdhnrGpSdr28t6" || "electrico": return 3;
            case "QmbMS3P3gn2yivKDFvHSxYjVZEZrBdxyZtnnnJ62tVuSVk" || "agua": return 2;
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
    loadSpriteSheet(player, folder){
        this.load.spritesheet(`burrito_idle_${player}`, `../src/images/Battle/${folder}/Espera.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_ataque1_${player}`, `../src/images/Battle/${folder}/Ataque_ligero.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_ataque2_${player}`, `../src/images/Battle/${folder}/Ataque_pesado.webp`, {frameWidth: 360, frameHeight: 600});
        this.load.spritesheet(`burrito_dano_${player}`, `../src/images/Battle/${folder}/Dano.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_derrota_${player}`, `../src/images/Battle/${folder}/Derrota.webp`, {frameWidth: 620, frameHeight: 512});
        this.load.spritesheet(`burrito_victoria_${player}`, `../src/images/Battle/${folder}/Victoria.webp`, {frameWidth: 512, frameHeight: 512});
    }
    CreateAnimations(player){
        this.anims.create({ key: `idle_${player}`, frames: this.anims.generateFrameNumbers(`burrito_idle_${player}`, { frames: this.Range(0, 18)}), frameRate: 24, repeat: -1 });
        this.anims.create({ key: `Ataque1_${player}`, frames: this.anims.generateFrameNumbers(`burrito_ataque1_${player}`, { frames: this.Range(0, 23) }), frameRate: 24, repeat: -1 });
        this.anims.create({ key: `Ataque2_${player}`, frames: this.anims.generateFrameNumbers(`burrito_ataque2_${player}`, { frames: this.Range(0, 23) }), frameRate: 24, repeat: -1 });
        this.anims.create({ key: `dano_${player}`, frames: this.anims.generateFrameNumbers(`burrito_dano_${player}`, { frames: this.Range(0, 23) }), frameRate: 24, repeat: -1 });
        this.anims.create({ key: `derrota_${player}`, frames: this.anims.generateFrameNumbers(`burrito_derrota_${player}`, { frames: this.Range(0, 23) }), frameRate: 24, repeat: -1 });
        this.anims.create({ key: `victoria_${player}`, frames: this.anims.generateFrameNumbers(`burrito_victoria_${player}`, { frames: this.Range(0, 23) }), frameRate: 24, repeat: -1 });
    }
    RandomBurrito(){
        let values = ["agua", "fuego", "electrico", "planta"];
        return values[Math.floor(Math.random() * values.length)];
    }
    CreateActionsMenu = async () => {
        new Helpers.Actions(this.game.config.width / 2 - 600, this.game.config.height - 400, this, this.currentBattle, { Action1: ()=>{ this.Action("Player", 1); }, Action2: ()=> { this.Action("Player", 2); }});
        this.sliderPlayer.SetValue(parseFloat(this.currentBattle.health_player) / parseFloat(this.currentBattle.start_health_player));
        this.sliderCPU.SetValue(parseFloat(this.currentBattle.health_cpu) / parseFloat(this.currentBattle.start_health_cpu));
    }
    IsMyTurn(player) {
        return this.currentBattle.turn == player;
    }
    Action = async(player, index) => {
        let result = await Near.BattlePlayerCPU(this.ActionIndex(index, player));
        console.log(result);
        let tempBattle = this.currentBattle;
        this.currentBattle = result;
        this.CompareBattles(tempBattle);
        this.CreateActionsMenu();
    }
    CompareBattles(tempBattle){
        let strongAttack_cpu = tempBattle.strong_attack_cpu != this.currentBattle.strong_attack_cpu;
        let strongAttack_player = tempBattle.strong_attack_player != this.currentBattle.strong_attack_player;

        let weakAttack_player = tempBattle.shields_player != this.currentBattle.shields_player;
    }
    ActionIndex(index, player){
        let result = (this.IsMyTurn(player) ? 0 : 2) + index;
        return result.toString();
    }
    GiveUp = async () => {
        Swal.fire({
            icon: 'info',
            title: '¿Esta seguro de dejar la pelea?',
            html: `El huir de la pelea <b>le costara una vida</b>`,
            showCancelButton: true,
            confirmButtonText: 'Huir',
          }).then(async (result) => {
            if (result.isConfirmed) {
                this.loadingScreen = new Helpers.LoadingScreen(this);
                await Near.SurrenderCpu(); 
                localStorage.removeItem("lastScene");
                localStorage.removeItem("burritoCPU");
                await this.loadingScreen.OnComplete();
                this.scene.start("MainMenu");
            }
        });
    }
    Range(start, end) {
        return Array(end - start + 1).fill().map((_, idx) => start + idx)
    }
}