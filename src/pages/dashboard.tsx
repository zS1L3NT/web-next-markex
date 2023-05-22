import Head from "next/head"

import { SessionUser } from "@/@types/iron-session"
import Shell from "@/components/Shell"
import withSession from "@/utils/withSession"

type Props = {
	user: SessionUser | null
}

export default function Dashboard({ user }: Props) {
	return (
		<Shell user={user}>
			<Head>
				<title>Markex | Dashboard</title>
			</Head>
		</Shell>
	)
}

export const getServerSideProps = withSession<Props>(async ({ session, params }) => {
	return {
		props: {
			user: session.user ?? null
		}
	}
})
