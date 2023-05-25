import { arrayOf, type, union } from "arktype"

export type FidorCollection<T> = {
	data: T[]
	collection: typeof FidorPageableCollection.infer
}

export type FidorPageableCollection = typeof FidorPageableCollection.infer
export const FidorPageableCollection = type({
	"current_page?": "number|null",
	"per_page?": "number|null",
	"total_entries?": "number|null",
	"total_pages?": "number|null"
})

export type FidorAccountLegal = typeof FidorAccountLegal.infer
export const FidorAccountLegal = type({
	"own_interest?": "boolean|null",
	"tos?": "boolean|null",
	"privacy_policy?": "boolean|null",
	"us_citizen?": "boolean|null",
	"us_tax_payer?": "boolean|null"
})

export type FidorCustomer = typeof FidorCustomer.infer
export const FidorCustomer = type({
	"id?": "string|null",
	"email?": "string|null",
	"first_name?": "string|null",
	"last_name?": "string|null",
	"additional_first_name?": "string|null",
	"gender?": "string|null",
	"title?": "string|null",
	"nick?": "string|null",
	"maiden_name?": "string|null",
	"adr_street?": "string|null",
	"adr_street_number?": "string|null",
	"adr_post_code?": "string|null",
	"adr_city?": "string|null",
	"birthplace?": "string|null",
	"adr_country?": "string|null",
	"adr_phone?": "string|null",
	"adr_mobile?": "string|null",
	"adr_fax?": "string|null",
	"adr_businessphone?": "string|null",
	"birthday?": "string|null",
	"is_verified?": "boolean|null",
	"nationality?": "string|null",
	"marital_status?": "number|null",
	"occupation?": "null|null",
	"religion?": "number|null",
	"id_card_registration_city?": "string|null",
	"id_card_number?": "string|null",
	"id_card_valid_until?": "string|null",
	"legal?": union(FidorAccountLegal, "null"),
	"newsletter?": "boolean|null",
	"created_at?": "string|null",
	"updated_at?": "string|null",
	"company_name?": "string|null",
	"additional_company_name?": "string|null",
	"company_adr_street?": "string|null",
	"company_adr_street_number?": "string|null",
	"company_adr_post_code?": "string|null",
	"company_adr_city?": "string|null",
	"company_register_number?": "string|null"
})

export type FidorUser = typeof FidorUser.infer
export const FidorUser = type({
	"id?": "string|null",
	"email?": "string|null",
	"affiliate_uid?": "string|null",
	"msisdn?": "string|null"
})

export type FidorAccount = typeof FidorAccount.infer
export const FidorAccount = type({
	"id?": "string|null",
	"account_number?": "string|null",
	"iban?": "string|null",
	"bic?": "string|null",
	"balance?": "number|null",
	"balance_available?": "number|null",
	"overdraft?": "number|null",
	"preauth_amount?": "number|null",
	"cash_flow_per_year?": "number|null",
	"is_debit_note_enabled?": "boolean|null",
	"is_trusted?": "boolean|null",
	"is_locked?": "boolean|null",
	"currency?": "string|null",
	"customers?": union(arrayOf(FidorCustomer), "null"),
	"created_at?": "string|null",
	"updated_at?": "string|null"
})

export type FidorInternalTransfer = typeof FidorInternalTransfer.infer
export const FidorInternalTransfer = type({
	"id?": "string|null",
	external_uid: "string",
	account_id: "string",
	"user_id?": "string|null",
	"transaction_id?": "string|null",
	receiver: "string",
	amount: "number",
	"currency?": "string|null",
	"subject?": "string|null",
	"recipient_name?": "string|null",
	"state?": "string|null",
	"created_at?": "string|null",
	"updated_at?": "string|null"
})
