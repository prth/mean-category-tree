module.exports.mongooseConnect = function() {
    var mongoose = require('mongoose');
    return mongoose.connect('mongodb://localhost/meanTreeDatabase12');

}
