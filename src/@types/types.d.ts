import { Transaction } from "@prisma/client"

import { CURRENCY, CURRENCY_PAIR } from "@/constants"

import { FidorUser } from "./fidor"

declare type User = {
	id: string
	app: {
		balances: Partial<Record<CURRENCY, number>>
		bookmarks: CURRENCY_PAIR[]
		transactions: (Exclude<Transaction, "created_at"> & { created_at: number })[]
	}
	fidor: FidorUser
}
