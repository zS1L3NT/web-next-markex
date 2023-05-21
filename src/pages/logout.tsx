import { withIronSessionSsr } from "iron-session/next"

export default function Logout() {
	return <></>
}

export const getServerSideProps = withIronSessionSsr(
	async function handle({ req, res }) {
		req.session?.destroy()

		return {
			redirect: {
				destination: "/"
			},
			props: {}
		}
	},
	{
		cookieName: process.env.COOKIE_NAME,
		password: process.env.COOKIE_PASSWORD,
		cookieOptions: {
			secure: process.env.NODE_ENV === "production"
		}
	}
)
