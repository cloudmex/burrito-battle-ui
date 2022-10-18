export class Translate {
    constructor(){

    }
    static async LoadJson(){
        let language = localStorage.getItem("language");
        if(localStorage.getItem("language") == null)
            language = "en";

        this.json = await fetch(`../src//Language/${language}.json`).then(response => {
            return response.json();
        });
    }
    static Translate(key) {
        return this.json[key];
    }
}
