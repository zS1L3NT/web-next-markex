import withSession from "@/utils/withSession"

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
