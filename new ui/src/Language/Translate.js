export class Translate {
    constructor(){

    }
    static async LoadJson(){
        let language = localStorage.getItem("language");
        if(localStorage.getItem("language") == null)
            language = "en";

        this.json = await fetch(`../src//Language/es.json`).then(response => {
            return response.json();
        });
    }
    static Translate(key) {
        return this.json[key];
    }
    Wea(){
        console.log("wea");
    }
}
