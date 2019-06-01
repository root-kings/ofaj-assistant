const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
const logger = require('morgan')

require('dotenv').config()

const PORT = process.env.PORT
const DBPORT = process.env.MONGODB_URI

var app = express()

mongoose.connect(DBPORT, { useNewUrlParser: true })
mongoose.Promise = global.Promise
var db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

if (process.env.DEBUG) app.use(logger('dev'))

app.use(cors())

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(express.static('public'))
app.use(express.static('public/build/html'))
app.use(express.static('public/build'))

app.set('view engine', 'pug')
app.set('views', './views')

app.use('/', require('./routes'))

app.listen(PORT, err => {
	if (err) throw err
	console.info('Listening on port ' + PORT + '...')
})
