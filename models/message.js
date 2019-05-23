var mongoose = require('mongoose')
var Schema = mongoose.Schema
var moment = require('moment')

var MessageSchema = new Schema(
	{
		to: {
			email: [
				{
					type: String,
					default: ''
				}
			]
		},
		formachine: {
			type: Schema.Types.ObjectId,
			ref: 'Machine'
		},
		ondate: {
			type: Date
		},
		sent: {
			status: {
				type: Boolean,
				default: false
			},
			date: {
				type: Date
			}
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

module.exports = mongoose.model('Message', MessageSchema)
