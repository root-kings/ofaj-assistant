var User = require('../models/user')

var moment = require('moment')

// API -----
exports.user_detail_get = (req, res) => {
	User.findById(req.params.id).exec((err, result) => {
		if (err) return res.status(500).send(err)

		if (result) return res.send(result)

		return res.send(false)
	})
}

exports.users_get = (req, res) => {
	User.find({}, (err, result) => {
		if (err) return res.status(500).send(err)

		if (result) return res.send(result)

		return res.send(false)
	})
}

exports.user_create_post = (req, res) => {
	let newuser = new User(req.body.user)
	console.log(newuser)

	newuser.save((err, result) => {
		if (err) return res.status(500).send(err)

		return res.send(result)
	})

	// console.log(req.body)
	// res.send(false)
}

exports.users_delete_all_get = (req, res) => {
	User.remove({}, (err, result) => {
		if (err) return res.status(500).send(err)

		if (result) return res.send(result)

		return res.send(false)
	})
}

exports.user_delete_post = (req, res) => {
	User.findByIdAndRemove(req.params.id, (err, result) => {
		if (err) return res.status(500).send(err)

		if (result) return res.send(true)

		return res.send(false)
	})
}

exports.user_update_post = (req, res) => {
	let newuser = req.body.user

	User.findOneAndUpdate(
		{
			_id: req.params.id
		},
		newuser,
		{
			safe: true,
			upsert: true
		}
	).exec((err, result) => {
		if (err) return res.status(500).send(err)

		if (result) return res.send(result)

		return res.send(false)
	})

	// console.log(req.body)
	// res.send(false)
}

exports.user_activate_post = (req, res) => {
	User.findByIdAndUpdate(
		req.params.id,
		{
			active: true
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

	// console.log(req.body)
	// res.send(false)
}

exports.user_login_post = (req, res) => {
	console.log(req.body)
	User.findOne({ username: req.body.username }).exec((err, result) => {
		if (err) return res.status(500).send(err)

		if (result) {
			console.log(result)
			if (result.password == req.body.password && result.active) return res.send({ name: result.name, username: result.username, email: result.email, _id: result._id })
		}

		return res.send(false)
	})
}
