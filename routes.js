const router = require('express').Router()

router.get('/', (req, res) => {
	// res.send('Hello world!')
	res.redirect('/calibration')
	// res.render('index')
})

router.get('/calibration', (req, res) => {
	res.render('calibration')
})

router.get('/machine', (req, res) => {
	res.render('machine')
})

router.get('/spares', (req, res) => {
	res.render('spares')
})

router.get('/spare', (req, res) => {
	res.render('spare')
})

router.get('/users', (req, res) => {
	res.render('users')
})

router.get('/document/create', (req, res) => {
	res.render('documentCreate')
})

router.get('/document', (req, res) => {
	res.render('document')
})

router.get('/documents', (req, res) => {
	res.render('documents')
})

router.get('/about', (req, res) => {
	res.render('about')
})

router.get('/login', (req, res) => {
	res.render('login')
})

router.get('/register', (req, res) => {
	res.render('register')
})

// Machine -----

const machineController = require('./controllers/machineController')

router.get('/api/machines', machineController.machines_get)

router.get('/api/machine/:id', machineController.machine_detail_get)

router.get('/api/machines/deleteall', machineController.machines_delete_all_get)

router.post('/api/machine/create', machineController.machine_create_post)

router.post('/api/machine/record/add', machineController.machine_record_add_post)

router.post('/api/machine/record/remove', machineController.machine_record_remove_post)

router.post('/api/machine/:id/delete', machineController.machine_delete_post)

router.post('/api/machine/:id/remark', machineController.machine_remark_post)

router.post('/api/machine/:id/edit', machineController.machine_update_post)

//router.get('/machine/:id', machineController.machine_detail_view_get)

// Spare -----

const spareController = require('./controllers/spareController')

router.get('/api/spares', spareController.spares_get)

router.get('/api/spare/:id', spareController.spare_detail_get)

router.get('/api/spares/deleteall', spareController.spares_delete_all_get)

router.post('/api/spare/create', spareController.spare_create_post)

router.post('/api/spare/:id/delete', spareController.spare_delete_post)

router.post('/api/spare/:id/edit', spareController.spare_update_post)

router.post('/api/spare/:id/stage', spareController.spare_stage_update_post)

router.post('/api/spare/:id/stage/done', spareController.spare_stage_done_update_post)

// User -----

const userController = require('./controllers/userController')

router.get('/api/users', userController.users_get)

router.get('/api/user/:id', userController.user_detail_get)

router.get('/api/users/deleteall', userController.users_delete_all_get)

router.post('/api/user/create', userController.user_create_post)

router.post('/api/user/:id/delete', userController.user_delete_post)

router.post('/api/user/:id/edit', userController.user_update_post)

router.post('/api/user/:id/activate', userController.user_activate_post)

router.post('/api/user/login', userController.user_login_post)

// Document -----

const documentController = require('./controllers/documentController')

router.get('/api/documents', documentController.documents_get)

router.get('/api/documents/user/:userid/to', documentController.documents_user_to_get)

router.get('/api/documents/user/:userid/from', documentController.documents_user_from_get)

// router.get('/api/document/sign-s3', documentController.document_sign_s3_get)

router.post('/api/document/getOTP', documentController.post_OTP_Request)

router.get('/api/documents/deleteall', documentController.documents_delete_all_get)

router.post('/api/document/create', documentController.document_create_post)
// router.post('/api/document/create', upload.single('document'), documentController.document_create_post)

router.get('/api/document/:id', documentController.document_detail_get)

router.post('/api/document/:id/delete', documentController.document_delete_post)

router.post('/api/document/:id/reject', documentController.document_reject_post)

router.post('/api/document/:id/approve', documentController.document_approve_post)

router.post('/api/document/:id/finalize', documentController.document_finalize_post)

router.post('/api/document/:id/forward', documentController.document_forward_post)

router.post('/api/document/:id/edit', documentController.document_update_post)

const multer = require('multer')
const mime = require('mime')
// const storage = multer.diskStorage()
var storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, __dirname + '/public/files')
	},
	filename: function(req, file, cb) {
		console.log(file)
		cb(
			null,
			file.originalname
				.split(' ')
				.join('_')
				.split(' ')
				.join('_') +
				'_' +
				Date.now() +
				'.' +
				mime.getExtension(file.mimetype)
		)
	}
})

var upload = multer({ storage: storage })

router.post('/api/document/upload', upload.single('file'), (req, res, next) => {
	res.json({ file: '/files/' + req.file.filename })
})

module.exports = router
