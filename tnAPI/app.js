var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var async = require('async');
var monguurl = require('monguurl');

var routes = require('./routes/index');
var users = require('./routes/users');

//database initialization
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/meanTreeDatabase');

//Category Schema
var categorySchema = new mongoose.Schema({
    categoryName: String,
    categorySlug: {
        type: String,
        index: {
            unique: true
        }
    },
    categoryCount: String,
    parentCategory: String
});

//Added monguurl to create URL slug - for example: "Mo
categorySchema.plugin(monguurl({
    source: 'categoryName',
    target: 'categorySlug'
}));

var Category = mongoose.model('Category', categorySchema);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

var categoryList = [];

app.get('/categories', function (req, res, next) {
    //categoryList = [];
    //var ls =
    //getAllCategories(0);
    mongoose.model('Category').find(function (err, categories) {
        res.json(categories);
    });
});

app.get('/categories/:categorySlug', function (req, res) {
    return Category.findOne({
        'categorySlug': req.params.categorySlug
    }, function (err, category) {
        if (!err) {
            return res.send(category);
        } 
    });
});

/*
app.post('/categories', function(req, res){
    /*console.log(req.query);
    console.log(req.param);
    console.log(req.body);
    var c = new Category();
    c.categoryName = "hey";
    c.categorySlug = "hey";
    c.categoryCount = "hey";
    c.parentCategory = "hey";

    c.save(function(err) {
        if (err){
            console.log('Error in Saving user: '+err);
            throw err;
        }
        console.log('User Registration succesful');
        //return done(null, newUser);
    });

    var c = new Category();
    c.categoryName = req.param('categoryName', null);
    c.categorySlug = req.param('categorySlug', null);
    c.categoryCount = req.param('categoryCount', null);
    c.parentCategory = req.param('parentCategory', null);


    c.save(function(err) {
        if (err){
            console.log('Error in Saving user: '+err);
            throw err;
        }
        console.log('User Registration succesful');
        //return done(null, newUser);
    });*/
/*
    Category.create(req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });

}); */



app.post('/categories', function (req, res) {
    var category;
    
    category = new Category({
        categoryName: req.body.categoryName,
        categoryCount: req.body.categoryCount,
        parentCategory: req.body.parentCategory
    });
    if (category.parentCategory == null)
        category.parentCategory = 0;
    
    category.save(function (err) {
        if (!err) {
            console.log("created");
            return res.send(category);
        } 
    });

    //});;
});


app.delete('/categories/:id', function (req, res) {
    return Category.findById(req.params.id, function (err, category) {

        mongoose.model('Category').find({
            'parentCategory': category._id
        }, function (err, categoryResult) {
            if (!err) {
                for (var i = 0; i < categoryResult.length; i++) {
                    categoryResult[i].parentCategory = 0;
                    categoryResult[i].save(function (err) {
                        if (!err) {
                            console.log("updated");
                        } else {
                            console.log(err);
                        }
                    });
                }
            } 
        });


        return category.remove(function (err) {
            if (!err) {

                console.log("removed");
                return res.send('');
            } 
        });
    });
});


app.put('/categories/:id', function (req, res) {
    return Category.findById(req.params.id, function (err, category) {
        category.categoryName = req.body.categoryName;
        category.categorySlug = req.body.categorySlug;
        category.categoryCount = req.body.categoryCount;
        category.parentCategory = req.body.parentCategory;
        return category.save(function (err) {
            if (!err) {
                console.log("updated");
				return res.send(category);
            } 
        });
    });
});

// catch 404 and forward to error handler
/*app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
*/
// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
