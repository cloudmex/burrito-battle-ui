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
        this.cardResult = scene.add.container(x, y)
        this.cardResult.add(scene.add.image(0, 0, `card_${burrito.burrito_type}`));
        this.cardResult.add(scene.add.image(0, 0, burrito.media).setScale(.33));

        this.cardResult.add(scene.add.text(-280, - 400, burrito.level, { fontSize: 90, fontFamily: "BangersRegular" }));//level
        this.cardResult.add(scene.add.text(-180, - 380, burrito.name, { fontSize: 70, fontFamily: "BangersRegular" }));//name

        this.cardResult.add(scene.add.text(280, - 210, burrito.win, { fontSize: 60, fontFamily: "BangersRegular" }));//wins
        this.cardResult.add(scene.add.text(280, - 80, burrito.hp, { fontSize: 60, fontFamily: "BangersRegular" }));//health

        this.cardResult.add(scene.add.text(-185, 315, burrito.attack, { fontSize: 90, fontFamily: "BangersRegular" }));//attack
        this.cardResult.add(scene.add.text(0, 270, burrito.defense, { fontSize: 90, fontFamily: "BangersRegular" }));//defense
        this.cardResult.add(scene.add.text(185, 315, burrito.speed, { fontSize: 90, fontFamily: "BangersRegular" }));//speed

    }
    GetComponents(){
        return this.cardResult
    }
}

export{ Button, Card };