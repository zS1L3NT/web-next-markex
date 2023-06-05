import { ForwardedRef, forwardRef, useEffect, useImperativeHandle, useState } from "react"

import { Button, Flex, Indicator, Modal } from "@mantine/core"
import { DatePicker } from "@mantine/dates"
import { useDisclosure } from "@mantine/hooks"

export type EventsDatesModalRef = {
	open: () => void
	close: () => void
}

export default forwardRef(function EventsDatesModal(
	{
		startDate,
		endDate,
		setStartDate,
		setEndDate,
	}: {
		startDate: Date
		endDate: Date
		setStartDate: (date: Date) => void
		setEndDate: (date: Date) => void
	},
	ref: ForwardedRef<EventsDatesModalRef>,
) {
	const [opened, { open, close }] = useDisclosure(false)
	const [dates, setDates] = useState<[Date | null, Date | null]>([null, null])

	useImperativeHandle(ref, () => ({ open, close }))

	useEffect(() => {
		setDates([startDate, endDate])
	}, [startDate, endDate])

	return (
		<Modal
			opened={opened}
			onClose={close}
			centered
			size="auto"
			title="Date Range">
			<Flex
				sx={{ flexDirection: "column" }}
				gap="lg"
				py="sm">
				<DatePicker
					type="range"
					allowSingleDateInRange
					renderDay={date => (
						<Indicator
							size={6}
							color="red"
							offset={-5}
							disabled={date.getDate() !== new Date().getDate()}>
							<div>{date.getDate()}</div>
						</Indicator>
					)}
					value={dates}
					onChange={setDates}
				/>

				<Button
					onClick={() => {
						setStartDate(dates[0] ?? new Date())
						setEndDate(dates[1] ?? dates[0] ?? new Date())
						close()
					}}
					disabled={!dates[0]}>
					Apply
				</Button>
			</Flex>
		</Modal>
	)
})
