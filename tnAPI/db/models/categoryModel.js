module.exports.categoryModel = function(){
    var mongoose = require('mongoose');
    var monguurl = require('monguurl');

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

    return mongoose.model('Category', categorySchema);
}
