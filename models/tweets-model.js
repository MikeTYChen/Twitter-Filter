var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var contactSchema = new Schema({
	filterS:{ type: String, required : true},
	filterL:{ type: String, required : true},
	filterD:{ type: String, required : true},
	message:{ type: String, required : true},
	creator:{ type: String, required : true},
	date:{ type: String, required : true},
	retweet:{ type: String, required : true},
	favorite:{ type: String, required : true}
});

var memberSchema= new Schema({
	memberName: { type: String },
	memberEmail: { type: String }
})

module.exports = mongoose.model('Contact', contactSchema);