export class Config{
    static #json;
    static Data;
    
    static async LoadJson(){
        this.#json = this.Data = await fetch(`/config.json`).then(response => {
            return response.json();
        });
        const domain = window.location.origin;
        this.network = domain.includes("testnet") || domain.includes("localhost") ? "Testnet" : "Mainnet";    
    }
    static Config = ()=> {
        return this.json;
    }
    static Get(key) {
        return this.#json[this.network][key];
    }
}