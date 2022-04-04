import * as nearAPI from "../node_modules/near-api-js/dist/near-api-js";

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
    viewMethods: [ 'get_burrito' ],
    changeMethods: [ 'mint_token', "create_battle_player_cpu", "get_battle_active_cpu" ],
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
        "http://localhost:8000/",
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
async function MintToken(){
    var currentSTRW = parseInt(utils.format.formatNearAmount(await contract_strw_tokens.ft_balance_of({ account_id: "jesus13th.testnet"})).replace(/\,/g,''));
    var requiredSTRW = 600_000;

    if(currentSTRW >= requiredSTRW){
        await contract_burritos.mint_token(
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
        alert("no tienes suficientes $STRW");
    }
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
                resolve(null);
            }
        }
        history.pushState('Home', 'Title', '/');
    });
}
export { Login, LogOut, IsConnected, GetAccountId, MintToken, GetBurrito, GetState, CreateBattlePlayerCpu, GetBattleActiveCpu };