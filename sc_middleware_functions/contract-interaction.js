require("dotenv").config();
const Web3 = require("web3");
const SmartInsurance = require("../blockchain/abis/SmartInsurance.json");

var adminBalance = undefined;
const adminWalletAddress = "0xfeB87197aBd18dDaBD28B58b205936dfB4569B17"; // Our wallet

// Connect to Ethereum node
const web3 = new Web3(
  new Web3.providers.HttpProvider(
    "https://rinkeby.infura.io/v3/3f9b178d47664bbcb9b3a3f542a39d6e"
  )
);

// console.log(Object.keys(web3_conn))
// console.log(Object.keys(web3_conn.eth))
// console.log(web3_conn)
web3.eth.getBalance(adminWalletAddress, async (err, result) => {
  if (err) {
    console.log(err);
    return;
  }
  adminBalance = web3.utils.fromWei(result, "ether");
});

const account = web3.eth.accounts.privateKeyToAccount(
  process.env.WALLET_PRIVATE_KEY
);

exports.deploy = async function (req, res) {
  console.log("Wallet Balance", adminBalance);
  //   console.log(req);
  // Creating contract object
  const smartInsurance = new web3.eth.Contract(SmartInsurance.abi);

  const smartInsuranceDeployment = smartInsurance
    .deploy({
      data: SmartInsurance.bytecode,
      arguments: [
        "0xfeB87197aBd18dDaBD28B58b205936dfB4569B17",
        "SQ306",
        "2020-11-30",
      ],
    })
    .encodeABI();

  const signedPromise = account.signTransaction({
    data: web3.utils.toHex(smartInsuranceDeployment),
    gas: web3.utils.toHex(1800000),
  });

  signedPromise
    .then((signedTx) => {
      // raw transaction string may be available in .raw or
      // .rawTransaction depending on which signTransaction
      // function was called
      const sentTx = web3.eth.sendSignedTransaction(
        signedTx.raw || signedTx.rawTransaction
      );
      sentTx.on("receipt", (receipt) => {
        console.log(receipt);
      });
      sentTx.on("error", (err) => {
        console.error(err);
      });
    })
    .catch((err) => {
        console.error(err);
    });

  res.json({ message: "success" });
};

exports.create_account = function (req, res) {
  res.json({ message: "creating account" });
};
