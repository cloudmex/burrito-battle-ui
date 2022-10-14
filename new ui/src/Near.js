import * as nearAPI from "../src/near-api-js.js"

import { Config } from './Config.js';

const { connect, keyStores, WalletConnection, Contract, utils, providers, KeyPair, transactions } = nearApi;

let provider;

let contract_id_burritos; 
let contract_id_strw_tokens;
let contract_id_items;
let contract_id_PVEBattle ;
let contract_id_incursion;
let contract_id_hospital;

let near;
let wallet;

let contract_burritos;
let contract_strw_tokens;
let contract_items;
let contract_PVEBattle;
let contract_incursion;
let contract_hospital;

export async function Initialize(){
    await Config.LoadJson();
    contract_id_burritos = Config.Get("CONTRACT_BURRITOS"); 
    contract_id_strw_tokens = Config.Get("CONTRACT_STRW_TOKENS");
    contract_id_items = Config.Get("CONTRACT_ITEMS");
    contract_id_PVEBattle = Config.Get("CONTRACT_PVEBATTLE") ;
    contract_id_incursion = Config.Get("CONTRACT_INCURSION");
    contract_id_hospital = Config.Get("CONTRACT_HOSPITAL");
    
    let config = {
        networkId: 'testnet',
        keyStore: typeof window === "undefined"
        ? new keyStores.InMemoryKeyStore()
        : new keyStores.BrowserLocalStorageKeyStore(),
        nodeUrl:Config.Get("NODE_URL"),
        walletUrl:Config.Get("WALLET_URL"),
        helperUrl:Config.Get("HELPER_URL"),
        explorerUrl:Config.Get("EXPLORER_URL")
    }

    near = await connect(config);
    provider = new providers.JsonRpcProvider(Config.Get("ARCHIVAL_RPC"));
    wallet = new WalletConnection(near, 'ncd-ii');
    contract_burritos = new Contract(wallet.account(), contract_id_burritos, {
        viewMethods: [ 'get_burrito', "nft_tokens_for_owner", "nft_tokens", "account_id", "nft_supply_for_owner", "nft_token" ],
        changeMethods: [ "reset_burrito",  "evolve_burrito", 'nft_mint', "burrito_increment_win", "burrito_ready_reset", "burrito_ready_evolve", "nft_transfer_call", "decrease_all_burrito_hp" ],
        sender: wallet.account()
    });
    contract_strw_tokens = new Contract(wallet.account(), contract_id_strw_tokens, {
        viewMethods: [ 'ft_balance_of', "can_buy_tokens" ],
        changeMethods: [ "buy_tokens" ],
        sender: wallet.account()
    });
    contract_items = new Contract(wallet.account(), contract_id_items, {
        viewMethods: [  ],
        changeMethods: [  ],
        sender: wallet.account()
    });
    contract_PVEBattle = new Contract(wallet.account(), contract_id_PVEBattle, {
        viewMethods: [ "is_in_battle",  ],
        changeMethods: [ "create_battle_player_cpu", "battle_player_cpu", "get_battle_active", "surrender_cpu" ],
        sender: wallet.account()
    });
    contract_incursion = new Contract(wallet.account(), contract_id_incursion, {
        viewMethods: ["get_active_incursion", "is_in_battle_incursion", "can_withdraw_burrito", "burritos_incursion_info"],
        changeMethods: ["create_incursion", "delete_all_incursions", "start_active_incursion", "finish_active_incursion", "withdraw_burrito_owner", "create_battle_room", "get_active_battle_room", "get_player_incursion", "battle_player_incursion"],
        sender: wallet.account()
    });
    contract_hospital = new Contract(wallet.account(), contract_id_hospital, {
        viewMethods:[ "get_player_capsules","get_strw_cost" ],
        changeMethods: [ "withdraw_burrito_owner" ],
        sender: wallet.account()
    })
}
export function Login() {
    wallet.requestSignIn(
        contract_id_burritos,
        "Burrito Battle",
        window.location.origin,
    );
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

export function LogOut() {
    wallet.signOut();
}
export function IsConnected() {
    return wallet.isSignedIn();
}
export function GetAccountId(){
    return wallet.getAccountId()
}
export async function GetAccountBalance(){
    const cuenta = await near.account(GetAccountId());
    const balance = await cuenta.getAccountBalance();
    return balance;
}
export async function GetCurrentNears(){
    return Math.trunc((((await (await near.account(GetAccountId())).getAccountBalance()).available / 1000000000000000000000000) - 0.05)* Math.pow(10, 2)) / Math.pow(10, 2);
}
export async function GetSTRWToken(){
    let currentSTRW = parseInt(utils.format.formatNearAmount(await contract_strw_tokens.ft_balance_of({ account_id: GetAccountId()})).replace(/\,/g,''));
    return currentSTRW
}
export async function GetNFTToken(index){
    let burritoJson = await NFTTokens(index);
    let burritoPlayer = JSON.parse(burritoJson.metadata.extra.replace(/'/g, '"'));
    burritoPlayer["media"] = burritoJson.metadata.media;
    burritoPlayer["name"] = burritoJson.metadata.title;
    burritoPlayer["token_id"] = burritoJson.token_id;
    return burritoPlayer;
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
            console.error('Operación cancelada');
        }
    }
    
    history.pushState('Home', 'Title', '/');
    return result;
}
export async function IsInBattle(){
    let result = await contract_PVEBattle.is_in_battle({account_id:GetAccountId()});
    return result;
}
export async function SurrenderCpu () {
    let result = await contract_PVEBattle.surrender_cpu({}, 300000000000000);
    return result;
}
export async function EvolveBurrito(index){
    let result;
    let currentSTRW = await GetSTRWToken();
    let requiredSTRW = 70000;

    if(currentSTRW >= requiredSTRW){
        result = await contract_burritos.evolve_burrito(
            {
                burrito_id: index
            },
            300000000000000, 
            utils.format.parseNearAmount("2")
        );
    }else{
        console.error('¡No cuentas con suficientes STRW Tokens!');
    }
    return result;
}
export async function NFTSupplyForOwner() {
    let result = await contract_burritos.nft_supply_for_owner({account_id: GetAccountId()})
    return result;
}
export async function NFTTokens(burrito_id) {
    let result = await contract_burritos.nft_token({token_id: burrito_id});
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
export async function ResetBurrito(index){
    let currentSTRW = await GetSTRWToken();
    let requiredSTRW = 30000;
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
            console.error('¡No cuentas con suficientes STRW Tokens!');
        }
    return result;
}
export async function BuyTokens(){
    let result = await contract_strw_tokens.buy_tokens(
        {},
        300000000000000, 
        utils.format.parseNearAmount("1")
    );
    return result;
}
export async function CanBuyTokens(){
    let result = await contract_strw_tokens.can_buy_tokens({account_id: GetAccountId()});
    return result == 0 ? result : parseInt(result.substring(0, result.length - 6));
}
export async function NFTMint(){
    let result;
    let currentSTRW = await GetSTRWToken();
    let requiredSTRW = 50000;

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
        console.error('¡No cuentas con suficientes STRW Tokens!');
    }
    return result;
}
export async function BurritosIncursionInfo(incursion_id){
    let result = await contract_incursion.burritos_incursion_info({ incursion_id: incursion_id });
    return result;
}
export async function CanWithdrawBurrito(){
    let result = await contract_incursion.can_withdraw_burrito({account_id: GetAccountId()});
    return result;
}
export async function CreateIncursion(){
    let result = await contract_incursion.create_incursion({}, 300000000000000);
    return result;
}
export async function GetActiveBattleRoom(){
    let result = await contract_incursion.get_active_battle_room({});
    return result;
}
export async function GetActiveIncursion(){
    let result = await contract_incursion.get_active_incursion({});
    return result;
}
export async function GetPlayerIncursion(){
    let result = await contract_incursion.get_player_incursion({}, 300000000000000);
    return result;
}
export async function RegisterInIncursion(token_id, incursion_id = 1){
    let result = await contract_burritos.nft_transfer_call(
        { receiver_id: contract_id_incursion, token_id: token_id, msg:`{\"incursion_id\":${incursion_id}}` }, 
        300000000000000,
        "1" 
    );
    return result;
}
export async function WithdrawBurritoOwner(token_id){
    let result = await contract_incursion.withdraw_burrito_owner({}, 300000000000000, "1");
    return result;
}
export async function BattlePlayerCPU(typeMove){
    let result = await contract_PVEBattle.battle_player_cpu({ type_move: typeMove}, 300000000000000, 0 );
    return result;
}export async function CreateBattlePlayerCpu () {
    
    let result = await contract_PVEBattle.create_battle_player_cpu(
        {
            burrito_id: localStorage.getItem("burrito_selected")
        },
        300000000000000
    )
    return result;
}
export async function GetBattleActiveCpu () {
    let result = await contract_PVEBattle.get_battle_active({ }, 300000000000000);
    return result;
}
export async function RegisterInHospital(token_id, capsule_number){
    let result = await contract_burritos.nft_transfer_call(
        {receiver_id: contract_id_hospital, token_id: token_id, msg:`{\"capsule_number\":${capsule_number}}`}, 
        300000000000000,
        "1" 
    );
    return result;
}
export async function WithdrawBurritoOwnerHospital(capsule_number) {
    let result = await contract_hospital.withdraw_burrito_owner({ capsule_number: capsule_number }, 300000000000000, "1");
    return result;
}
export async function GetPlayerCapsules(){
    let result = await contract_hospital.get_player_capsules({player: GetAccountId()});
    return result;
}
export async function GetStrwCost(){
    let result = await contract_hospital.get_strw_cost({});
    return result;
}
export async function DecreaseAllBurritoHp(burrito_id){
    let result = await contract_burritos.decrease_all_burrito_hp({burrito_id: burrito_id});
    return result;
} 
export async function BattlePlayerIncursion(type_move){
    let result = await contract_incursion.battle_player_incursion({ type_move: type_move }, 300000000000000);
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
export async function DeleteAllIncursions(){
    let result = await contract_incursion.delete_all_incursions({}, 300000000000000);
    return result;
}