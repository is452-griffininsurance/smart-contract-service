require('dotenv').config()
const Web3 = require("web3");
const SmartInsurance = require("../blockchain/abis/SmartInsurance.json")

var adminBalance = undefined;
const adminWalletAddress = "0xfeB87197aBd18dDaBD28B58b205936dfB4569B17" // Our wallet

// Connect to Ethereum node
const web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/3f9b178d47664bbcb9b3a3f542a39d6e"));
// console.log(Object.keys(web3_conn))
// console.log(Object.keys(web3_conn.eth))
// console.log(web3_conn)
web3.eth.getBalance(adminWalletAddress, async (err, result) => {
    if (err) {
        console.log(err);
        return;
    }
    adminBalance = web3.utils.fromWei(result, "ether");
})


const account = web3.eth.accounts.privateKeyToAccount(process.env.WALLET_PRIVATE_KEY);

// Creating contract object
const smartInsurance = new web3.eth.Contract(SmartInsurance.abi);

// Function parameter
let payload = {
    data: SmartInsurance.bytecode,
    arguments: ["0xfeB87197aBd18dDaBD28B58b205936dfB4569B17", "SQ306", "2020-11-30"]
}

let parameter = {
    from: web3.eth.accounts[0],
    gas: web3.utils.toHex(80000),
    gasPrice: web3.utils.toHex(web3.utils.toWei("30", "gwei"))
}

smartInsurance.deploy(payload).send(parameter, (err, transactionHash) => {
    console.log('Transaction Hash :', transactionHash);
}).on('confirmation', () => {}).then((newContractInstance) => {
    console.log('Deployed Contract Address: ', newContractInstance.options.address);
})

// exports.test_sc = function(req, res) {
//     console.log(adminBalance);
//     res.json({"message": "success"})
// }

// exports.create_account = function(req, res) {
//     res.json({"message":"creating account"})
// }