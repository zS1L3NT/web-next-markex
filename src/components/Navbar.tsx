import { Navbar as MantineNavbar, ScrollArea, useMantineTheme } from "@mantine/core"

export default function Navbar() {
	const theme = useMantineTheme()

	return (
		<MantineNavbar width={{ base: 280 }}>
			<MantineNavbar.Section p="lg">s</MantineNavbar.Section>
			<MantineNavbar.Section
				sx={{
					borderTop: `1px solid ${theme.colors.dark[5]}`,
					borderBottom: `1px solid ${theme.colors.dark[5]}`
				}}
				p="lg"
				grow
				component={ScrollArea}>
				s
			</MantineNavbar.Section>
			<MantineNavbar.Section p="lg">s</MantineNavbar.Section>
		</MantineNavbar>
	)
}
