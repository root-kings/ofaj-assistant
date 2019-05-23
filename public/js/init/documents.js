let documentsVue

document.addEventListener('DOMContentLoaded', function() {
	showWait()
	documentsVue = new Vue({
		el: '#documentList',
		data: {
			documents: [
				
			],
			loggedUser: ''
		},

		methods: {
			poplateDocuments: function() {
				currentVue = this
				fetch(`/api/documents/user/${currentVue.loggedUser}`)
					.then(function(response) {
						return response.json()
					})
					.then(function(documents) {
						currentVue.documents = documents
						// currentVue.documents.normal = documents.filter(document => !document.urgent)
					})
					.catch(function(error) {
						M.toast({ html: 'Error occured! Check console for details.' })
						console.error(error)
					})
			},
			viewDocument: function(id) {
				localStorage.setItem('selectedDocument', id)
				window.location.href = '/document'
			}
		},

		mounted: function() {
			this.loggedUser = localStorage.getItem('loggedUser')
			this.poplateDocuments()
			M.AutoInit()
			hideWait()
		}
	})
})
