declare namespace NodeJS {
	interface ProcessEnv {
		readonly NEXT_PUBLIC_FIDOR_CLIENT_ID: string
		readonly NEXT_PUBLIC_FIDOR_CLIENT_SECRET: string
		readonly NEXT_PUBLIC_FIDOR_REDIRECT_URI: string
		readonly NEXT_PUBLIC_OANDA_API_KEY: string
		readonly DATABASE_URL: string
		readonly COOKIE_NAME: string
		readonly COOKIE_PASSWORD: string
	}
}
