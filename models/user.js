var mongoose = require('mongoose')
var Schema = mongoose.Schema

var UserSchema = new Schema(
	{
		name: {
			type: String,
			default: ''
		},
		phone: {
			type: String,
			default: ''
		},
		email: {
			type: String,
			default: ''
		},
		username: {
			type: String,
			default: ''
		},
		password: {
			type: String,
			default: ''
		},
		active: {
			type: Boolean,
			default: false
		}
	},
	{
		toObject: {
			virtuals: true
		},
		toJSON: {
			virtuals: true
		}
	}
)

module.exports = mongoose.model('User', UserSchema)
