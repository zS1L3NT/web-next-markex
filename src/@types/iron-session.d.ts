import "iron-session"

import { CURRENCY, CURRENCY_PAIR } from "@/constants"
import { Transaction } from "@prisma/client"

import { FidorUser } from "./fidor"

declare type SessionUser = {
	id: string
	app: {
		bookmarks: CURRENCY_PAIR[]
		balances: Partial<Record<CURRENCY, number>>
		transactions: Transaction[]
	}
	fidor: typeof FidorUser.infer
}

declare module "iron-session" {
	interface IronSessionData {
		fidor_access_token?: string
		fidor_refresh_token?: string
		user?: SessionUser
	}
}
