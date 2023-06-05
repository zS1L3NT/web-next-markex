import { AnimatePresence, motion } from "framer-motion"
import Head from "next/head"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"

import {
	ActionIcon,
	Badge,
	Box,
	Card,
	Flex,
	Grid,
	Image as MantineImage,
	Loader,
	SegmentedControl,
	Stack,
	Table,
	Text,
	Title,
	useMantineTheme
} from "@mantine/core"
import { IconCalendar, IconFilter, IconHistory } from "@tabler/icons-react"

import { FXEmpireEvent } from "@/@types/fxempire"
import { User } from "@/@types/types"
import { useGetFXEmpireEventsQuery, useGetFXStreetNewsQuery } from "@/api/news"
import EventHistoryModal, { EventHistoryModalRef } from "@/components/Modals/EventHistoryModal"
import EventsDatesModal, { EventsDatesModalRef } from "@/components/Modals/EventsDatesModal"
import EventsFiltersModal, { EventsFiltersModalRef } from "@/components/Modals/EventsFiltersModal"
import Shell from "@/components/Shell"
import { CURRENCIES, CURRENCY, CURRENCY_FLAGS, FXEMPIRE_COUNTRIES } from "@/constants"
import useIsInViewportState from "@/hooks/useIsInViewportState"
import { withSession } from "@/utils/middlewares"

type Props = {
	user: User | null
}

export default function Dashboard({ user }: Props) {
	const theme = useMantineTheme()

	const [page, setPage] = useState(1)
	const [startDate, setStartDate] = useState(new Date())
	const [endDate, setEndDate] = useState(new Date())
	const [impact, setImpact] = useState<number>(1)
	const [countries, setCountries] = useState([...CURRENCIES])
	const { data: news, isLoading: newsAreLoading } = useGetFXStreetNewsQuery(undefined, {
		pollingInterval: 60_000
	})
	const { data: eventsQuery, isFetching: eventsAreFetching } = useGetFXEmpireEventsQuery(
		{
			page,
			from: startDate,
			to: endDate,
			impact,
			countries: countries.map(c => FXEMPIRE_COUNTRIES[c])
		},
		{ pollingInterval: 60_000 }
	)

	// Allows the UI to have time to update before re-rendering the loader
	const [isAtBottom, setIsAtBottom, loaderRef] = useIsInViewportState()
	const [isFetchingLock, setIsFetchingLock] = useState(false)
	const [events, setEvents] = useState<[string, FXEmpireEvent[]][]>([])
	const eventsOrDates = useMemo(() => {
		const map = Object.fromEntries(events) as Record<string, FXEmpireEvent[]>
		return Object.keys(map)
			.sort()
			.map(d => [new Date(d), ...(map[d] ?? [])])
			.flat()
	}, [events])
	const eventHistoryModalRef = useRef<EventHistoryModalRef>(null)
	const eventsFiltersModalRef = useRef<EventsFiltersModalRef>(null)
	const eventsDatesModalRef = useRef<EventsDatesModalRef>(null)

	useEffect(() => {
		if (!newsAreLoading && !isFetchingLock && isAtBottom && eventsQuery?.next) {
			setPage(page => page + 1)
		}
	}, [newsAreLoading, isFetchingLock, isAtBottom, eventsQuery?.next])

	useEffect(() => {
		if (eventsQuery?.events) {
			setEvents(events => {
				const map = Object.fromEntries(page === 1 ? [] : events) as Record<
					string,
					FXEmpireEvent[]
				>
				for (const [date, events] of eventsQuery.events) {
					map[date] = [
						...(map[date] ?? []),
						...events.filter(e => !map[date]?.find(e_ => e_ === e))
					].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
				}
				return Object.entries(map)
			})
			setIsAtBottom(false)
			setIsFetchingLock(false)
		}
	}, [setIsAtBottom, eventsQuery, page])

	useEffect(() => {
		setPage(1)
	}, [startDate, endDate, impact, countries])

	useEffect(() => {
		if (eventsAreFetching) {
			setIsFetchingLock(true)
		}
	}, [eventsAreFetching])

	useEffect(() => {
		if (globalThis.window) {
			window.scrollTo(0, 0)
		}
	}, [])

	return (
		<Shell user={user}>
			<Head>
				<title>Markex | Dashboard</title>
			</Head>

			<Title my="md">Latest News</Title>

			<Grid gutter={20}>
				{news?.map(n => (
					<Grid.Col
						key={n.objectID}
						xs={12}
						sm={6}
						md={4}
						xl={3}>
						<Card
							withBorder
							component={Link}
							href={n.FullUrl}>
							<Card.Section withBorder>
								<MantineImage
									style={{ objectFit: "contain" }}
									src={n.ImageUrl}
									alt={n.Title}
									height={180}
								/>
							</Card.Section>

							<Stack
								mt="sm"
								spacing="sm">
								<Text
									weight={600}
									size="md"
									lineClamp={2}>
									{n.Title}
								</Text>

								<Text
									size="xs"
									color="dimmed"
									lineClamp={3}>
									{n.Summary}
								</Text>
							</Stack>
						</Card>
					</Grid.Col>
				))}
			</Grid>

			<Title
				mt="xl"
				mb="xs">
				Economic Calendar
			</Title>

			<Flex
				align="center"
				mb="md"
				gap="sm">
				<ActionIcon
					variant="filled"
					color="blue"
					size="lg"
					onClick={eventsFiltersModalRef.current?.open}
					disabled={eventsAreFetching}>
					<IconFilter size="1.5rem" />
				</ActionIcon>

				<ActionIcon
					variant="filled"
					color="blue"
					size="lg"
					onClick={eventsDatesModalRef.current?.open}
					disabled={eventsAreFetching}>
					<IconCalendar size="1.5rem" />
				</ActionIcon>

				<SegmentedControl
					sx={{
						height: "100%",
						transform: "scale(1.07)",
						marginLeft: 3
					}}
					color={theme.colors.blue[5]}
					data={[
						{ value: "1", label: "Low" },
						{ value: "2", label: "Medium" },
						{ value: "3", label: "High" }
					]}
					value={impact + ""}
					onChange={e => setImpact(+e)}
					disabled={eventsAreFetching}
				/>
			</Flex>

			<Box sx={{ overflowX: "scroll", whiteSpace: "nowrap" }}>
				<Table
					withBorder
					withColumnBorders
					sx={{
						"& th:not(:nth-of-type(3)), & td:not(:nth-of-type(3))": {
							textAlign: "center !important" as "center"
						}
					}}
					mb="xl">
					<thead>
						<tr style={{ background: theme.colors.dark[6] }}>
							<th>Time</th>
							<th>Currency</th>
							<th style={{ width: "40%" }}>Event</th>
							<th>Impact</th>
							<th>Actual</th>
							<th>Consensus</th>
							<th>Previous</th>
						</tr>
					</thead>
					<tbody>
						<AnimatePresence>
							{eventsOrDates.map(eod => {
								if (eod instanceof Date) {
									const date = new Date(eod).toLocaleDateString("en-SG", {
										weekday: "long",
										day: "2-digit",
										month: "long",
										year: "numeric"
									})
									return (
										<motion.tr
											key={date}
											layoutId={date}
											transition={{ duration: 0.5 }}
											style={{ background: theme.colors.dark[6] }}>
											<Text
												bg={theme.colors.dark[5]}
												weight={700}
												component="td"
												colSpan={7}>
												{date}
											</Text>
										</motion.tr>
									)
								} else {
									const event = eod
									const currency = CURRENCIES.find(
										c => event.country === FXEMPIRE_COUNTRIES[c]
									) as CURRENCY
									return (
										<motion.tr
											key={event.id}
											layoutId={event.id + ""}
											style={{ background: theme.colors.dark[6] }}
											transition={{ duration: 0.5 }}>
											<td>
												{new Date(event.date).toLocaleTimeString("en-SG", {
													hour: "2-digit",
													minute: "2-digit"
												})}
											</td>
											<td>
												<Image
													src={CURRENCY_FLAGS[currency]}
													alt={currency}
													width={32}
													height={24}
												/>
												{" " + currency}
											</td>
											<Box
												sx={{
													display: "flex",
													flexDirection: "row",
													alignItems: "center",
													gap: "0.5rem"
												}}
												component="td">
												{event.hasHistory && event.category && (
													<ActionIcon
														variant="light"
														color="blue"
														size="md"
														mx={-4}
														my={-2}
														onClick={() => {
															eventHistoryModalRef.current?.open({
																country: event.country,
																category: event.category ?? ""
															})
														}}>
														<IconHistory size={14} />
													</ActionIcon>
												)}
												{event.name}
											</Box>
											<td>
												<Badge
													color={
														["", "green", "yellow", "red"][event.impact]
													}>
													{["", "Low", "Medium", "High"][event.impact]}
												</Badge>
											</td>
											<td
												style={{
													color: {
														above: theme.colors.green[5],
														below: theme.colors.red[5],
														none: theme.colors.dark[0]
													}[event.color ?? "none"]
												}}>
												{event.actual}
											</td>
											<td>{event.forecast}</td>
											<td>{event.previous}</td>
										</motion.tr>
									)
								}
							})}

							{eventsQuery?.next && (
								<motion.tr
									key="loader"
									ref={loaderRef}
									layoutId="loader"
									style={{ background: theme.colors.dark[6] }}
									transition={{ duration: 0.5 }}>
									<td colSpan={7}>
										<Loader
											size={20}
											color="gray"
											display="block"
											m="auto"
										/>
									</td>
								</motion.tr>
							)}
						</AnimatePresence>
					</tbody>
				</Table>
			</Box>

			<EventHistoryModal {...{ ref: eventHistoryModalRef }} />
			<EventsFiltersModal
				{...{
					ref: eventsFiltersModalRef,
					countries,
					setCountries
				}}
			/>
			<EventsDatesModal
				{...{
					ref: eventsDatesModalRef,
					startDate,
					endDate,
					setStartDate,
					setEndDate
				}}
			/>
		</Shell>
	)
}

export const getServerSideProps = withSession<Props>(async ({ user }) => {
	return {
		props: {
			user
		}
	}
})
