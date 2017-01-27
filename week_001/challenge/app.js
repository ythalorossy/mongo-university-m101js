/**
 * Created by yross on 16/10/16.
 */
var express = require('express'),
    app = express(),
    engines = require('consolidate'),
    bodyParser = require('body-parser'),
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

app.engine('html', engines.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.use(bodyParser.urlencoded({extended: true}))

// Handler for internal server errors
function errorHandler(err, req, res, next) {
    console.error(err.message);
    console.error(err.stack);
    res.status(500).render('error_template', { error: err });
}

var url = 'mongodb://localhost:27017/video';

MongoClient.connect(url, function(err, db) {

    assert.equal(null, err);
    console.log("Successfully connected to server");

    app.get('/', function (req, res, next) {

        db.collection('movies').find({}).toArray(function(err, docs) {
            res.render('add_movie', { 'movies': docs } );
        });
    });

    app.post('/add_movie', function (req, res, next) {
        var title = req.body.title;
        var year = req.body.year;
        var imdb = req.body.imdb;

        if ( (title == '') || (year == '') || (imdb == '') ) {
            next('Please provide an entry for all fields.');
        } else {

            db.collection('movies').insertOne({
                "title": title,
                "year": year,
                "imdb": imdb
            }, function (err, video){
                assert.equal(null, err);
                res.redirect('/');
                //send("Document inserted with _id: " + video.insertedId);
            });
        }

    });


});

app.use(errorHandler);

var server = app.listen(3000, function() {
    var port = server.address().port;
    console.log('Express server listening on port %s.', port);
});