function getCookie(name) {
	let value = `; ${document.cookie}`
	let parts = value.split(`; ${name}=`)
	if (parts.length === 2) return parts.pop().split(";").shift()
}

const width = getCookie("browser-width")
if (!width || +width !== window.innerWidth) {
	document.cookie = `browser-width=${window.innerWidth}; path=/; max-age=${
		60 * 60 * 24 * 365
	}; same-site=lax`

	if (sessionStorage.getItem("reloaded")) {
		sessionStorage.removeItem("reloaded")
	} else {
		sessionStorage.setItem("reloaded", "1")
		location.reload()
	}
}
