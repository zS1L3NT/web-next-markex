import { AnimatePresence, motion } from "framer-motion"
import Head from "next/head"
import Image from "next/image"
import { useRouter } from "next/router"
import { useContext, useState } from "react"

import {
	ActionIcon,
	Badge,
	Box,
	Button,
	Card,
	Divider,
	Drawer,
	Flex,
	Grid,
	NumberInput,
	Stack,
	Table,
	Text,
	Title,
	useMantineTheme,
} from "@mantine/core"
import { useDisclosure, useMediaQuery } from "@mantine/hooks"
import { notifications } from "@mantine/notifications"
import { IconCheck, IconShoppingCart } from "@tabler/icons-react"

import { User } from "@/@types/types"
import {
	useCreateAppTransactionMutation,
	useCreateFidorInternalTransferMutation,
} from "@/api/transactions"
import Shell from "@/components/Shell"
import { CURRENCIES, CURRENCY_FLAGS } from "@/constants"
import UserContext from "@/contexts/UserContext"
import { withSession } from "@/utils/middlewares"

type Props = {
	user: User
}

function FidorToMarkex({ isDrawer = false }: { isDrawer?: boolean }) {
	const router = useRouter()
	const { user } = useContext(UserContext)

	const [createAppTransaction] = useCreateAppTransactionMutation()
	const [createFidorInternalTransfer] = useCreateFidorInternalTransferMutation()

	const [amount, setAmount] = useState<number | "">(0)
	const [isLoading, setIsLoading] = useState(false)

	const handleTransaction = async () => {
		if (amount) {
			setIsLoading(true)

			const uuid = URL.createObjectURL(new Blob([])).split("/").at(-1) ?? "" // UUID hack
			const fidorResult = await createFidorInternalTransfer({
				external_uid: uuid,
				account_id: user?.fidor.id ?? "",
				amount,
				receiver: "11874237",
				currency: "SGD",
			})
			if ("data" in fidorResult) {
				const appResult = await createAppTransaction({
					id: uuid,
					instrument: null,
					type: "buy",
					amount,
					price: 1,
				})
				if ("data" in appResult) {
					setAmount(0)
					router.push(router.asPath)
					notifications.show({
						withCloseButton: true,
						autoClose: 10000,
						message: `Deposited SGD ${amount}`,
						color: "green",
						icon: <IconCheck />,
					})
				}
			}

			setIsLoading(false)
		}
	}

	return (
		<Stack w={isDrawer ? "100%" : 250}>
			<Title
				mt="md"
				order={2}>
				Fidor to Markex
			</Title>

			<Text
				c="dimmed"
				fz="xs">
				Transfer SGD from your Fidor Bank Account to your Markex Wallet!
			</Text>

			<NumberInput
				label="Amount"
				description="Amount of SGD to transfer"
				value={amount}
				onChange={setAmount}
				hideControls
			/>

			<Button
				color="green"
				onClick={handleTransaction}
				loading={isLoading}
				disabled={!amount}>
				Transfer
			</Button>
		</Stack>
	)
}

export default function Wallet({ user }: Props) {
	const theme = useMantineTheme()

	const isAboveLg = useMediaQuery(`(min-width: ${theme.breakpoints.lg})`)

	const [opened, { open, close }] = useDisclosure(false)

	return (
		<Shell user={user}>
			<Head>
				<title>Markex | Wallet</title>
			</Head>

			<Flex>
				<Stack
					sx={{ flex: 1 }}
					w="100%">
					<Flex
						mt="md"
						justify="space-between"
						align="center">
						<Title w="fit-content">Wallet</Title>
						{!isAboveLg && (
							<ActionIcon
								size="lg"
								variant="light"
								onClick={open}>
								<IconShoppingCart />
							</ActionIcon>
						)}
					</Flex>

					<Grid
						columns={42}
						gutter={isAboveLg ? 12 : 6}>
						{CURRENCIES.map(c => (
							<Grid.Col
								key={c}
								sm={14}
								md={6}
								span={21}>
								<Card
									sx={{
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										gap: "0.5rem",
									}}
									withBorder
									p="xs">
									<Image
										src={CURRENCY_FLAGS[c]}
										alt={c}
										width={32}
										height={24}
									/>
									<Text
										align="center"
										weight={700}
										truncate>
										{(user.app.balances[c] ?? 0).toFixed(5)}
									</Text>
								</Card>
							</Grid.Col>
						))}
					</Grid>

					<Box sx={{ overflowX: "scroll", whiteSpace: "nowrap" }}>
						<Table
							sx={{
								"& th:not(:first-of-type), & td:not(:first-of-type)": {
									textAlign: "center !important" as "center",
								},
								borderRadius: 5,
							}}
							bg={theme.colors.dark[6]}
							withBorder
							withColumnBorders>
							<thead>
								<tr>
									<th>Transaction Date</th>
									<th>Type</th>
									<th>Order Type</th>
									<th>Instrument</th>
									<th>Price</th>
									<th>Amount</th>
								</tr>
							</thead>
							<tbody>
								<AnimatePresence>
									{user.app.transactions.map(t => (
										<motion.tr
											key={t.id}
											layoutId={t.id}
											style={{ background: theme.colors.dark[6] }}>
											<td>
												{t.created_at.toLocaleString("en-SG", {
													year: "numeric",
													month: "long",
													day: "numeric",
													hour: "numeric",
													minute: "numeric",
													second: "numeric",
												})}
											</td>
											<td>
												{t.instrument === null ? (
													<Badge color="green">Deposit</Badge>
												) : t.instrument.includes("_") ? (
													<Badge color="red">Currency</Badge>
												) : (
													<Badge color="red">Stock</Badge>
												)}
											</td>
											<td>{t.type === "buy" ? "Buy" : "Sell"}</td>
											<td>{t.instrument?.replace("_", " / ") ?? "-"}</td>
											<td>{t.price.toFixed(5) ?? "-"}</td>
											<td>{(t.price * t.amount).toFixed(5)}</td>
										</motion.tr>
									))}
								</AnimatePresence>
							</tbody>
						</Table>
					</Box>
				</Stack>

				{isAboveLg ? (
					<>
						<Divider
							orientation="vertical"
							mx="md"
						/>

						<FidorToMarkex />
					</>
				) : (
					<Drawer
						opened={opened}
						onClose={close}
						position="right">
						<FidorToMarkex isDrawer />
					</Drawer>
				)}
			</Flex>
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
