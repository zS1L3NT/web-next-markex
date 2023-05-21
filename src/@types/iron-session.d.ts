import "iron-session"
import { FidorUser } from "./fidor"

declare type SessionUser = {
	id: string
	app: {
		bookmarks: string[]
		balances: Record<string, number>
	}
	fidor: typeof FidorUser.infer
}

declare module "iron-session" {
	interface IronSessionData {
		fidor_access_token?: string
		user?: SessionUser
	}
}
