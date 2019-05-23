var mongoose = require('mongoose')
var Schema = mongoose.Schema
var moment = require('moment')

var SpareSchema = new Schema(
	{
		case: {
			type: String,
			default: ''
		},

		stages: [
			{
				name: { type: String, default: '' },
				timeout: { type: String, default: '' },
				// dateexpected: { type: Date },
				datedone: { type: Date },
				notes: { type: String, default: '' }
			}
		],

		stage: {
			type: Number,
			default: 0,
			required: true
		},
		
		incharge: {
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
			}
		},
		supplier: {
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

SpareSchema.virtual('currentstage').get(function() {
	return this.stages[this.stage]
})

module.exports = mongoose.model('Spare', SpareSchema)
