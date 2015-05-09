var express = require('express');
var router = express.Router();

var async = require('async');


//Category Schema
var Category = require('../db/models/categoryModel').categoryModel();


router.get('/', function (req, res, next) {
    Category.find(function (err, categories) {
        res.json(categories);
    });
});

router.get('/:categorySlug', function (req, res) {
    return Category.findOne({
        'categorySlug': req.params.categorySlug
    }, function (err, category) {
        if (!err) {
            return res.send(category);
        }
    });
});

router.post('/', function (req, res) {
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


router.delete('/:id', function (req, res) {
    return Category.findById(req.params.id, function (err, category) {

        Category.find({
            'parentCategory': category._id
        }, function (err, categoryResults) {
            if (!err) {

                async.each(categoryResults, function (eachChildCategory, callback) {
                    eachChildCategory.remove(function (err) {
                        if (!err) {
                            console.log("updated");
                            callback();
                        } else {
                            console.log(err);
                        }
                    });
                }, function (err) {
                    return category.remove(function (err) {
                        if (!err) {

                            console.log("removed");
                            return res.send('');
                        }
                    });
                });
            }
        });
    });
});


router.put('/:id', function (req, res) {
    return Category.findById(req.params.id, function (err, category) {
        category.categoryName = req.body.categoryName;
        //category.categorySlug = req.body.categorySlug;
        category.categoryCount = req.body.categoryCount;
        category.parentCategory = req.body.parentCategory;
        return category.save(function (err) {
            if (!err) {
                console.log("updated");
                console.log(req.body.parentCategory + " _ _" + category.parentCategory);
                return res.send(category);
            }
        });
    });
});

module.exports = router;
