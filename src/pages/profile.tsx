import Head from "next/head"

import { Card, Grid, Skeleton, Stack, Text, Title, useMantineTheme } from "@mantine/core"

import { FidorAccount, FidorCustomer } from "@/@types/fidor"
import { User } from "@/@types/types"
import { useGetFidorAccountsQuery } from "@/api/users"
import Shell from "@/components/Shell"
import { withSession } from "@/utils/middlewares"

type Props = {
	user: User
}

export default function Profile({ user }: Props) {
	const theme = useMantineTheme()

	const { data: accounts } = useGetFidorAccountsQuery()
	const account = accounts?.data?.[0]
	const customer = account?.customers?.[0]

	const isDate = (value: any) => {
		return (
			typeof value === "string" &&
			value.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\+\d{2}:\d{2}|Z)/) &&
			!isNaN(Date.parse(value as string))
		)
	}

	const toReligion = (value: any) => {
		switch (value) {
			case 0:
				return "No information"
			case 1:
				return "No denomination"
			case 2:
				return "Protestant"
			case 3:
				return "Roman-Catholic"
			default:
				return "Other denomination"
		}
	}

	const toColor = (value: any) => {
		if (isDate(value)) {
			return theme.colors.teal[5]
		} else if (typeof value === "boolean") {
			return theme.colors.blue[5]
		} else if (value === null) {
			return theme.colors.red[5]
		} else if (value === undefined) {
			return theme.colors.dark[3]
		} else if (typeof value === "number") {
			return theme.colors.orange[5]
		} else {
			return "white"
		}
	}

	const toString = (value: any) => {
		if (isDate(value)) {
			return new Date(value)
				.toLocaleString("en-SG", {
					timeZone: "Asia/Singapore",
					day: "numeric",
					month: "long",
					year: "numeric",
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
				})
				.replace(" at ", ", ")
		} else if ([true, false, null, undefined].includes(value)) {
			return (value + "")[0]?.toUpperCase() + (value + "").substring(1)
		} else if (typeof value === "object") {
			return JSON.stringify(value)
		} else {
			return value + ""
		}
	}

	return (
		<Shell user={user}>
			<Head>
				<title>Markex | Profile</title>
			</Head>

			<Title my="md">Profile</Title>

			<Stack>
				<Card withBorder>
					<Card.Section
						withBorder
						inheritPadding
						py="xs">
						<Text>Fidor Account Details</Text>
					</Card.Section>
					<Grid
						mt="xs"
						gutter={20}>
						{Object.keys(FidorAccount.definition as Record<string, any>)
							.map(key => key.replace("?", ""))
							.filter(key => key !== "customers")
							.map(key => (
								<Grid.Col
									key={key}
									xs={6}
									md={4}
									span={12}>
									<Text weight={700}>
										{key
											.split("_")
											.map(w => w[0]?.toUpperCase() + w.substring(1))
											.join(" ")}
									</Text>
									{account ? (
										<Text
											truncate
											color={toColor((account as any)[key])}>
											{toString((account as any)[key])}
										</Text>
									) : (
										<Skeleton height={24.8} />
									)}
								</Grid.Col>
							))}
					</Grid>
				</Card>

				<Card withBorder>
					<Card.Section
						withBorder
						inheritPadding
						py="xs">
						<Text>Fidor Customer Details</Text>
					</Card.Section>
					<Grid
						mt="xs"
						gutter={20}>
						{Object.keys(FidorCustomer.definition as Record<string, any>)
							.map(key => key.replace("?", ""))
							.filter(key => key !== "legal")
							.filter(key => key !== "additional_nationalities")
							.map(key => (
								<Grid.Col
									key={key}
									xs={6}
									md={4}
									span={12}>
									<Text weight={700}>
										{key
											.replace("adr", "address")
											.split("_")
											.map(w => w[0]?.toUpperCase() + w.substring(1))
											.join(" ")}
									</Text>
									{customer ? (
										<Text
											truncate
											color={
												key === "religion"
													? "white"
													: toColor((customer as any)[key])
											}>
											{key === "religion"
												? toReligion(customer.religion)
												: toString((customer as any)[key])}
										</Text>
									) : (
										<Skeleton height={24.8} />
									)}
								</Grid.Col>
							))}
					</Grid>
				</Card>
			</Stack>
		</Shell>
	)
}

export const getServerSideProps = withSession<Props>(async ({ user }) => {
	if (user) {
		return {
			props: {
				user,
			},
		}
	} else {
		return {
			notFound: true,
		}
	}
})
