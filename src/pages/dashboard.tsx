import Head from "next/head"
import Link from "next/link"
import { Fragment, useEffect, useRef, useState } from "react"

import { FXEmpireEvent } from "@/@types/fxempire"
import { SessionUser } from "@/@types/iron-session"
import { useGetFXStreetEventsQuery, useGetFXStreetNewsQuery } from "@/api/news"
import Shell from "@/components/Shell"
import { CURRENCIES, CURRENCY_FLAGS, FXEMPIRE_COUNTRIES } from "@/constants"
import useIsInViewport from "@/hooks/useIsInViewport"
import withSession from "@/utils/withSession"
import {
	Badge, Card, Grid, Image, Loader, Stack, Table, Text, useMantineTheme
} from "@mantine/core"

type Props = {
	user: SessionUser | null
}

export default function Dashboard({ user }: Props) {
	const theme = useMantineTheme()

	const [page, setPage] = useState(1)
	const [startDate, setStartDate] = useState(new Date())
	const [endDate, setEndDate] = useState(new Date(Date.now() + 1000 * 60 * 60 * 24))
	const [impact, setImpact] = useState<number>(2)
	const [countries, setCountries] = useState(CURRENCIES)
	const { data: news, isLoading: newsAreLoading } = useGetFXStreetNewsQuery()
	const { data: eventsQuery } = useGetFXStreetEventsQuery({
		page,
		from: startDate,
		to: endDate,
		impact,
		countries: countries.map(c => FXEMPIRE_COUNTRIES[c])
	})

	const [events, setEvents] = useState<[string, FXEmpireEvent[]][]>([])
	const [eventsAreFetching, setEventsAreFetching] = useState(false)
	const ref = useRef<HTMLTableRowElement>(null)
	const isAtBottomOfTable = useIsInViewport(ref)

	useEffect(() => {
		if (!newsAreLoading && !eventsAreFetching && isAtBottomOfTable && eventsQuery?.next) {
			setPage(page => page + 1)
		}
	}, [newsAreLoading, eventsAreFetching, isAtBottomOfTable, eventsQuery?.next])

	useEffect(() => {
		if (eventsQuery?.events) {
			setEvents(events => {
				const map = Object.fromEntries(events) as Record<string, FXEmpireEvent[]>
				for (const [date, events] of eventsQuery.events) {
					map[date] = [...(map[date] ?? []), ...events]
				}
				return Object.entries(map)
			})
			setEventsAreFetching(false)
		}
	}, [eventsQuery])

	useEffect(() => {
		setPage(1)
		setEvents([])
		setEventsAreFetching(true)
	}, [startDate, endDate, impact, countries])

	useEffect(() => {
		console.log(page)
	}, [page])

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
				mb="md">
				Economic Calendar
			</Text>

			<Table
				bg={theme.colors.dark[6]}
				highlightOnHover
				withBorder
				withColumnBorders
				sx={{
					"& th:not(:nth-of-type(3)), & td:not(:nth-of-type(3))": {
						textAlign: "center !important" as "center"
					}
				}}>
				<thead>
					<tr>
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
					{events.map(([day, events]) => (
						<Fragment key={day}>
							<tr>
								<Text
									bg={theme.colors.dark[5]}
									weight={700}
									component="td"
									colSpan={7}>
									{new Date(day).toLocaleDateString("en-SG", {
										weekday: "long",
										day: "2-digit",
										month: "long",
										year: "numeric"
									})}
								</Text>
							</tr>
							{events.map(e => {
								const currency = CURRENCIES.find(
									c => e.country === FXEMPIRE_COUNTRIES[c]
								)!
								return (
									<tr key={e.id}>
										<td>
											{new Date(e.date).toLocaleTimeString("en-SG", {
												hour: "2-digit",
												minute: "2-digit"
											})}
										</td>
										<td>
											{CURRENCY_FLAGS[currency]}
											{" " + currency}
										</td>
										<td>{e.name}</td>
										<td>
											<Badge
												color={
													([, "yellow", "orange", "red"] as const)[
														e.impact
													]!
												}>
												{[, "Low", "Medium", "High"][e.impact]}
											</Badge>
										</td>
										<td
											style={{
												color: {
													above: theme.colors.green[5],
													below: theme.colors.red[5],
													none: theme.colors.dark[0]
												}[e.color]
											}}>
											{e.actual}
										</td>
										<td>{e.forecast}</td>
										<td>{e.previous}</td>
									</tr>
								)
							})}
						</Fragment>
					))}
					{!eventsQuery || eventsQuery.next ? (
						<tr ref={ref}>
							<td colSpan={7}>
								<Loader
									size={20}
									color="gray"
									display="block"
									m="auto"
								/>
							</td>
						</tr>
					) : null}
				</tbody>
			</Table>
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
