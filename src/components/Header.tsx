import Link from "next/link"
import { useRouter } from "next/router"
import { useContext } from "react"

import { CURRENCIES } from "@/constants"
import AuthContext from "@/contexts/AuthContext"
import { Avatar, Box, Button, Flex, Header as MantineHeader, Menu, Select } from "@mantine/core"
import { IconLogout, IconSearch, IconUser } from "@tabler/icons-react"

export default function Header() {
	const { user } = useContext(AuthContext)
	const router = useRouter()

	return (
		<MantineHeader
			height={70}
			p="md">
			<Flex align="center">
				<Box sx={{ flex: 1 }}>
					<Select
						sx={{ width: "60%", margin: "auto" }}
						placeholder="Search for a currency"
						size="md"
						icon={<IconSearch />}
						searchable
						nothingFound="No currencies found"
						data={[...new Set(CURRENCIES.map(c => c.split("_")).flat())]}
						variant="filled"
						onChange={console.log}
					/>
				</Box>

				{user ? (
					<Menu width={200}>
						<Menu.Target>
							<Avatar
								sx={{ cursor: "pointer" }}
								size="md"
								src={null}
							/>
						</Menu.Target>

						<Menu.Dropdown>
							<Menu.Item
								icon={<IconUser size={14} />}
								onClick={() => router.push("/profile")}>
								Profile
							</Menu.Item>
							<Menu.Item
								icon={<IconLogout size={14} />}
								onClick={() => router.push("/logout")}>
								Logout
							</Menu.Item>
						</Menu.Dropdown>
					</Menu>
				) : (
					<Button
						variant="light"
						color="gray"
						component={Link}
						href="/login">
						Sign in with Fidor
					</Button>
				)}
			</Flex>
		</MantineHeader>
	)
}
