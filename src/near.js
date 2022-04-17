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
    viewMethods: [ 'get_burrito', "nft_tokens_for_owner", "nft_tokens" ],
    changeMethods: [ 'nft_mint', "create_battle_player_cpu", "get_battle_active_cpu", "surrender_cpu" ],
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

function Login() {
    wallet.requestSignIn(
        contract_id_burritos,
        "Burrito Battle",
        window.location.origin,
    );
}
function LogOut() {
    wallet.signOut();
}
function IsConnected() {
    return wallet.isSignedIn();
}
function GetAccountId(){
    return wallet.getAccountId()
}
function GetAccount(){
    return wallet.account();
}
async function GetBurrito(){
    var result = await contract_burritos.get_burrito({burrito_id: "0"});
    alert(JSON.stringify(result));
}
async function GetSTRWToken(){
    var currentSTRW = parseInt(utils.format.formatNearAmount(await contract_strw_tokens.ft_balance_of({ account_id: GetAccountId()})).replace(/\,/g,''));
    console.log(currentSTRW)
}
async function NFTMint(){
    var currentSTRW = parseInt(utils.format.formatNearAmount(await contract_strw_tokens.ft_balance_of({ account_id: GetAccountId()})).replace(/\,/g,''));
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
async function NFTTokens() {
    var result = await contract_burritos.nft_tokens({from_index: 0, limit: 50});
}
async function NFTTokensForOwner(from, limit){
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
        result.push(json);
    });
    
    return result;
} 
async function CreateBattlePlayerCpu () {
    console.log("metodo");
    await contract_burritos.create_battle_player_cpu(
        {
            burrito_id:"3",
            accesorio1_id:"0", 
            accesorio2_id:"0",
            accesorio3_id: "0"
        },
        300000000000000
    )
}
async function GetBattleActiveCpu () {
    var result = await contract_burritos.get_battle_active_cpu({ });
    console.log(result);
}
async function SurrenderCpu(){
    var result = await contract_burritos.surrender_cpu({});
    console.log(result)
}
async function Test() {
    var result = await provider.txStatus("5y5r5G6CUXuMs5SfeXzSYGM1t6YExFmXqtc2QghsGCSu", GetAccountId());
    console.log(result);
}
async function GetState() {
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
export { Test, Login, LogOut, IsConnected, GetAccountId, NFTMint, NFTTokensForOwner, NFTTokens, GetBurrito, GetState, CreateBattlePlayerCpu, GetBattleActiveCpu, SurrenderCpu, GetSTRWToken };