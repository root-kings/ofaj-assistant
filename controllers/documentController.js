const Document = require('../models/document')
const User = require('../models/user')

const moment = require('moment')
const aws = require('aws-sdk')
const S3_BUCKET = process.env.S3_BUCKET
aws.config.region = process.env.AWS_REGION
const msg91 = require('msg91')('247111AI4S9E1P5bea6b3a', 'OFAJMA', '4')

const util = require('./util')

// API -----
exports.document_detail_get = (req, res) => {
	Document.findById(req.params.id)
		.populate('applicant')
		.populate('currentOfficer')
		.populate('history.officer')
		.exec((err, result) => {
			if (err) return res.status(500).send(err)

			if (result) return res.send(result)

			return res.send(false)
		})
}

exports.documents_get = (req, res) => {
	Document.find({}).exec((err, result) => {
		if (err) return res.status(500).send(err)

		if (result) return res.send(result)

		return res.send(false)
	})
}

exports.documents_user_to_get = (req, res) => {
	Document.find({ currentOfficer: req.params.userid, done: false })
		.populate('applicant')
		.populate('currentOfficer')
		.populate('history.officer')
		.exec((err, result) => {
			if (err) return res.status(500).send(err)

			if (result) return res.send(result)

			return res.send(false)
		})
}

exports.documents_user_from_get = (req, res) => {
	Document.find({ applicant: req.params.userid })
		.populate('applicant')
		.populate('currentOfficer')
		.populate('history.officer')
		.exec((err, result) => {
			if (err) return res.status(500).send(err)

			if (result) return res.send(result)

			return res.send(false)
		})
}

exports.document_create_post = (req, res) => {
	console.log(req.body)
	// console.log(req.file)

	let newdocument = new Document({
		name: req.body.name,
		urgent: req.body.urgent,
		applicant: req.body.applicant,
		currentOfficer: req.body.officer,
		format: req.body.format,
		fileUrl: req.body.fileUrl
	})

	newdocument.save((err, result) => {
		if (err) return res.status(500).send(err)

		return res.send(result)
	})
}

exports.documents_delete_all_get = (req, res) => {
	Document.remove({}, (err, result) => {
		if (err) return res.status(500).send(err)

		if (result) return res.send(result)

		return res.send(false)
	})
}

exports.document_delete_post = (req, res) => {
	Document.findByIdAndRemove(req.params.id, (err, result) => {
		if (err) return res.status(500).send(err)

		if (result) return res.send(true)

		return res.send(false)
	})
}

exports.document_update_post = (req, res) => {
	let newdocument = {
		name: req.body.name
	}

	Document.findOneAndUpdate(
		{
			_id: req.params.id
		},
		newdocument,
		{
			safe: true,
			upsert: true
		}
	).exec((err, result) => {
		if (err) return res.status(500).send(err)

		if (result) return res.send(result)

		return res.send(false)
	})
}

exports.document_forward_post = (req, res) => {
	let historyItem = {
		officer: req.body.officer,
		date: new moment(),
		action: `Forwarded`,
		comment: req.body.comment
	}

	Document.findOneAndUpdate(
		{
			_id: req.params.id
		},
		{
			currentOfficer: req.body.newOfficer,
			$push: {
				history: historyItem
			}
		},
		{
			safe: true,
			upsert: true
		}
	).exec((err, result) => {
		if (err) return res.status(500).send(err)

		if (result) return res.send(result)

		return res.send(false)
	})
}

exports.document_reject_post = (req, res) => {
	let historyItem = {
		officer: req.body.officer,
		date: new moment(),
		action: 'Rejected',
		comment: req.body.comment
	}

	Document.findOneAndUpdate({ _id: req.params.id }, { rejected: true, $push: { history: historyItem } }, { safe: true, upsert: true }).exec((err, result) => {
		if (err) return res.status(500).send(err)

		if (result) return res.send(result)

		return res.send(false)
	})
}

exports.document_approve_post = (req, res) => {
	let historyItem = {
		officer: req.body.officer,
		date: new moment(),
		action: 'Approved',
		comment: req.body.comment
	}

	Document.findOneAndUpdate({ _id: req.params.id }, { approved: true, $push: { history: historyItem } }, { safe: true, upsert: true }).exec((err, result) => {
		if (err) return res.status(500).send(err)

		if (result) return res.send(result)

		return res.send(false)
	})
}

exports.document_finalize_post = (req, res) => {
	let historyItem = {
		officer: req.body.officer,
		date: new moment(),
		action: 'Finalized',
		comment: req.body.comment
	}

	Document.findOneAndUpdate({ _id: req.params.id }, { done: true, $push: { history: historyItem } }, { safe: true, upsert: true }).exec((err, result) => {
		if (err) return res.status(500).send(err)

		if (result) return res.send(result)

		return res.send(false)
	})
}

exports.document_sign_s3_get = (req, res) => {
	const s3 = new aws.S3()
	const fileName = req.query.fileName
	const fileType = req.query.fileType

	const s3Params = {
		Bucket: S3_BUCKET,
		Key: fileName,
		Expires: 60,
		ContentType: fileType,
		ACL: 'public-read'
	}

	s3.getSignedUrl('putObject', s3Params, (err, data) => {
		if (err) {
			console.error(err)
			return res.status(500).send(err)
		}
		const returnData = {
			signedRequest: data,
			url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
		}
		res.send(JSON.stringify(returnData))
	})
}

exports.post_OTP_Request = function(req, res) {
	User.findById(req.body.officer).exec((err, result) => {
		if (err) return res.status(500).send(err)

		if (result) {
			let mobileNo = result.phone

			let OTP = util.generateOTP(6)
			let OTPHash = util.sha256(JSON.stringify(OTP))

			if (mobileNo.length != 13) {
				mobileNo = '+91' + mobileNo
			}

			// console.log('OTP: ' + OTP)
			// return res.send({ OTPHash })

			let message = `Enter OTP ${OTP} for authentication.`

			if (mobileNo.length == 13) {
				msg91.send(mobileNo, message, function(err, response) {
					if (err) console.log(err)
					// console.log(`Sent OTP ${OTP} to ${mobileNo}.`)
					return res.send({ OTPHash })
				})
			} else {
				return res.status(500).send({ error: `Invalid mobile number ${mobileNo}` })
			}
		}
	})
}
