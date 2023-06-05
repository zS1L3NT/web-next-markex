import { FidorUser } from "./fidor"

import "iron-session"

declare module "iron-session" {
	interface IronSessionData {
		fidor?: {
			access_token: string
			refresh_token: string
			user: FidorUser
		}
	}
}
