let usersview

document.addEventListener('DOMContentLoaded', function() {
	showWait()
	fetch(hostaddress + '/api/users')
		.then(function(response) {
			return response.json()
		})
		.then(function(listusers) {
			usersview = new Vue({
				el: '#users',
				data: {
					users: listusers
				},

				mounted: function() {
					hideWait()
				}
			})
		})
})

function updateView() {
	fetch(hostaddress + '/api/users')
		.then(function(response) {
			return response.json()
		})
		.then(function(listusers) {
			usersview.users = listusers
		})
}

function activateUser(id) {
	fetch(hostaddress + '/api/user/' + id + '/activate', {
		method: 'POST',
		mode: 'cors'
	})
		.then(function(response) {
			return response.json()
		})
		.then(function(result) {
			if (result) {
				M.toast({ html: 'User activated!' })
				updateView()
			}
			hideWait()
		})
}
function deleteUser(id) {
	if (confirm('Delete this user?')) {
		showWait()
		fetch(hostaddress + '/api/user/' + id + '/delete', {
			method: 'POST',
			mode: 'cors'
		})
			.then(function(response) {
				return response.json()
			})
			.then(function(result) {
				if (result) {
					M.toast({ html: 'User deleted!' })
					updateView()
				}
				hideWait()
			})
	}
}
