import { SessionUser } from "@/@types/iron-session"
import Shell from "@/components/Shell"
import { PublicRoute } from "@/utils/authenticators"

type Props = {
	user: SessionUser | null
}

export default function Home({ user }: Props) {
	return <Shell user={user}></Shell>
}

export const getServerSideProps = PublicRoute
