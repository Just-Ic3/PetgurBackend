var environment = require('./environmentVars')

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
var router = express.Router();
var mysql = require('mysql');
var connection = mysql.createConnection({
  host : 'localhost',
  user : 'admin',
  password : environment.password,
  database : 'Petgur'
});
connection.connect(function(err){
  if(!err){
    console.log('Database connected successfully.')
  } else {
    console.log('Error connecting to database.')
  }
});

//RUTAS PUBLICAS
router.post('/register', function(req,res){

});


router.get('/login', function(req,res){

});

router.use(function(req,res,next){
  //TODO: implementar auth
  next();
});

//RUTAS QUE REQUIEREN AUTH
router.put('/updateinfo', function(req,res){

});

router.get('/matchup', function(req,res){

});

router.get('/contact', function(req,res){

});

app.use('/petgur', router);
var port = environment.port || 8080;
console.log('Listening on port: ' + port)
app.listen(port);
