const mongoose = require('mongoose')
const moment = require('moment')

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const msg91 = require('msg91')('247111AI4S9E1P5bea6b3a', 'OFAJMA', '4')
const DBPORT = process.env.MONGODB_URI || 'mongodb://heroku_glpd1cfw:p4g2fbe0l74homdtpals7rg0cm@ds157574.mlab.com:57574/heroku_glpd1cfw'

mongoose.connect(DBPORT)
mongoose.Promise = global.Promise
var db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))

// get list of all messgaes
var Machine = require('./models/machine')

function splitMulti(str, tokens){
        var tempChar = tokens[0]; // We can use the first token as a temporary join character
        for(var i = 1; i < tokens.length; i++){
            str = str.split(tokens[i]).join(tempChar);
        }
        str = str.split(tempChar);
        return str;
}

Machine.find({}).exec((err, result) => {
	if (err) return console.error(err)
	// filter messages for today
	let todayMachines = result.filter(machine => moment(machine.reminder.next, 'DD MMM YYYY').isSame(moment(), 'day'))

	// console.log(todayMachines)

	let emails = []

	todayMachines.forEach(machine => {
		let email = {
			// to: ['dayshmookh_krushn.ghrcecs@raisoni.net'],
			to: splitMulti(machine.supplier.email, [';',',']),
			from: 'M.M. OFAJ Nagpur <notifications@ofajassistant.com>', // 
			subject: `B.Q. for calibration of ${machine.name} from OFAJ`,
			html: `<p>Kindly give B.Q. for calibration of ${machine.name}. \
				   	<br>Thanking you! \
					<br>With regards, \
					<br>${machine.incharge.name} \
					<br>${inchagephone}
					<br>M.M. OFAJ Nagpur<p>`
		}

		emails.push(email)
	})

	console.log('Sending...', emails)

	sgMail
		.sendMultiple(emails)
			.then(result => {
				//Celebrate
				console.log('Sent mails.')
			console.log('Sending messages...')

			todayMachines.forEach(machine => {
				let mobileNo = splitMulti(machine.incharge.phone, [';',','])
				// let mobileNo = ['+918208396310','+917767060939','+919011792002', '+919021735821']
				
				let message = `Email sent for calibration of ${machine.name} to ${machine.supplier.name}. ${moment(machine.reminder.next, 'DD MMM YYYY').fromNow('days')} days left.`

				msg91.send(mobileNo, message, function(err, response) {
					if (err) console.log(err)
					console.log('Sent message.')
				})
			})
		})
		.catch(error => {
			//Log friendly error
			console.error(error.toString())

			//Extract error msg
			// const { message, code, response } = error

			//Extract response msg
			// const { headers, body } = response
		})

	mongoose.disconnect()
})

// create array of objects as shonwn below


let sparesnotificationtext = `${name.spare} is waiting for ${nextstage} since the last ${timeout} days. Please check.` 

