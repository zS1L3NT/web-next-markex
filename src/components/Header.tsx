import Link from "next/link"
import { useRouter } from "next/router"
import { useContext } from "react"

import { useGetFidorAvailableQuery } from "@/api/users"
import { CURRENCY_PAIRS } from "@/constants"
import UserContext from "@/contexts/UserContext"
import { Avatar, Box, Button, Flex, Header as MantineHeader, Menu, Select } from "@mantine/core"
import { IconLogout, IconSearch, IconUser } from "@tabler/icons-react"

export default function Header() {
	const { user } = useContext(UserContext)
	const router = useRouter()

	const { error: down, isLoading: downIsLoading } = useGetFidorAvailableQuery(undefined, {
		pollingInterval: 60_000
	})

	return (
		<MantineHeader
			sx={{ transition: "left 0.5s ease" }}
			height={57}>
			<Flex
				h="100%"
				align="center">
				<Box sx={{ flex: 1 }}>
					<Select
						sx={{ width: "60%", margin: "auto" }}
						placeholder="Search for a currency pair"
						icon={<IconSearch size={20} />}
						searchable
						nothingFound="No currency pairs found"
						data={CURRENCY_PAIRS.map(cp => cp.replace("_", " / "))}
						onChange={e => {
							if (e !== null) {
								router.push(
									"/currency-pairs/" + e.toLowerCase().replace(" / ", "-")
								)
							}
						}}
					/>
				</Box>

				{user ? (
					<Menu width={200}>
						<Menu.Target>
							<Avatar
								sx={{ cursor: "pointer" }}
								size="md"
								m="md"
								src={null}
							/>
						</Menu.Target>

						<Menu.Dropdown>
							<Menu.Item
								icon={<IconUser size={14} />}
								component={Link}
								href="/profile">
								Profile
							</Menu.Item>
							<Menu.Item
								icon={<IconLogout size={14} />}
								component={Link}
								href="/logout">
								Logout
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				) : (
					<Button
						variant="light"
						color="gray"
						size="sm"
						m="md"
						component={Link}
						href="/login"
						loading={downIsLoading}
						disabled={!!down}>
						Sign in with Fidor
					</Button>
				)}
			</Flex>
		</MantineHeader>
	)
}
