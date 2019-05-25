let documentsVue

document.addEventListener('DOMContentLoaded', function() {
	showWait()
	documentsVue = new Vue({
		el: '#documentList',
		data: {
			attendingdocuments: [],
			selfdocuments: [],
			selectedofficer: '',
			documentId: '',
			name: '',
			fileUrl: '',
			applicant: localStorage.getItem('loggeduser'),
			currentOfficer: '',
			passingOfficerLoggedIn: false,
			file: '',
			officers: [],
			forwardOfficer: '',
			selectedDocument: ''
		},

		methods: {
			poplateDocuments: function() {
				currentVue = this
				fetch(`/api/documents/user/${localStorage.getItem('loggeduser')}/to`)
					.then(function(response) {
						return response.json()
					})
					.then(function(documents) {
						documents.forEach(document => {
							if (document.history.length > 0) document.approved = document.history[document.history.length - 1].action == 'Approved'
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

			approveDocument: function(documentId) {
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
					body: JSON.stringify({ officer: localStorage.getItem('loggeduser') , newOfficer: currentVue.forwardOfficer })
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
