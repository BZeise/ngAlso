var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var port = process.env.PORT || 1234;

// globals
var pg = require('pg');
// var config = {
//   database: 'tododb',
//   host: process.env.DATABASE_URL,
//   // host: process.env.DATABASE_URL || 'localhost',
//   // port: 5432, // always use this port for localhost postgresql
//   max: 12
// };

var config = {};

if (process.env.DATABASE_URL) {
  // Heroku gives a url, not a connection object
  // https://github.com/brianc/node-pg-pool
  var params = url.parse(process.env.DATABASE_URL);

  config = {
    host: params.hostname,
    port: params.port,
    database: params.pathname.split('/')[1],
    ssl: true, // heroku requires ssl to be true
    max: 12, // max number of clients in the pool
    idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  };

} else {
  config = {
    // user: process.env.PG_USER || null, //env var: PGUSER
    // password: process.env.DATABASE_SECRET || null, //env var: PGPASSWOR
    host: process.env.DATABASE_SERVER || 'localhost', // Server hosting the postgres database
    port: process.env.DATABASE_PORT || 5432, //env var: PGPORT
    database: process.env.DATABASE_NAME || 'tododb', //env var: PGDATABASE
    max: 12, // max number of clients in the pool
    idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  };
}

var pool = new pg.Pool(config);

// static folder
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));

// spin up server
app.listen(port, function() {
  console.log('server up on', port);
});

// base url
app.get('/', function(req, res) {
  console.log('base url hit');
  res.sendFile('index.html');
});

// post to add new task to taskDB
app.post( '/tasks', function( req, res ) {
  console.log( 'post hit to /tasks:', req.body );
  pool.connect( function( err, connection, done ){
    if( err ){
      console.log( err );
      done();
      res.send( 400 );
    } else {
      console.log( 'connected to tasks db from post' );
      connection.query( "INSERT INTO task_table (task) VALUES ( $1 )",
      [ req.body.task ] );
      done();
      res.send( 200 );
    } // end no error
  }); // end pool connect
}); // end post

// get to populate task list
app.get('/tasks', function(req, res) {
  console.log('get hit to /tasks');
  pool.connect( function( err, connection, done ) {
    if( err ) {
      console.log( err );
      done();
      res.send( 400 );
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
