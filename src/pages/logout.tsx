import { withSession } from "@/utils/middlewares"

export default function Logout() {
	return <></>
}

export const getServerSideProps = withSession(async ({ session }) => {
	session?.destroy()

	return {
		redirect: {
			destination: "/",
			permanent: false
		}
	}
})
