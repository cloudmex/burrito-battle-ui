import * as Near  from "../src/near.js";
import * as Helpers from "../src/Helpers/Helpers.js";

const COLOR_PRIMARY = 0xff0000;
const COLOR_DARK = 0x260e04;
class Battle extends Phaser.Scene{
    
    constructor(){
        super("Battle");
    }
    preload(){
        this.load.image("background_Battle", "../src/images/Establo/Background.webp")
        this.load.image("burrito", "../src/images/Burrito Agua.png");
        this.load.image("buttonContainer3", "../src/images/button.png");
        

        this.load.image("QmULzZNvTGrRxEMvFVYPf1qaBc4tQtz6c3MVGgRNx36gAq", "../src/images/Burritos/Burrito Relampago.png");
        this.load.image("QmZEK32JEbJH3rQtXL9BqQJa2omXfpjuXGjbFXLiV2Ge9D", "../src/images/Burritos/Burrito Planta.png");
        this.load.image("QmQcTRnmdFhWa1j47JZAxr5CT1Cdr5AfqdhnrGpSdr28t6", "../src/images/Burritos/Burrito Fuego.png");
        this.load.image("QmbMS3P3gn2yivKDFvHSxYjVZEZrBdxyZtnnnJ62tVuSVk", "../src/images/Burritos/Burrito Agua.png");

        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
            sceneKey: 'rexUI'
        });      

    }
    async create(){
        //var battle = { turn: "CPU", accesories_attack_b1: "0",  accesories_attack_b2: "0",  accesories_defense_b1: "0",  accesories_defense_b2: "0",  accesories_speed_b1: "0",  accesories_speed_b2: "0",  health_cpu: "38",  burrito_cpu_attack: "13",  burrito_cpu_defense: "10",  burrito_cpu_level: "5",  burrito_cpu_speed: "15",  burrito_cpu_type: "Volador",  shields_cpu: "3",  strong_attack_cpu: "3", health_player: "19",  payer_id: "jesus13th.testnet", shields_player: "3",  strong_attack_player: "3",  burrito_id: "3",  status: "1", }
        
        this.add.image(0,0, "background_Battle").setOrigin(0);
        
        var currentBattle;
        try{
            currentBattle = await Near.GetBattleActiveCpu();
        } catch{
            currentBattle = await Near.CreateBattlePlayerCpu();
        }
        //#region Burrito Player
        var burritoJson = await Near.NFTTokens(localStorage.getItem("burrito_selected"))
        var burritoPlayer = JSON.parse(burritoJson.metadata.extra.replace(/'/g, '"'));
        burritoPlayer["media"] = burritoJson.metadata.media;
        burritoPlayer["name"] = burritoJson.metadata.title;
        burritoPlayer["token_id"] = burritoJson.token_id;
        this.add.image(this.game.config.width/2 - 700, this.game.config.height - 300, burritoPlayer.media).setScale(0.5).setOrigin(0.5);

        this.rexUI.add.slider({
            x: 300,
            y: 100,
            width: 500,
            height: 50,
            orientation: 'x',

            track: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_DARK),
            indicator: this.rexUI.add.roundRectangle(0, 0, 0, 0, 20, COLOR_PRIMARY),
            thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 20, COLOR_PRIMARY),

            input: 'none', // 'drag'|'click'
            //easeValue: { duration: 250 },
            value: 0.3,
            valuechangeCallback: function (value) {
                //print2.text = value;
            },

        }).layout().setFlipX(true);
        //#endregion
        //#region Burrito CPU
        console.log(currentBattle);
        this.add.image(this.game.config.width/2 + 700, this.game.config.height - 300, "burrito").setScale(0.5).setOrigin(0.5).setFlipX(true);
        this.rexUI.add.slider({
            x: this.game.config.width / 2 + 650,
            y: 100,
            width: 500,
            height: 50,
            orientation: 'x',

            track: this.rexUI.add.roundRectangle(0, 0, 0, 0, 10, COLOR_DARK),
            indicator: this.rexUI.add.roundRectangle(0, 0, 0, 0, 20, COLOR_PRIMARY),
            thumb: this.rexUI.add.roundRectangle(0, 0, 0, 0, 20, COLOR_PRIMARY),

            input: 'none', // 'drag'|'click'
            //easeValue: { duration: 250 },
            value: 0.3,
            valuechangeCallback: function (value) {
                //print2.text = value;
            },

        }).layout().setFlipX(true);
        //#endregion
        new Helpers.Button(this.game.config.width/ 2 , 50, 0.5, "buttonContainer3", "Rendirse", this, ()=> { this.GiveUp(); }, null, {fontSize: 30, fontFamily: "BangersRegular"});
    }
    GiveUp = async () => {
        console.log("me rindo :(");
        await Near.SurrenderCpu(); 
        this.scene.start("MainMenu")
    }
    GetBattle = async () =>{
        localStorage.setItem("lastScene", "Battle");
        var battle = await Near.CreateBattlePlayerCpu();
        console.log(battle)
    }
}
export{ Battle };