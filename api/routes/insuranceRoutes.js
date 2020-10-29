module.exports = function(app) {  
    // insurance Routes
    var insurance = require("../controllers/insuranceController.js")
    var contract_interactor = require("../../sc_middleware_functions/contract-interaction.js")

    app.route('/tasks')
        .get(insurance.say_hello)
        .post(insurance.display_text);

    app.route('/contract/deploy')
        .get(contract_interactor.deploy);
    
    app.route('/create_account')
        .get(contract_interactor.create_account);
  };
  