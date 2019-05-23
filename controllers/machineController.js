var Machine = require('../models/machine')
// var Checkup = require('../models/checkup')

var moment = require('moment')

// API -----
exports.machine_detail_get = (req, res) => {
	Machine.findById(req.params.id).exec((err, result) => {
		if (err) return res.status(500).send(err)

		if (result) return res.send(result)

		return res.send(false)
	})
}

exports.machines_get = (req, res) => {
	Machine.find({}).exec((err, result) => {
		if (err) return res.status(500).send(err)

		if (result) return res.send(result)

		return res.send(false)
	})
}

exports.machine_create_post = (req, res) => {
	// console.log(req.body)
	// return res.send(true);

	let newmachine = new Machine({
		name: req.body.name,
		// location: {
		//     sector: req.body.sector,
		//     number: req.body.number,
		//     shop: req.body.shop
		// },
		case: req.body.case,
		testing: req.body.testing,
		remark: req.body.remark,
		checkup: {
			interval: {
				value: req.body.interval,
				unit: req.body.unit
			}
		},

		incharge: {
			name: req.body.incharge,
			phone: req.body['incharge-phone'],
			email: req.body['incharge-email']
		},

		supplier: {
			name: req.body.supplier,
			phone: req.body['supplier-phone'],
			email: req.body['supplier-email'],
			reminder: req.body['supplier-reminder']
		}
	})

	newmachine.save((err, result) => {
		if (err) return res.status(500).send(err)

		if (err) return res.status(500).send(err)

		return res.send(result)

		// return res.redirect('/calibration')
	})

	// console.log(req.body)
	// res.send(false)
}

exports.machines_delete_all_get = (req, res) => {
	Machine.remove({}, (err, result) => {
		if (err) return res.status(500).send(err)

		if (result) return res.send(result)

		return res.send(false)
	})
}

exports.machine_delete_post = (req, res) => {
	Machine.findByIdAndRemove(req.params.id, (err, result) => {
		if (err) return res.status(500).send(err)

		if (result) return res.send(true)

		return res.send(false)
	})
}

exports.machine_record_add_post = (req, res) => {
	Machine.findOneAndUpdate(
		{
			_id: req.body.id
		},
		{
			//remark: req.body.remark,
			$push: {
				'checkup.history': new moment(req.body.date)
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

exports.machine_record_remove_post = (req, res) => {
	Machine.findOneAndUpdate(
		{
			_id: req.body.id
		},
		{
			$pull: {
				'checkup.history': new moment(req.body.date)
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

exports.machine_remark_post = (req, res) => {
	Machine.findOneAndUpdate(
		{
			_id: req.params.id
		},
		{
			remark: req.body.remark
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

exports.machine_update_post = (req, res) => {
	let newmachine = {
		name: req.body.name,
		// location: {
		//     sector: req.body.sector,
		//     number: req.body.number,
		//     shop: req.body.shop
		// },
		case: req.body.case,
		testing: req.body.testing,
		remark: req.body.remark,
		checkup: {
			interval: {
				value: req.body.interval,
				unit: req.body.unit
			}
		},

		incharge: {
			name: req.body.incharge,
			phone: req.body['incharge-phone'],
			email: req.body['incharge-email']
		},

		supplier: {
			name: req.body.supplier,
			phone: req.body['supplier-phone'],
			email: req.body['supplier-email'],
			reminder: req.body['supplier-reminder']
		}
	}

	Machine.findOneAndUpdate(
		{
			_id: req.params.id
		},
		newmachine,
		{
			safe: true,
			upsert: true
		}
	).exec((err, result) => {
		if (err) return res.status(500).send(err)

		// if (result) return res.redirect('/calibration')
		if (result) return res.send(result)

		return res.send(false)
	})

	// console.log(req.body)
	// res.send(false)
}

// Application -----

exports.machine_detail_view_get = (req, res) => {
	Machine.findById(req.params.id).exec((err, result) => {
		if (err) return res.status(500).send(err)

		if (result)
			return res.render('machine', {
				machine: result
			})

		return res.send(false)
	})
}
