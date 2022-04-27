import * as nearAPI from "../lib/near-api-js.js"

const { connect, keyStores, WalletConnection, Contract, utils, providers } = nearApi;
const config = {
      networkId: 'testnet',
      keyStore: new keyStores.BrowserLocalStorageKeyStore(),
      nodeUrl: 'https://rpc.testnet.near.org',
      walletUrl: 'https://wallet.testnet.near.org',
      helperUrl: 'https://helper.testnet.near.org',
      explorerUrl: 'https://explorer.testnet.near.org'
    
}
const near = await connect(config);
const wallet = new WalletConnection(near, 'ncd-ii');
const contract_id_burritos = "dev-1648843231450-76383111338516";
const contract_id_strw_tokens = "dev-1648843322449-70578827831792";
const contract_id_items = "dev-1647986467816-61735125036881";

const provider = new providers.JsonRpcProvider(
  "https://archival-rpc.testnet.near.org"
);

const contract_burritos = new Contract(wallet.account(), contract_id_burritos, {
    viewMethods: [ 'get_burrito', "nft_tokens_for_owner", "nft_tokens", "account_id", "nft_supply_for_owner" ],
    changeMethods: [ "reset_burrito",  "evolve_burrito", 'nft_mint', "create_battle_player_cpu", "battle_player_cpu", "get_battle_active_cpu", "surrender_cpu" ],
    sender: wallet.account()
});
const contract_strw_tokens = new Contract(wallet.account(), contract_id_strw_tokens, {
    viewMethods: [ 'ft_balance_of' ],
    changeMethods: [  ],
    sender: wallet.account()
});
const contract_items = new Contract(wallet.account(), contract_id_items, {
    viewMethods: [  ],
    changeMethods: [  ],
    sender: wallet.account()
});

export function Login() {
    wallet.requestSignIn(
        contract_id_burritos,
        "Burrito Battle",
        window.location.origin,
    );
}
export function LogOut() {
    wallet.signOut();
}
export function IsConnected() {
    return wallet.isSignedIn();
}
export function GetAccountId(){
    return wallet.getAccountId()
}
export async function GetSTRWToken(){
    var currentSTRW = parseInt(utils.format.formatNearAmount(await contract_strw_tokens.ft_balance_of({ account_id: GetAccountId()})).replace(/\,/g,''));
    return currentSTRW
}
export async function NFTMint(){
    var currentSTRW = await GetSTRWToken();
    var requiredSTRW = 600_000;

    if(currentSTRW >= requiredSTRW){
        await contract_burritos.nft_mint(
            {
                token_owner_id: GetAccountId() ,
                token_metadata: { 
                    title: "Burrito 3", 
                    description: "This is a burrito", 
                    media: "https://s3-us-west-2.amazonaws.com/melingoimages/Images/28098.jpg", 
                    extra: ""
                }
            },
            300000000000000, 
            utils.format.parseNearAmount("5")
            );
    } else{
        Swal.fire({
            icon: 'info',
            title: 'Atención',
            text: 'No cuentas con suficientes STRW Tokens!'
          });
    }
}
export async function NFTTokens(burrito_id) {
    var result = await contract_burritos.nft_tokens();
    return result[burrito_id];
}
export async function NFTSupplyForOwner() {
    var result = await contract_burritos.nft_supply_for_owner({account_id: GetAccountId()})
    return result;
}
export async function NFTTokensForOwner(from, limit){
    var tokens = await contract_burritos.nft_tokens_for_owner (
        {
            account_id: GetAccountId(),
            from_index: from.toString(),
            limit: parseInt(limit)
        }
    )
    var result = [];
    tokens.forEach(token => {
        var json = JSON.parse(token.metadata.extra.replace(/'/g, '"'));
        json["media"] = token.metadata.media;
        json["name"] = token.metadata.title;
        json["token_id"] = token.token_id;
        result.push(json);
    });
    
    return result;
}
export async function GetNFTToken(index){
    var burritoJson = await NFTTokens(index)
    var burritoPlayer = JSON.parse(burritoJson.metadata.extra.replace(/'/g, '"'));
    burritoPlayer["media"] = burritoJson.metadata.media;
    burritoPlayer["name"] = burritoJson.metadata.title;
    burritoPlayer["token_id"] = burritoJson.token_id;
    return burritoPlayer;
}
export async function CreateBattlePlayerCpu () {
    var result = await contract_burritos.create_battle_player_cpu(
        {
            burrito_id: localStorage.getItem("burrito_selected"),
            accesorio1_id: "0", 
            accesorio2_id: "0",
            accesorio3_id: "0"
        },
        300000000000000
    )
    return result;
}
export async function GetBattleActiveCpu () {
    var result = await contract_burritos.get_battle_active_cpu({ });
    return result;
}
export async function SurrenderCpu () {
    var result = await contract_burritos.surrender_cpu({});
    return result;
}
export async function GetInfoByURL(){
    return new Promise(async resolve => {
    var URLactual = window.location.toString();
        if(URLactual.indexOf("?") == -1){
            resolve(null);
        } else {
            if(URLactual.indexOf("transactionHashes") !== -1){
                var start = URLactual.indexOf("=");
                var end = URLactual.indexOf("&");
                var transactionHashes = URLactual.substring(start + 1, end == -1 ? URLactual.length : end);
                
                const resultJson = await provider.txStatus(transactionHashes, GetAccountId());
                console.log(resultJson);
            }
            else if(URLactual.indexOf("rejected") !== -1) {
                Swal.fire({
                    icon: 'info',
                    title: 'Operación cancelada',
                })
                resolve(null);
            }
        }
    history.pushState('Home', 'Title', '/');
    });
}
export async function BattlePlayerCPU(typeMove){
    var result = await contract_burritos.battle_player_cpu({ type_move: typeMove}, 300000000000000, 0 );
    return result;
}
export async function GetState() {
    return new Promise(async resolve => {
        var URLactual = window.location.toString();
        var burrito = null;

        if(URLactual.indexOf("?") == -1){
            resolve(null);
        } else {
            if(URLactual.indexOf("transactionHashes") !== -1){
                var start = URLactual.indexOf("=");
                var end = URLactual.indexOf("&");
                var transactionHashes = URLactual.substring(start + 1, end == -1 ? URLactual.length : end);
                
                const resultJson = await provider.txStatus(transactionHashes, GetAccountId());
                console.log(resultJson);
                burrito = JSON.parse(resultJson.receipts_outcome[5].outcome.logs[2]);
                
                resolve(burrito);
            } else if(URLactual.indexOf("rejected") !== -1){
                Swal.fire({
                    icon: 'info',
                    title: 'Operación cancelada',
                  })
                resolve(null);
            }
        }
        history.pushState('Home', 'Title', '/');
    });
}
export async function EvolveBurrito(index){
    await contract_burritos.evolve_burrito(
        {
            burrito_id: index
        },
        300000000000000, 
        utils.format.parseNearAmount("2") 
    );
}
export async function ResetBurrito(index){
    await contract_burritos.reset_burrito(
        {
            burrito_id: index
        },
        300000000000000, 
        utils.format.parseNearAmount("1") 
    );
}