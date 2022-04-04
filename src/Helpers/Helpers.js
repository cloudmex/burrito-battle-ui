class Button{
    constructor(x, y, scale, img, label, scene, downCallback, upCallback, fontStyle) {
        this.button = scene.add.sprite(x, y, img)
        .setScale(scale)
        .setInteractive()
        .on("pointerdown", ()=>{ this.PointerDown(downCallback);})
        .on("pointerup", () => { this.PointerUp(upCallback); })
        .on('pointerover', this.PointerOver)
        .on("pointerout", this.PointerOut);
        
        scene.add.text(x, y, label)
        .setOrigin(0.5)
        .setStyle(fontStyle)
        .setPadding({ left: 0, right: 0, top: 0, bottom: 32 });
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
class Card{
    constructor(x, y, burrito, scene){
        scene.add.image(x, y, `card_${burrito.burrito_type}`);
        scene.add.image(x, y, burrito.media).setScale(.33);

        scene.add.text(x - 280, y - 400, burrito.level, { fontSize: 90, fontFamily: "BangersRegular" });//level
        scene.add.text(x - 180, y - 380, burrito.name, { fontSize: 70, fontFamily: "BangersRegular" });//name

        scene.add.text(x + 280, y - 210, burrito.win, { fontSize: 60, fontFamily: "BangersRegular" });//wins
        scene.add.text(x + 280, y - 80, burrito.hp, { fontSize: 60, fontFamily: "BangersRegular" });//health

        scene.add.text(x  - 185, y + 315, burrito.attack, { fontSize: 90, fontFamily: "BangersRegular" });//attack
        scene.add.text(x , y + 270, burrito.defense, { fontSize: 90, fontFamily: "BangersRegular" });//defense
        scene.add.text(x  + 185, y + 315, burrito.speed, { fontSize: 90, fontFamily: "BangersRegular" });//speed

    }
}

export{ Button, Card };