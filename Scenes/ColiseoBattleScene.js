import * as Near  from "../src/near.js";
import * as Helpers from "../src/Helpers/Helpers.js";

/*
pub struct BPvsMB {
    turn : String, 
    burrito_player_id : u64,
    name : String,
    burrito_type : String,
    start_health : String,
    health : String,    
    hp : String,
    attack : String,
    defense : String,
    speed : String,    
    level : String,
    media : String,
    strong_attack_player : String,
    shields_player : String,
    incursion_id : u64,
    strong_attack_cpu : String,
    shields_cpu : String,
    damage_player : f32
} 
*/

export class ColiseoBattle extends Phaser.Scene {
    constructor(){
        super("ColiseoBattle");
    }
    preload(){
        this.load.spritesheet("loading_screen_1", `../src/images/loading_screen_1.webp`, { frameWidth: 720, frameHeight: 512 });
        this.load.spritesheet("loading_screen_2", `../src/images/loading_screen_2.webp`, { frameWidth: 512, frameHeight: 512 });
        this.load.image("loading_bg", "../src/images/loading_bg.png");
        this.loadingScreen = new Helpers.LoadingScreen(this);

        this.load.image("background", "../src/images/Coliseo/Coliseo escenario.png");
        this.load.spritesheet("burritos", "../src/images/Battle/Burritos.png", { frameWidth: 200, frameHeight: 268});
        this.load.image("slider_background", "../src/images/Battle/slider_background.png");
        this.load.spritesheet("slider_fill", "../src/images/Battle/slider_fill.png", { frameWidth: 512, frameHeight: 89 });
        this.load.image("Coliseo_bg", "../src/images/Coliseo/Shader.png");
        this.load.image("Coliseo_gradas", "../src/images/Coliseo/Coliseo.png");
        this.load.image("Coliseo_ground", "../src/images/Coliseo/Base.png");
        this.load.spritesheet("sparks", "../src/images/coliseo/Sparks.webp", {frameWidth: 1920, frameHeight: 1080});

        //Test
        this.load.image("megaburrito", "../src/images/Burrito Agua.png");
    }
    async create(){
        //this.currentBattle = await Near.GetActiveBattleRoom();
        //console.log(this.currentBattle);
        //this.currentBattle = await Near.CreateBattleRoom();
        this.incursion = await Near.GetActiveIncursion();
        this.currentBattle = JSON.parse('{"accesories_attack_b1":"0", "accesories_attack_b2":"0", "accesories_defense_b1":"0", "accesories_defense_b2":"0", "accesories_speed_b1":"0", "accesories_speed_b2":"0", "attack_b1":"8", "burrito_cpu_attack":"8","burrito_cpu_defense":"7","burrito_cpu_level":"1","burrito_cpu_speed":"6","burrito_cpu_type":"Planta","burrito_id":"2","defense_b1":"7","health_cpu":"11","health_player":"20","level_b1":"1","player_id":"jesus13th.testnet","shields_cpu":"3","shields_player":"3","speed_b1":"5","start_health_cpu":"11","start_health_player":"20","status":"2","strong_attack_cpu":"3","strong_attack_player":"3","turn":"CPU"}');

        this.add.image(0, 0, "Coliseo_gradas").setOrigin(0);
        this.add.image(0, 0, "Coliseo_ground").setOrigin(0);
        this.anims.create({ key: "sparksAnim", frameRate: 24, frames: this.anims.generateFrameNumbers("sparks", { start: 0, end: 14 }), repeat: -1 });
        this.add.image(0, 0, "Coliseo_bg").setOrigin(0);
        this.add.sprite(0, 0, "sparks", 0).play("sparksAnim").setOrigin(0);

        this.loadSpriteSheet("electrico");
        this.input.on(Phaser.Input.Events.POINTER_DOWN, () => {
			this.cameras.main.shake(500, 0.01)
		})
    }
    async LoadBurrito(){
        this.CreateAnimations("Player");
        this.burritoPlayer = this.add.sprite(this.game.config.width /2 - 700, this.game.config.height - 300, "burrito_idle_player").setOrigin(0.5);
        this.burritoPlayer.play("idle_Player");
        
        let healthPlayer = parseFloat(this.currentBattle.health_player) / parseFloat(this.currentBattle.start_health_player);
        this.sliderPlayer = new Helpers.Slider(this.game.config.width / 2 - 550, 150, this, 1, this.currentBattle)
        .SetValue(healthPlayer);

        //Mega burrito
        this.add.sprite(this.game.config.width - 200, this.game.config.height / 2, "megaburrito").setFlipX(true).setScale(1.25);
        new Helpers.BossSlider(this.game.config.width - 200, this.game.config.height / 2 + 200, this, this.currentBattle);
        
        await this.loadingScreen.OnComplete();
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
    loadSpriteSheet(folderPlayer){
        this.load.spritesheet(`burrito_idle_Player`, `../src/images/Battle/${folderPlayer}/Espera.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_ataque1_Player`, `../src/images/Battle/${folderPlayer}/Ataque_ligero.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_ataque2_Player`, `../src/images/Battle/${folderPlayer}/Ataque_pesado.webp`, {frameWidth: 700, frameHeight: 512});
        this.load.spritesheet(`burrito_defensa_Player`, `../src/images/Battle/${folderPlayer}/Defensa.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_dano_Player`, `../src/images/Battle/${folderPlayer}/Dano.webp`, {frameWidth: 512, frameHeight: 512});
        this.load.spritesheet(`burrito_derrota_Player`, `../src/images/Battle/${folderPlayer}/Derrota.webp`, {frameWidth: 700, frameHeight: 512});
        this.load.spritesheet(`burrito_victoria_Player`, `../src/images/Battle/${folderPlayer}/Victoria.webp`, {frameWidth: 512, frameHeight: 512});

        this.load.spritesheet("derrota", "../src/images/Battle/Derrota.webp", { frameWidth: 1920, frameHeight: 1080 });
        this.load.spritesheet("victoria", "../src/images/Battle/Victoria.webp", { frameWidth: 1920, frameHeight: 1080 });
        this.load.spritesheet("background_animation", "../src/images/Battle/Background.webp", { frameWidth: 1920, frameHeight: 1080 });

        this.load.once("complete", this.LoadBurrito, this);
        this.load.start();
    }
    Range(start, end) {
        return Array(end - start + 1).fill().map((_, idx) => start + idx);
    }
}
