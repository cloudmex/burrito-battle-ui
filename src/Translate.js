export class Translate{
    static #json;
    #result = "";

    static async LoadJson(){
        this.#json = await fetch(`src/Languages/${localStorage.getItem("language")}.json`).then(response => {
            return response.json();
        });
    }
    static Translate(key) {
        return this.#json[key];
    }
}
