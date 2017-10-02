var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({
  extended: false
});
var port = process.env.PORT || 8080;

// globals
var pg = require('pg');
var config = {
  database: 'todoDB',
  host: 'localhost',
  port: 5432, // always use this port for localhost postgresql
  max: 12
};

var pool = new pg.Pool(config);

// static folder
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
  extended: true
}));

// spin up server
app.listen(port, function() {
  console.log('server up on', port);
});

// base url
app.get('/', function(req, res) {
  console.log('base url hit');
  res.sendFile(path.resolve('public/views/index.html'));
});

// get to populate dropdown menu
app.get('/dropdown', function(req, res) {
  console.log('dropdown url hit');
  pool.connect( function( err, connection, done ) {
    if( err ) {
      console.log( err );
      done();
      res.send( 400 );
    } else {
      console.log( 'connected to dropdown DB' );
      var ownerNames = [];
      var resultSet = connection.query( "SELECT owner_first, owner_last FROM petTable WHERE pet_name IS NULL GROUP BY owner_first, owner_last ORDER BY owner_last ASC;" );
      resultSet.on('row', function(row) {
        ownerNames.push(row);
      }); //end
      resultSet.on('end', function() {
        done();
        res.send(ownerNames);
      });
    } // end no error
  }); // end pool connect
});

// post route
app.post( '/register', function( req, res ) {
  console.log( 'post hit to /register:', req.body );
  pool.connect( function( err, connection, done ) {
    if( err ){
      console.log( err );
      done();
      res.send( 400 );
    } else {
      console.log( 'connected to db' );
      connection.query( "INSERT INTO petTable ( owner_first, owner_last ) values ( $1, $2 )", [ req.body.firstName, req.body.lastName ] );
      done();
      res.send( 200 );
    } // end no error
  }); // end pool connect
}); // end /images post

app.post( '/petStuff', function( req, res ) {
  console.log( 'post hit to /petStuff:', req.body );
  pool.connect( function( err, connection, done ){
    if( err ){
      console.log( err );
      done();
      res.send( 400 );
    } else {
      console.log( 'connected to db' );
      connection.query( "INSERT INTO petTable ( pet_name, pet_breed, pet_color, check_in ) values ( $1, $2, $3, $4 )", [ req.body.petName, req.body.breed, req.body.color, true ] );
      done();
      res.send( 200 );
    } // end no error
  }); // end pool connect
}); // end /images post

app.post('/details', function(req, res) {
  console.log('details url hit');
  pool.connect( function( err, connection, done ) {
    if( err ) {
      console.log( err );
      done();
      res.send( 400 );
    } else {
      console.log( 'connected to details DB' );
      var petThang = [];
      var resultSet = connection.query( 'SELECT ( owner_fullname, pet_name, pet_breed, pet_color) from petTable WHERE owner_first is null' );
      resultSet.on('row', function(row) {
        petThang.push(row);
      }); //end
      resultSet.on('end', function() {
        done();
        console.log(petThang);
        res.send(petThang);
      });
    } // end no error
  }); // end pool connect
});

// post to delete a task from taskDB
app.post( '/delete', function( req, res ) {
  console.log( 'post hit to /delete:', req.body );
  pool.connect( function( err, connection, done ){
    if( err ){
      console.log( err );
      done();
      res.send( 400 );
    } else {
      console.log( 'connected to tasks db from delete post' );
      connection.query( "DELETE FROM task_table WHERE user_id = '" + req.body.deleteID + "';");
      done();
      res.send( 200 );
    } // end no error
  }); // end pool connect
}); // end post

// post to complete a task from taskDB
app.post( '/complete', function( req, res ) {
  console.log( 'post hit to /complete:', req.body );
  pool.connect( function( err, connection, done ){
    if( err ){
      console.log( err );
      done();
      res.send( 400 );
    } else {
      console.log( 'connected to tasks db from complete post, completeID is: ', req.body.completeID );
      connection.query( "UPDATE task_table SET complete = true WHERE user_id = " + req.body.completeID + ";");
      done();
      res.send( 200 );
    } // end no error
  }); // end pool connect
}); // end post
