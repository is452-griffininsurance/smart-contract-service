module.exports = function(app) {  
    // insurance Routes
    var insurance = require("../controllers/insuranceController.js")

    app.route('/tasks')
      .get(insurance.say_hello)
      .post(insurance.display_text);
  };
  