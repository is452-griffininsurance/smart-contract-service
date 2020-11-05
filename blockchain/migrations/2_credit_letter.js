const CreditLetterFactory = artifacts.require("CreditLetterFactory");

module.exports = function (deployer) {
  deployer.deploy(CreditLetterFactory);
};
