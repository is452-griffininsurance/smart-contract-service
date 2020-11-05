const fetch = require("node-fetch");

require("dotenv").config();

const Web3 = require("web3");
const FlightInsurance = require("../blockchain/abis/FlightInsurance.json");

var adminBalance = undefined;
const adminWalletAddress = "0xfeB87197aBd18dDaBD28B58b205936dfB4569B17"; // Our wallet
const adminCommissionWalletAddress = "0xd9CE694d87A939341e2e86eF032dE1e08f26e271"; // Our wallet to store commissions

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
  const body = req.body;
  const id = body.id;
  const eventType = body.event;
  console.log(id, eventType);
  
  // Fetch insurance details from our API endpoint
  const resp = await fetch(
    `https://api.is452.cloud/get_insurance_by_id?insurance_id=${id}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  )
    .then((response) => response.json())
    .then((json) => {
      return json
    });
  const insuranceDetails = resp.insurance;

  const contractAddress = insuranceDetails.contract_address;
  const insuredAddress = insuranceDetails.insured_wallet_addr;
  const contractBalance = await web3.eth.getBalance(contractAddress);
  console.log(contractAddress, insuredAddress, "contractBalance", contractBalance);

  if (eventType === "INSURED_EVENT") {
    const flightInsurance = new web3.eth.Contract(
      FlightInsurance.abi,
      contractAddress
    );

    const payoutForInsured = contractBalance * 0.98;
    const commission = contractBalance - payoutForInsured
    console.log("Payouts to insured and us", payoutForInsured, commission);

    // Payout to insured
    const flightInsurancePayout = flightInsurance.methods
      .payout(insuredAddress, payoutForInsured.toString())
      .encodeABI();
    // Payout 
    const flightInsuranceCommission = flightInsurance.methods
      .payout(adminCommissionWalletAddress, commission.toString())
      .encodeABI();

    console.log(flightInsurancePayout);
    console.log(flightInsuranceCommission);

    const gasPrice = await web3.eth.getGasPrice()
      .then((gasPrice) => {
        return gasPrice
      });
      

    const nonce = await web3.eth.getTransactionCount(adminWalletAddress);

    // Need to sign
    const signedPromise1 = account.signTransaction({
      data: flightInsurancePayout,
      from: adminWalletAddress,
      to: web3.utils.toHex(contractAddress),
      gas: web3.utils.toHex(1800000),
      nonce
    });
    await signedPromise1
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

    const signedPromise2 = account.signTransaction({
      data: flightInsuranceCommission,
      from: adminWalletAddress,
      to: web3.utils.toHex(contractAddress),
      gas: web3.utils.toHex(1800000),
      nonce: nonce + 1,
    });
    await signedPromise2
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
      arguments: ["SQ306", "2020-11-30"],
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
