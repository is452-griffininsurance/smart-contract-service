exports.say_hello = function(req, res) {
    res.json({"message":"hello world"})
}

exports.display_text = function(req, res) {
    console.log(req)
    res.json(req.body)
}