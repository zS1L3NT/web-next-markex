import Head from "next/head"

import { SessionUser } from "@/@types/iron-session"
import Shell from "@/components/Shell"
import withSession from "@/utils/withSession"
import { Text, Title } from "@mantine/core"

type Props = {
	user: SessionUser
}

export default function Wallet({ user }: Props) {
	return (
		<Shell user={user}>
			<Head>
				<title>Markex | Wallet</title>
			</Head>

			<Title my="md">Wallet</Title>
		</Shell>
	)
}

export const getServerSideProps = withSession<Props>(async ({ session, params }) => {
	if (session.user) {
		return {
			props: {
				user: session.user
			}
		}
	} else {
		return {
			notFound: true
		}
	}
})
