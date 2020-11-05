require("dotenv").config();
const Web3 = require("web3");
const FlightInsurance = require("../blockchain/abis/FlightInsurance.json");

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

// Flight Insurance Payout
exports.payout = async function (req, res) {
  console.log("Wallet Balance", adminBalance);
  // console.log(req);
  // Creating contract object

  const contractAddress = "0x743C5b2F134290741b6dE9C330d5A2Ff43c773d3";
  const eventType = "INSURED_EVENT";

  if (eventType === "INSURED_EVENT") {
    const flightInsurance = new web3.eth.Contract(
      FlightInsurance.abi,
      contractAddress,
    );

    // fetch("https://api.is452.cloud/get_insurance_by_id?insurance_id=5fa37018faad1fb19321fec1", {
    //   method: "POST",
    //   headers: {
    //     Accept: "application/json",
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(data),
    // })
  
    const amount = await web3.utils.toWei("0.0005", "ether");
  
    const flightInsurancePayout = flightInsurance.methods
      .payout("0x476f44118b3334444e2991b8e3450b855471db6d", amount)
      .encodeABI();
  
    // Need to sign
    const signedPromise = account.signTransaction({
      data: flightInsurancePayout,
      from: adminWalletAddress,
      to: web3.utils.toHex(contractAddress),
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
  }

  if (eventType === "NO_INSURED_EVENT") {
    
  }


  res.json({ message: "payout ok" });
};

// Contract deployment
exports.deploy = async function (req, res) {
  console.log("Wallet Balance", adminBalance);
  //   console.log(req);
  // Creating contract object
  const smartInsurance = new web3.eth.Contract(FlightInsurance.abi);

  const smartInsuranceDeployment = smartInsurance
    .deploy({
      data: FlightInsurance.bytecode,
      arguments: [
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
