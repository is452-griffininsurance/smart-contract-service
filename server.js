var express = require("express");
    app = express(),
    port = process.env.PORT || 5001,
    bodyParser = require('body-parser');

app.use(bodyParser.json());
var routes = require("./api/routes/insuranceRoutes");
routes(app);

app.listen(port);

console.log("todo list RESTful API server started on: " + port);