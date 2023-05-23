import { AnimatePresence, motion } from "framer-motion"
import Head from "next/head"
import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"

import { FXEmpireEvent } from "@/@types/fxempire"
import { SessionUser } from "@/@types/iron-session"
import { useGetFXStreetEventsQuery, useGetFXStreetNewsQuery } from "@/api/news"
import EventDatesModal, { EventDatesModalRef } from "@/components/Modals/EventDatesModal"
import EventFiltersModal, { EventFiltersModalRef } from "@/components/Modals/EventFiltersModal"
import Shell from "@/components/Shell"
import { CURRENCIES, CURRENCY_FLAGS, FXEMPIRE_COUNTRIES } from "@/constants"
import useIsInViewportState from "@/hooks/useIsInViewportState"
import withSession from "@/utils/withSession"
import {
	ActionIcon, Badge, Box, Card, Flex, Grid, Image, Loader, SegmentedControl, Stack, Table, Text,
	useMantineTheme
} from "@mantine/core"
import { IconCalendar, IconFilter } from "@tabler/icons-react"

type Props = {
	user: SessionUser | null
}

export default function Dashboard({ user }: Props) {
	const theme = useMantineTheme()

	const [page, setPage] = useState(1)
	const [startDate, setStartDate] = useState(new Date())
	const [endDate, setEndDate] = useState(new Date(Date.now() + 1000 * 60 * 60 * 24))
	const [impact, setImpact] = useState<number>(1)
	const [countries, setCountries] = useState([...CURRENCIES])
	const { data: news, isLoading: newsAreLoading } = useGetFXStreetNewsQuery()
	const { data: eventsQuery, isFetching: eventsAreFetching } = useGetFXStreetEventsQuery({
		page,
		from: startDate,
		to: endDate,
		impact,
		countries: countries.map(c => FXEMPIRE_COUNTRIES[c])
	})

	// Allows the UI to have time to update before re-rendering the loader
	const [isAtBottom, setIsAtBottom, loaderRef] = useIsInViewportState()
	const [isFetchingLock, setIsFetchingLock] = useState(false)
	const [events, setEvents] = useState<[string, FXEmpireEvent[]][]>([])
	const eventsOrDates = useMemo(() => {
		const map = Object.fromEntries(events) as Record<string, FXEmpireEvent[]>
		return Object.keys(map)
			.sort()
			.map(d => [new Date(d), ...map[d]!])
			.flat()
	}, [events])
	const eventFiltersModalRef = useRef<EventFiltersModalRef>(null)
	const eventDatesModalRef = useRef<EventDatesModalRef>(null)

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
					].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
				}
				return Object.entries(map)
			})
			setIsAtBottom(false)
			setIsFetchingLock(false)
		}
	}, [eventsQuery, page])

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

			<Text
				weight={700}
				size={36}
				my="md">
				Latest News
			</Text>

			<Grid gutter={20}>
				{news?.map(n => (
					<Grid.Col
						key={n.objectID}
						xs={12}
						md={6}
						lg={4}
						xl={3}>
						<Card
							component={Link}
							href={n.FullUrl}>
							<Card.Section withBorder>
								<Image
									style={{ objectFit: "contain" }}
									src={n.ImageUrl}
									height={180}
									alt={n.Title}
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

			<Text
				weight={700}
				size={36}
				mt="xl"
				mb="xs">
				Economic Calendar
			</Text>

			<Flex
				align="center"
				mb="md"
				gap="sm">
				<ActionIcon
					variant="filled"
					color="blue"
					size="lg"
					onClick={eventFiltersModalRef.current?.open}
					disabled={eventsAreFetching}>
					<IconFilter size="1.5rem" />
				</ActionIcon>

				<ActionIcon
					variant="filled"
					color="blue"
					size="lg"
					onClick={eventDatesModalRef.current?.open}
					disabled={eventsAreFetching}>
					<IconCalendar size="1.5rem" />
				</ActionIcon>

				<SegmentedControl
					sx={{
						height: "100%",
						transform: "scale(1.07)"
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

			<AnimatePresence>
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
								)!
								return (
									<Box
										key={event.id}
										sx={{
											background: theme.colors.dark[6],
											":hover": {
												background: theme.colors.dark[5]
											}
										}}
										component={motion.tr}
										layoutId={event.id + ""}
										transition={{ duration: 0.5 }}>
										<td>
											{new Date(event.date).toLocaleTimeString("en-SG", {
												hour: "2-digit",
												minute: "2-digit"
											})}
										</td>
										<td>
											{CURRENCY_FLAGS[currency]}
											{" " + currency}
										</td>
										<td>{event.name}</td>
										<td>
											<Badge
												color={
													([, "yellow", "orange", "red"] as const)[
														event.impact
													]!
												}>
												{[, "Low", "Medium", "High"][event.impact]}
											</Badge>
										</td>
										<td
											style={{
												color: {
													above: theme.colors.green[5],
													below: theme.colors.red[5],
													none: theme.colors.dark[0]
												}[event.color]
											}}>
											{event.actual}
										</td>
										<td>{event.forecast}</td>
										<td>{event.previous}</td>
									</Box>
								)
							}
						})}

						{eventsQuery?.next && (
							<Box
								ref={loaderRef}
								sx={{
									background: theme.colors.dark[6],
									":hover": {
										background: theme.colors.dark[5]
									}
								}}
								component={motion.tr}
								layoutId="loader"
								transition={{ duration: 0.5 }}>
								<td colSpan={7}>
									<Loader
										size={20}
										color="gray"
										display="block"
										m="auto"
									/>
								</td>
							</Box>
						)}
					</tbody>
				</Table>
			</AnimatePresence>

			<EventFiltersModal
				{...{
					ref: eventFiltersModalRef,
					countries,
					setCountries
				}}
			/>
			<EventDatesModal
				{...{
					ref: eventDatesModalRef,
					startDate,
					endDate,
					setStartDate,
					setEndDate
				}}
			/>
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
