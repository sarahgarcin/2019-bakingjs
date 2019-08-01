
var bodyParser = require('body-parser');

module.exports = function(app,express){
  app.set("port", 8080); //Server's port number
  app.set("views", __dirname + "/views"); //Specify the views folder
  app.set("view engine", "jade"); //View engine is Jade
  app.use(express.static(__dirname + "/public")); //Specify where the static content is
  app.use(express.static(__dirname + "/sessions"));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
}