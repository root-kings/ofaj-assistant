let documentsVue

document.addEventListener('DOMContentLoaded', function() {
	showWait()
	documentsVue = new Vue({
		el: '#documentList',
		data: {
			attendingdocuments: [],
			selfdocuments: [],
			selectedofficer: '',
			selectedformat: 'Case Purchase',
			documentId: '',
			name: '',
			fileUrl: '',
			applicant: localStorage.getItem('loggeduser'),
			currentOfficer: '',
			passingOfficerLoggedIn: false,
			file: '',
			officers: [],
			forwardOfficer: '',
			selectedDocument: '',
			OTP: '',
			OTPHash: ''
		},

		methods: {
			poplateDocuments: function() {
				currentVue = this
				fetch(`/api/documents/user/${localStorage.getItem('loggeduser')}/to`)
					.then(function(response) {
						return response.json()
					})
					.then(function(documents) {
						documents.forEach((document, docIndex) => {
							if (document.history.length > 0) document.approved = document.history[document.history.length - 1].action == 'Approved'

							if (document.rejected) documents.splice(docIndex, 1)
						})

						currentVue.attendingdocuments = documents
						// currentVue.documents.normal = documents.filter(document => !document.urgent)
					})
					.catch(function(error) {
						M.toast({ html: 'Error occured! Check console for details.' })
						console.error(error)
					})

				fetch(`/api/documents/user/${localStorage.getItem('loggeduser')}/from`)
					.then(function(response) {
						return response.json()
					})
					.then(function(documents) {
						currentVue.selfdocuments = documents
						// currentVue.documents.normal = documents.filter(document => !document.urgent)
					})
					.catch(function(error) {
						M.toast({ html: 'Error occured! Check console for details.' })
						console.error(error)
					})
				hideWait()
			},

			viewDocument: function(id) {
				localStorage.setItem('selectedDocument', id)
				window.location.href = '/document'
			},

			poplateDocument: function() {
				this.documentId = localStorage.getItem('selectedDocument')

				let currentVue = this

				fetch(`/api/document/${currentVue.documentId}`)
					.then(function(response) {
						return response.json()
					})
					.then(function(document) {
						currentVue.name = document.name
						currentVue.urgent = document.urgent
						currentVue.fileUrl = document.fileUrl
						currentVue.done = document.done
						currentVue.rejected = document.rejected
						currentVue._id = document._id
						currentVue.applicant = document.applicant
						// currentVue.currentOfficer = document.currentOfficer
						currentVue.history = document.history
						currentVue.passingOfficerLoggedIn = localStorage.getItem('loggeduser') == currentVue.currentOfficer._id
					})
					.catch(function(error) {
						M.toast({ html: 'Error occured! Check console for details.' })
						console.error(error)
					})
			},

			rejectDocument: function(documentId) {
				if (sessionGet('OTPAuthenticated') == null) {
					M.toast({ html: 'You need to authenticate session.' })
					this.sessionSetModal()
					return
				}

				if (confirm('Reject this document?')) {
					let currentVue = this
					showWait()
					fetch(`/api/document/${documentId}/reject`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({ officer: localStorage.getItem('loggeduser') })
					})
						.then(function(response) {
							if (response.status == 200) {
								M.toast({ html: 'Document rejected!' })
								// currentVue.rejected = true
							} else {
								M.toast({ html: 'Error occured! Check console for details.' })
							}
						})
						.catch(function(error) {
							M.toast({ html: 'Error occured! Check console for details.' })
							console.error(error)
						})
						.then(function() {
							currentVue.poplateDocuments()
							hideWait()
						})
				}
			},

			forwardDocumentModalOpen: function(documentId) {
				this.selectedDocument = documentId
				M.Modal.getInstance(document.querySelector('#documentForwardModal')).open()
			},

			sessionSetModal: function() {
				M.Modal.getInstance(document.querySelector('#OTPModal')).open()
				this.getOTPRequest()
			},

			validateOTP: function() {
				// console.log('Authenticating...')
				// console.log(this.OTP)
				hashish = sha256(JSON.stringify(this.OTP))
				// console.log(hashish)
				// console.log(this.OTPHash)

				if (this.OTPHash == hashish) {
					sessionSet('OTPAuthenticated', true)
					this.OTP = ''
					M.toast({ html: 'Authentication successful.' })

					M.Modal.getInstance(document.querySelector('#OTPModal')).close()
				}
			},

			getOTPRequest: function() {
				currentVue = this
				fetch(`/api/document/getOTP`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ officer: localStorage.getItem('loggeduser') })
				})
					.then(function(response) {
						if (response.status == 200) {
							return response.json()
						} else {
							M.toast({ html: 'Error occured! Check console for details.' })
						}
					})
					.then(function(OTPHash) {
						currentVue.OTPHash = OTPHash.OTPHash ? OTPHash.OTPHash : ''
					})
					.catch(function(error) {
						M.toast({ html: 'Error occured! Check console for details.' })
						console.error(error)
					})
			},

			approveDocument: function(documentId) {
				if (sessionGet('OTPAuthenticated') == null) {
					M.toast({ html: 'You need to authenticate session.' })
					this.sessionSetModal()
					return
				}

				let currentVue = this
				showWait()
				fetch(`/api/document/${documentId}/approve`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ officer: localStorage.getItem('loggeduser') })
				})
					.then(function(response) {
						if (response.status == 200) {
							M.toast({ html: 'Document approved!' })
							// currentVue.approved = true
						} else {
							M.toast({ html: 'Error occured! Check console for details.' })
						}
					})
					.catch(function(error) {
						M.toast({ html: 'Error occured! Check console for details.' })
						console.error(error)
					})
					.then(function() {
						currentVue.poplateDocuments()
						hideWait()
					})
			},

			finalizeDocument: function(documentId) {
				let currentVue = this
				showWait()
				fetch(`/api/document/${documentId}/finalize`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ officer: localStorage.getItem('loggeduser') })
				})
					.then(function(response) {
						if (response.status == 200) {
							M.toast({ html: 'Document finalized!' })
							// currentVue.done = true
						} else {
							M.toast({ html: 'Error occured! Check console for details.' })
						}
					})
					.catch(function(error) {
						M.toast({ html: 'Error occured! Check console for details.' })
						console.error(error)
					})
					.then(function() {
						currentVue.poplateDocuments()
						hideWait()
					})
			},

			forwardDocument: function() {
				let currentVue = this

				showWait()
				fetch(`/api/document/${currentVue.selectedDocument}/forward`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ officer: localStorage.getItem('loggeduser'), newOfficer: currentVue.forwardOfficer })
				})
					.then(function(response) {
						if (response.status == 200) {
							M.toast({ html: 'Document forwarded!' })
							// currentVue.done = true
						} else {
							M.toast({ html: 'Error occured! Check console for details.' })
						}
					})
					.catch(function(error) {
						M.toast({ html: 'Error occured! Check console for details.' })
						console.error(error)
					})
					.then(function() {
						currentVue.poplateDocuments()
						M.Modal.getInstance(document.querySelector('#documentForwardModal')).close()
						hideWait()
					})
			},

			onSubmit: function() {
				showWait()
				let currentVue = this

				let newDocument = {
					fileUrl: this.fileUrl,
					applicant: this.applicant,
					name: this.name,
					officer: this.selectedofficer,
					format: this.selectedformat,
					urgent: this.urgent
				}

				fetch('/api/document/create', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(newDocument)
				})
					.then(function(response) {
						M.toast({ html: 'Document application sent!' })
						// TODO: redirect to success page
					})
					.catch(function(error) {
						M.toast({ html: 'Error occured! Check console for details.' })
						console.error(error)
					})
					.then(function() {
						currentVue.poplateDocuments()
						hideWait()
					})
			},

			onFileUpload: function() {
				this.file = this.$refs.file.files[0]
				if (this.file == null) return alert('No file selected.')
				this.getSignedRequest(this.file)
			},

			getSignedRequest: function(file) {
				showWait()
				// console.log(file)
				currentVue = this

				fetch(`/api/document/sign-s3?fileName=${file.name}&fileType=${file.type}`)
					.then(function(response) {
						return response.json()
					})
					.then(function(data) {
						currentVue.uploadFile(file, data.signedRequest, data.url)
					})
					.catch(function(error) {
						M.toast({ html: 'Error occured! Check console for details.' })
						console.error(error)
					})
			},

			uploadFile: function(file, signedRequest, url) {
				showWait()
				currentVue = this

				fetch(signedRequest, {
					method: 'PUT',
					mode: 'cors',
					body: file
				})
					.then(function(response) {
						currentVue.fileUrl = url
					})
					.catch(function(error) {
						M.toast({ html: 'Error occured! Check console for details.' })
						console.error(error)
					})
					.then(function() {
						hideWait()
					})
			},

			populateOfficers: function() {
				let currentVue = this

				fetch('/api/users')
					.then(function(response) {
						return response.json()
					})
					.then(function(users) {
						currentVue.officers = users
					})
					.catch(function(error) {
						M.toast({ html: 'Error occured! Check console for details.' })
						console.error(error)
					})
			}
		},

		mounted: function() {
			showWait()
			this.poplateDocuments()
			// this.poplateDocument()
			this.populateOfficers()
			M.AutoInit()
			// hideWait()
		}
	})
})

// get from session (if the value expired it is destroyed)
function sessionGet(key) {
	let stringValue = window.sessionStorage.getItem(key)
	if (stringValue !== null) {
		let value = JSON.parse(stringValue)
		let expirationDate = new Date(value.expirationDate)
		if (expirationDate > new Date()) {
			return value.value
		} else {
			window.sessionStorage.removeItem(key)
		}
	}
	return null
}

// add into session
function sessionSet(key, value, expirationInMin = 30) {
	let expirationDate = new Date(new Date().getTime() + 60000 * expirationInMin)
	let newValue = {
		value: value,
		expirationDate: expirationDate.toISOString()
	}
	window.sessionStorage.setItem(key, JSON.stringify(newValue))
}

var sha256 = function sha256(ascii) {
	function rightRotate(value, amount) {
		return (value >>> amount) | (value << (32 - amount))
	}

	var mathPow = Math.pow
	var maxWord = mathPow(2, 32)
	var lengthProperty = 'length'
	var i, j // Used as a counter across the whole file
	var result = ''

	var words = []
	var asciiBitLength = ascii[lengthProperty] * 8

	//* caching results is optional - remove/add slash from front of this line to toggle
	// Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
	// (we actually calculate the first 64, but extra values are just ignored)
	var hash = (sha256.h = sha256.h || [])
	// Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
	var k = (sha256.k = sha256.k || [])
	var primeCounter = k[lengthProperty]
	/*/
	var hash = [], k = [];
	var primeCounter = 0;
	//*/

	var isComposite = {}
	for (var candidate = 2; primeCounter < 64; candidate++) {
		if (!isComposite[candidate]) {
			for (i = 0; i < 313; i += candidate) {
				isComposite[i] = candidate
			}
			hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0
			k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0
		}
	}

	ascii += '\x80' // Append Ƈ' bit (plus zero padding)
	while ((ascii[lengthProperty] % 64) - 56) ascii += '\x00' // More zero padding
	for (i = 0; i < ascii[lengthProperty]; i++) {
		j = ascii.charCodeAt(i)
		if (j >> 8) return // ASCII check: only accept characters in range 0-255
		words[i >> 2] |= j << (((3 - i) % 4) * 8)
	}
	words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0
	words[words[lengthProperty]] = asciiBitLength

	// process each chunk
	for (j = 0; j < words[lengthProperty]; ) {
		var w = words.slice(j, (j += 16)) // The message is expanded into 64 words as part of the iteration
		var oldHash = hash
		// This is now the undefinedworking hash", often labelled as variables a...g
		// (we have to truncate as well, otherwise extra entries at the end accumulate
		hash = hash.slice(0, 8)

		for (i = 0; i < 64; i++) {
			var i2 = i + j
			// Expand the message into 64 words
			// Used below if
			var w15 = w[i - 15],
				w2 = w[i - 2]

			// Iterate
			var a = hash[0],
				e = hash[4]
			var temp1 =
				hash[7] +
				(rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) + // S1
				((e & hash[5]) ^ (~e & hash[6])) + // ch
				k[i] +
				// Expand the message schedule if needed
				(w[i] =
					i < 16
						? w[i]
						: (w[i - 16] +
						  (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) + // s0
								w[i - 7] +
								(rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) | // s1
						  0)
			// This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble
			var temp2 =
				(rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) + // S0
				((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2])) // maj

			hash = [(temp1 + temp2) | 0].concat(hash) // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()
			hash[4] = (hash[4] + temp1) | 0
		}

		for (i = 0; i < 8; i++) {
			hash[i] = (hash[i] + oldHash[i]) | 0
		}
	}

	for (i = 0; i < 8; i++) {
		for (j = 3; j + 1; j--) {
			var b = (hash[i] >> (j * 8)) & 255
			result += (b < 16 ? 0 : '') + b.toString(16)
		}
	}
	return result
}
