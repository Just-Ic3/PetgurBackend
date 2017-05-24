var environment = require('./environmentVars')

var express = require('express');
var app = express();
var jwt = require('jsonwebtoken')
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
var router = express.Router();
var mysql = require('mysql');
var connection = mysql.createConnection({
  host : environment.host,
  user : environment.user,
  password : environment.password,
  database : 'Petgur'
});
connection.connect(function(err){
  if(!err){
    console.log('Database connected successfully.')
  } else {
    console.log('Error connecting to database: ' + err)
  }
});

//Enable CORS
router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//RUTAS PUBLICAS
router.post('/register', function(req,res){
  if (!req.body.name || !req.body.email || !req.body.password
    || !req.body.telephone || !req.body.address ||
    !req.body.doggieName || !req.body.doggieRace || !req.body.doggieSex ||
    !req.body.doggieAge || !req.body.doggiePic){
      return res.status(300).send('Invalid JSON Structure');
    } else {
      var post = {
        Name: req.body.name,
        Email: req.body.email,
        Password: req.body.password,
        Telephone: req.body.telephone,
        Address: req.body.address,
        DogName: req.body.doggieName,
        DogRace: req.body.doggieRace,
        DogSex: req.body.doggieSex,
        DogAge: req.body.doggieAge,
        DogPic: req.body.doggiePic
      }
      connection.query('SELECT * FROM Users WHERE Email = ?', req.body.email, function(err,results){
        if (results){
          return res.status(300).send('Duplicate email address.');
        }
      });
      connection.query('INSERT INTO Users SET ?', post, function(err, result){
        if(err) return res.status(500).send('Error on database insertion: ' + err);
        return res.status(200).send('Success');
      });
    }
});

router.get('/login', function(req,res){
  connection.query('Select * FROM Users WHERE Email = ? AND Password = ?',[req.body.email,req.body.password],
  function(err, results){
    if(err) return res.status(500).send('Error on SELECT.');
    if(!results) return res.status(300).send('Invalid email/password combination.');
    var token = jwt.sign(results.idUsers, app.get(environmentVars.secret), {
      expiresIn: '3h'
    });
    return res.status(200).json({token:token})
  });
});

router.use(function(req,res,next){
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (!token) return res.status(403).send('Missing token.');

  jwt.verify(token, app.get(environmentVars.secret), function(err, decoded) {
      if (err) {
        return res.status(300).send('Failed to authenticate token.');
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });
});

//RUTAS QUE REQUIEREN AUTH
router.put('/updateinfo', function(req,res){

});

router.get('/matchup', function(req,res){

});

router.get('/contact', function(req,res){
  if (!req.body.partnerid) return res.status(300).send('Invalid JSON syntax.');
  connection.query('SELECT * FROM Users WHERE idUsers = ?',req.body.partnerid,
  function(err,results){
    if (err) return res.status(500).send('Database query failed: ' + err);
    res.status(200).json(results);
  });
});

app.use('/petgur', router);
var port = environment.port || 8080;
console.log('Listening on port: ' + port)
app.listen(port);
