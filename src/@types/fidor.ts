import { arrayOf, type } from "arktype"

export type FidorCollection<T> = {
	data: T[]
	collection: typeof FidorPageableCollection.infer
}

export const FidorPageableCollection = type({
	"current_page?": "number",
	"per_page?": "number",
	"total_entries?": "number",
	"total_pages?": "number"
})

export const FidorAccountLegal = type({
	"own_interest?": "boolean|null",
	"tos?": "boolean",
	"privacy_policy?": "boolean",
	"us_citizen?": "boolean|null",
	"us_tax_payer?": "boolean|null"
})

export const FidorCustomer = type({
	"id?": "string",
	"email?": "string",
	"first_name?": "string",
	"last_name?": "string",
	"additional_first_name?": "string",
	"gender?": "string",
	"title?": "string",
	"nick?": "string",
	"maiden_name?": "string",
	"adr_street?": "string",
	"adr_street_number?": "string",
	"adr_post_code?": "string",
	"adr_city?": "string",
	"birthplace?": "string",
	"adr_country?": "string",
	"adr_phone?": "string",
	"adr_mobile?": "string",
	"adr_fax?": "string",
	"adr_businessphone?": "string",
	"birthday?": "string",
	"is_verified?": "boolean",
	"nationality?": "string",
	"marital_status?": "number",
	"occupation?": "null",
	"religion?": "number",
	"id_card_registration_city?": "string",
	"id_card_number?": "string|null",
	"id_card_valid_until?": "string|null",
	"legal?": FidorAccountLegal,
	"newsletter?": "boolean",
	"created_at?": "string",
	"updated_at?": "string",
	"company_name?": "string|null",
	"additional_company_name?": "string|null",
	"company_adr_street?": "string",
	"company_adr_street_number?": "string",
	"company_adr_post_code?": "string",
	"company_adr_city?": "string",
	"company_register_number?": "string|null"
})

export const FidorUser = type({
	"id?": "string",
	"email?": "string",
	"affiliate_uid?": "string",
	"msisdn?": "string"
})

export const FidorAccount = type({
	"id?": "string",
	"account_number?": "string",
	"iban?": "string",
	"bic?": "string",
	"balance?": "number",
	"balance_available?": "number",
	"overdraft?": "number",
	"preuth_amount?": "number",
	"cash_flow_per_year?": "number",
	"is_debt_note_enabled?": "boolean",
	"is_trusted?": "boolean",
	"is_locked?": "boolean",
	"currency?": "string",
	"customers?": arrayOf(FidorCustomer),
	"created_at?": "string",
	"updated_at?": "string"
})

export const FidorInternalTransfer = type({
	"id?": "string",
	"external_uid": "string",
	"account_id": "string",
	"user_id?": "string",
	"transaction_id?": "string",
	"receiver": "string",
	"amount": "number",
	"currency?": "string",
	"subject?": "string",
	"recipient_name?": "string",
	"state?": "string",
	"created_at?": "string",
	"updated_at?": "string",
})

export const FidorTransaction = type({
	"id?": "string",
	"account_id?": "string",
	"transaction_type?": "string",
	"transaction_type_details?": {
		"remote_account_id?": "string",
		"internal_transfer_id?": "string",
		"receiver?": "string",
		"remote_bic?": "string",
		"remote_iban?": "string",
		"remote_name?": "string",
		"remote_nick?": "string",
		"remote_subject?": "string",
		"remote_email?": "string",
		"remote_msisdn?": "string",
		"recipient_name?": "string",
	},
	"subject?": "string",
	"amount?": "string",
	"currency?": "number",
	"booking_date?": "string",
	"value_date?": "string",
	"booking_code?": "string",
	"return_transaction_id?": "string",
	"created_at?": "string",
	"updated_at?": "string",
})
