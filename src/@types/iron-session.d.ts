import "iron-session"

import { FidorUser } from "./fidor"

declare module "iron-session" {
	interface IronSessionData {
		fidor?: {
			access_token: string
			refresh_token: string
			user: FidorUser
		}
	}
}
