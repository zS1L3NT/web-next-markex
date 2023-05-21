import "iron-session"

declare type SessionUser = {
	id: string
	token: string
}

declare module "iron-session" {
	interface IronSessionData {
		user?: SessionUser
	}
}
