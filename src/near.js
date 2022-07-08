import * as nearAPI from "../lib/near-api-js.js"

const { connect, keyStores, WalletConnection, Contract, utils, providers, KeyPair, transactions } = nearApi;

const config = {
      networkId: 'testnet',
      keyStore: typeof window === "undefined"
      ? new keyStores.InMemoryKeyStore()
      : new keyStores.BrowserLocalStorageKeyStore(),
      nodeUrl: 'https://rpc.testnet.near.org',
      walletUrl: 'https://wallet.testnet.near.org',
      helperUrl: 'https://helper.testnet.near.org',
      explorerUrl: 'https://explorer.testnet.near.org'
    
}
const near = await connect(config);
const wallet = new WalletConnection(near, 'ncd-ii');

const contract_id_burritos = "dev-1652924595303-59024384289373";
const contract_id_strw_tokens = "dev-1653415145729-47929415561597";
const contract_id_items = "dev-1647986467816-61735125036881";
const contract_id_PVEBattle = "dev-1652376335913-86387308955071";
const contract_id_incursion = "dev-1656606254252-10651438211400";

const provider = new providers.JsonRpcProvider(
  "https://archival-rpc.testnet.near.org"
);

const contract_burritos = new Contract(wallet.account(), contract_id_burritos, {
    viewMethods: [ 'get_burrito', "nft_tokens_for_owner", "nft_tokens", "account_id", "nft_supply_for_owner", "nft_token" ],
    changeMethods: [ "reset_burrito",  "evolve_burrito", 'nft_mint', "burrito_increment_win", "burrito_ready_reset", "burrito_ready_evolve", "nft_transfer_call" ],
    sender: wallet.account()
});
const contract_strw_tokens = new Contract(wallet.account(), contract_id_strw_tokens, {
    viewMethods: [ 'ft_balance_of', "can_buy_tokens" ],
    changeMethods: [ "buy_tokens" ],
    sender: wallet.account()
});
const contract_items = new Contract(wallet.account(), contract_id_items, {
    viewMethods: [  ],
    changeMethods: [  ],
    sender: wallet.account()
});
const contract_PVEBattle = new Contract(wallet.account(), contract_id_PVEBattle, {
    viewMethods: [ "is_in_battle",  ],
    changeMethods: [ "create_battle_player_cpu", "battle_player_cpu", "get_battle_active", "surrender_cpu" ],
    sender: wallet.account()
});
const contract_incursion = new Contract(wallet.account(), contract_id_incursion, {
    viewMethods: ["get_active_incursion", "is_in_battle_incursion"],
    changeMethods: ["create_incursion", "delete_all_incursions", "start_active_incursion", "finish_active_incursion", "withdraw_burrito_owner", "create_battle_room", "get_active_battle_room", "get_player_incursion"],
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
export async function LoginFullAccess(){
    const currentUrl = new URL(window.location.href);
    const newUrl = new URL(wallet._walletBaseUrl + "/login/");
	newUrl.searchParams.set('success_url', window.location.origin || currentUrl.href);
    newUrl.searchParams.set('failure_url', window.location.origin || currentUrl.href);

  const accessKey = KeyPair.fromRandom("ed25519");
  newUrl.searchParams.set("public_key", accessKey.getPublicKey().toString());
  await wallet._keyStore.setKey(
    wallet._networkId,
    "pending_key" + accessKey.getPublicKey(),
    accessKey
  );

  transactions.functionCallAccessKey(contract_id_burritos, ["nft_mint"]);
  window.location.assign(newUrl.toString());
}

export async function GetAccountBalance(){
    const cuenta = await near.account(GetAccountId());
    const balance = await cuenta.getAccountBalance();
    return balance;
}
export async function GetSTRWToken(){
    let currentSTRW = parseInt(utils.format.formatNearAmount(await contract_strw_tokens.ft_balance_of({ account_id: GetAccountId()})).replace(/\,/g,''));
    return currentSTRW
}
export async function NFTMint(){
    let result;
    let currentSTRW = await GetSTRWToken();
    let requiredSTRW = 50_000;

    if(currentSTRW >= requiredSTRW){
        result = await contract_burritos.nft_mint(
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
            text: '¡No cuentas con suficientes STRW Tokens!'
          });
    }
    return result;
}
export async function NFTTokens(burrito_id) {
    let result = await contract_burritos.nft_token({token_id: burrito_id});
    return result;
}
export async function NFTSupplyForOwner() {
    let result = await contract_burritos.nft_supply_for_owner({account_id: GetAccountId()})
    return result;
}
export async function IsInBattle(){
    let result = await contract_PVEBattle.is_in_battle({account_id:GetAccountId()});
    return result;
}
export async function NFTTokensForOwner(from, limit){
    let tokens = await contract_burritos.nft_tokens_for_owner ({
            account_id: GetAccountId(),
            from_index: from.toString(),
            limit: parseInt(limit)
        }
    )
    let result = [];
    tokens.forEach(token => {
        let json = JSON.parse(token.metadata.extra.replace(/'/g, '"'));
        json["media"] = token.metadata.media;
        json["name"] = token.metadata.title;
        json["token_id"] = token.token_id;
        result.push(json);
    });
    
    return result;
}
export async function GetNFTToken(index){
    let burritoJson = await NFTTokens(index);
    let burritoPlayer = JSON.parse(burritoJson.metadata.extra.replace(/'/g, '"'));
    burritoPlayer["media"] = burritoJson.metadata.media;
    burritoPlayer["name"] = burritoJson.metadata.title;
    burritoPlayer["token_id"] = burritoJson.token_id;
    return burritoPlayer;
}
export async function CreateBattlePlayerCpu () {
    let result = await contract_PVEBattle.create_battle_player_cpu(
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
    let result = await contract_PVEBattle.get_battle_active({ }, 300000000000000);
    return result;
}
export async function SurrenderCpu () {
    let result = await contract_PVEBattle.surrender_cpu({}, 300000000000000);
    return result;
}
export async function GetInfoByURL(){
    let result = null;
    let URLactual = window.location.toString();
    if(URLactual.indexOf("?") != -1){
        if(URLactual.indexOf("transactionHashes") !== -1){
            let end = URLactual.indexOf("&");
            let transactionHashes = URLactual.substring(URLactual.indexOf("=") + 1, end == -1 ? URLactual.length : end);
            const resultJson = await provider.txStatus(transactionHashes, GetAccountId());
            
            result = resultJson;
        }
        else if(URLactual.indexOf("rejected") !== -1) {
            Swal.fire({
                icon: 'info',
                title: 'Operación cancelada',
            })
        }
    }
    
    history.pushState('Home', 'Title', '/');
    return result;
}
export async function BattlePlayerCPU(typeMove){
    let result = await contract_PVEBattle.battle_player_cpu({ type_move: typeMove}, 300000000000000, 0 );
    return result;
}
export async function GetState() {
    return new Promise(async resolve => {
        let URLactual = window.location.toString();
        let burrito = null;

        if(URLactual.indexOf("?") == -1){
            resolve(null);
        } else {
            if(URLactual.indexOf("transactionHashes") !== -1){
                let start = URLactual.indexOf("=");
                let end = URLactual.indexOf("&");
                let transactionHashes = URLactual.substring(start + 1, end == -1 ? URLactual.length : end);
                
                const resultJson = await provider.txStatus(transactionHashes, GetAccountId());
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
    let result;
    let currentSTRW = await GetSTRWToken();
    let requiredSTRW = 70_000;

    if(currentSTRW >= requiredSTRW){
        result = await contract_burritos.evolve_burrito(
            {
                burrito_id: index
            },
            300000000000000, 
            utils.format.parseNearAmount("2")
        );
    }else{
        Swal.fire({
            icon: 'info',
            title: 'Atención',
            text: '¡No cuentas con suficientes STRW Tokens!'
        });
    }
    return result;
}
export async function ResetBurrito(index){
    let currentSTRW = await GetSTRWToken();
    let requiredSTRW = 30_000;
    let result;
    if(currentSTRW >= requiredSTRW){
        result = await contract_burritos.reset_burrito(
            {
                burrito_id: index
            },
            300000000000000, 
            utils.format.parseNearAmount("1") 
        );
        } else{
            Swal.fire({
                icon: 'info',
                title: 'Atención',
                text: '¡No cuentas con suficientes STRW Tokens!'
            });  
        }
    return result;
}
export async function BurritoReadyReset(token_id){
    await contract_burritos.burrito_ready_reset({burrito_id: token_id}, 300000000000000 )
}
export async function BurritoReadyEvolve(token_id) {
    await contract_burritos.burrito_ready_evolve({ burrito_id: token_id }, 300000000000000)
}
export async function BurritoIncrementWin(token_id){
    await contract_burritos.burrito_increment_win({burrito_id: token_id}, 300000000000000);
}
export async function CanBuyTokens(){
    let result = await contract_strw_tokens.can_buy_tokens({account_id: GetAccountId()});
    return result == 0 ? result : parseInt(result.substring(0, result.length - 6));
}
export async function BuyTokens(){
    let result = await contract_strw_tokens.buy_tokens(
        {},
        300000000000000, 
        utils.format.parseNearAmount("1")
    );
    return result;
}
export async function CreateIncursion(){
    let result = await contract_incursion.create_incursion({}, 300000000000000);
    return result;
}
export async function GetActiveIncursion(){
    let result = await contract_incursion.get_active_incursion({});
    return result;
}
export async function DeleteAllIncursions(){
    let result = await contract_incursion.delete_all_incursions({}, 300000000000000);
    return result;
}
export async function StartActiveIncursion(){
    let result = await contract_incursion.start_active_incursion({}, 300000000000000);
}
export async function FinishActiveIncursion(){
    let result = await contract_incursion.finish_active_incursion({}, 300000000000000);
}
export async function NewIncursionTime(){
    let result = (await GetActiveIncursion()).finish_time;
    return result == 0 ? result : parseInt(result.substring(0, result.length - 6));
}
export async function GetPlayerIncursion(){
    let result = await contract_incursion.get_player_incursion({}, 300000000000000);
    return result;
}
export async function RegisterInIncursion(token_id, incursion_id = 1){
    let result = await contract_burritos.nft_transfer_call(
        {receiver_id: contract_id_incursion, token_id: token_id, msg:`{\"incursion_id\":${incursion_id}}`}, 
        300000000000000,
        "1" 
    );
    return result;
}
export async function WithdrawBurritoOwner(token_id){
    let result = await contract_incursion.withdraw_burrito_owner({}, 300000000000000, "1");
    return result;
}
export async function CreateBattleRoom(){
    let result = await contract_incursion.create_battle_room({}, 300000000000000);
    return result;
}
export async function IsInBattleIncursion(){
    let result = await contract_incursion.is_in_battle_incursion ({account_id: GetAccountId()});
    return result;
}
export async function GetActiveBattleRoom(){
    let result = await contract_incursion.get_active_battle_room({});
    return result;
}
export async function BattlePlayerIncursion(type_move){
    let result = await contract_incursion.battle_player_incursion({ type_move: type_move }, 300000000000000);
    return result;
} 