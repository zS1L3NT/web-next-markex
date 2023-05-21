import "iron-session"

import { COUNTRY_FLAGS, CURRENCY_PAIR } from "@/constants"

import { FidorUser } from "./fidor"

declare type SessionUser = {
	id: string
	app: {
		bookmarks: CURRENCY_PAIR[]
		balances: Record<keyof typeof COUNTRY_FLAGS, number | undefined>
	}
	fidor: typeof FidorUser.infer
}

declare module "iron-session" {
	interface IronSessionData {
		fidor_access_token?: string
		user?: SessionUser
	}
}
