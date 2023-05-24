import { ForwardedRef, forwardRef, useEffect, useImperativeHandle, useState } from "react"

import { CURRENCIES, CURRENCY, CURRENCY_FLAGS } from "@/constants"
import { Button, Checkbox, Flex, Grid, Modal } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"

export type EventsFiltersModalRef = {
	open: () => void
	close: () => void
}

export default forwardRef(function EventsFiltersModal(
	{
		countries,
		setCountries
	}: {
		countries: CURRENCY[]
		setCountries: (countries: CURRENCY[]) => void
	},
	ref: ForwardedRef<EventsFiltersModalRef>
) {
	const [opened, { open, close }] = useDisclosure(false)
	const [currencies, setCurrencies] = useState([...CURRENCIES])

	useImperativeHandle(ref, () => ({ open, close }))

	useEffect(() => {
		setCurrencies(countries)
	}, [countries])

	return (
		<Modal
			opened={opened}
			onClose={close}
			centered
			title="Filters">
			<Flex
				sx={{ flexDirection: "column" }}
				gap="lg"
				py="sm">
				<Checkbox.Group
					size="md"
					value={currencies}
					onChange={e => setCurrencies(e as CURRENCY[])}>
					<Grid>
						{CURRENCIES.map(c => (
							<Grid.Col
								key={c}
								span={4}>
								<Checkbox
									label={CURRENCY_FLAGS[c] + " " + c}
									value={c}
								/>
							</Grid.Col>
						))}
					</Grid>
				</Checkbox.Group>

				<Button
					onClick={() => {
						setCountries(currencies)
						close()
					}}
					disabled={!currencies.length}>
					Apply
				</Button>
			</Flex>
		</Modal>
	)
})
