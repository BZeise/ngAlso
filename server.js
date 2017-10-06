var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var port = process.env.PORT || 1234;

// globals
var pg = require('pg');
// var config = {
//   database: 'tododb',
//   // connectionString: process.env.DATABASE_URL,
//   host: 'localhost',
//   port: 5432, // always use this port for localhost postgresql
//   max: 12
// };

// var pool = new pg.Pool(config);

// new method removing pg code to methods/connection
// var pool = require('./modules/connection');
// var pg = require('pg');

// static folder
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));

// spin up server
app.listen(port, function() {
  console.log('server up on', port);
  // console.log('pool.pool is', pool.pool);
});

// base url
app.get('/', function(req, res) {
  console.log('base url hit');
  res.sendFile('index.html');
});

// post to add new task to taskDB
app.post( '/tasks', function( req, res ) {
  console.log( 'post hit to /tasks:', req.body );
  pg.connect(, function( err, connection, done ){
    if( err ){
      console.log( err );
      done();
      res.sendStatus( 400 );
    } else {
      console.log( 'connected to tasks db from post' );
      connection.query( "INSERT INTO task_table (task) VALUES ( $1 )",
      [ req.body.task ] );
      done();
      res.sendStatus( 200 );
    } // end no error
  }); // end pool connect
}); // end post

// get to populate task list
app.get('/tasks', function(req, res) {
  console.log('get hit to /tasks');
  pg.connect(process.env.DATABASE_URL, function( err, connection, done ) {
    if( err ) {
      console.log( err );
      done();
      res.sendStatus( 400 );
    } else {
      console.log( 'connected to tasks DB from get' );
      var taskList = [];
      var resultSet = connection.query( "SELECT * FROM task_table ORDER BY complete, task" );
      resultSet.on('row', function(row) {
        taskList.push(row);
      }); //end
      resultSet.on('end', function() {
        done();
        console.log(taskList);
        res.send(taskList);
      });
    } // end no error
  }); // end pool connect
});

// post to delete a task from taskDB
app.post( '/delete', function( req, res ) {
  console.log( 'post hit to /delete:', req.body );
  pg.connect(process.env.DATABASE_URL, function( err, connection, done ){
    if( err ){
      console.log( err );
      done();
      res.sendStatus( 400 );
    } else {
      console.log( 'connected to tasks db from delete post' );
      connection.query( "DELETE FROM task_table WHERE user_id = '" + req.body.deleteID + "';");
      done();
      res.sendStatus( 200 );
    } // end no error
  }); // end pool connect
}); // end post

// post to complete a task from taskDB
app.post( '/complete', function( req, res ) {
  console.log( 'post hit to /complete:', req.body );
  pg.connect(process.env.DATABASE_URL, function( err, connection, done ){
    if( err ){
      console.log( err );
      done();
      res.sendStatus( 400 );
    } else {
      console.log( 'connected to tasks db from complete post, completeID is: ', req.body.completeID );
      connection.query( "UPDATE task_table SET complete = true WHERE user_id = " + req.body.completeID + ";");
      done();
      res.sendStatus( 200 );
    } // end no error
  }); // end pool connect
}); // end post
