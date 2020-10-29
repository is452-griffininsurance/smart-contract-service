module.exports = function(app) {  
    // insurance Routes
    var insurance = require("../controllers/insuranceController.js")
    var contract_interactor = require("../../sc_middleware_functions/web3-solc-contract-compile-deploy.js")

    app.route('/tasks')
        .get(insurance.say_hello)
        .post(insurance.display_text);

    app.route('/contract')
        .get(contract_interactor.test_sc);
    
    app.route('/create_account')
        .get(contract_interactor.create_account);
  };
  