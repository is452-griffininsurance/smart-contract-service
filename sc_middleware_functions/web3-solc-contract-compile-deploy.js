const path = require("path");
const fs = require("fs");
const solc = require("solc");
const Web3 = require("web3");
var adminBalance = undefined;
const adminWalletAddress = "0x515fB466aFDec3cD3982dce918E5c289dB0f0255"

// Connect to Ethereum node
const web3_conn = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/v3/3f9b178d47664bbcb9b3a3f542a39d6e"));
// console.log(Object.keys(web3_conn))
// console.log(Object.keys(web3_conn.eth))
// console.log(web3_conn)
web3_conn.eth.getBalance(adminWalletAddress, async (err, result) => {
    if (err) {
        console.log(err);
        return;
    }
    adminBalance = web3_conn.utils.fromWei(result, "ether");
})



// Compile the source code 
const safeMathPath = path.resolve(__dirname, 'contracts', 'SafeMath.sol');
const safeMathContractFile = fs.readFileSync(safeMathPath, 'UTF-8');
const smartInsurancePath = path.resolve(__dirname, 'contracts', 'SmartInsurance.sol');
const smartInsuranceContractFile = fs.readFileSync(smartInsurancePath, 'UTF-8');

const contracts = {
    language: "Solidity",
    sources: {
        'SafeMath.sol': {
            content: safeMathContractFile
        },
        'SmartInsurance.sol': {
            content: smartInsuranceContractFile
        }
    },
    settings: {
        outputSelection: {
            "*": {
                "*": [ '*' ]
            }
        }
    }
}

const output = JSON.parse(solc.compile(JSON.stringify(contracts)))
const bytecode = output.contracts['SmartInsurance.sol']["SmartInsurance"].evm.bytecode.object;
const abi = output.contracts['SmartInsurance.sol']["SmartInsurance"].abi;

// Creating contract object
const smartInsurance = new web3_conn.eth.Contract(abi);

// Function parameter
let payload = {
    data: bytecode
}

let parameter = {
    from: adminWalletAddress,
    gas: web3_conn.utils.toHex(80000),
    gasPrice: web3_conn.utils.toHex(web3_conn.utils.toWei("30", "gwei"))
}

smartInsurance.deploy(payload).send(parameter, (err, transactionHash) => {
    console.log('Transaction Hash :', transactionHash);
}).on('confirmation', () => {}).then((newContractInstance) => {
    console.log('Deployed Contract Address: ', newContractInstance.options.address);
})

exports.test_sc = function(req, res) {
    console.log(adminBalance);
    res.json({"message": "success"})
}

exports.create_account = function(req, res) {
    res.json({"message":"creating account"})
}