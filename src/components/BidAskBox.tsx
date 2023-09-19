import { Box, Flex, Skeleton, Text, useMantineTheme } from "@mantine/core"
import { IconCaretDown, IconCaretUp } from "@tabler/icons-react"

export default function BidAskBox({
	type,
	value,
	color,
	animate = true,
}: {
	type: "Bid" | "Ask"
	value: number | string | null
	color: "green" | "red" | "white"
	animate?: boolean
}) {
	const theme = useMantineTheme()
	const mantineColor = color === "white" ? "white" : theme.colors[color][5]
	const backgroundColor = color === "white" ? theme.colors.gray[9] : `${theme.colors[color][5]}22`
	const borderColor = color === "white" ? theme.colors.gray[5] : `${theme.colors[color][5]}`

	return (
		<Box
			sx={{
				flex: 1,
				padding: "0.25rem 0.5rem",
				textAlign: type === "Bid" ? "start" : "end",
				border: `1px solid ${borderColor}`,
				backgroundColor: backgroundColor,
			}}>
			{value != null ? (
				<Flex
					direction={type === "Bid" ? "row" : "row-reverse"}
					align="center">
					<Text
						sx={{ width: "fit-content" }}
						fz="lg"
						color={mantineColor}
						weight={700}>
						{value}
					</Text>

					{color === "green" && (
						<IconCaretUp
							color="transparent"
							fill={mantineColor}
						/>
					)}

					{color === "red" && (
						<IconCaretDown
							color="transparent"
							fill={mantineColor}
						/>
					)}
				</Flex>
			) : (
				<Skeleton
					animate={animate}
					width="60%"
					height={19.9}
					ml={type === "Bid" ? 0 : "auto"}
					my={4}
				/>
			)}
			<Text
				fz="sm"
				color={mantineColor}>
				{type}
			</Text>
		</Box>
	)
}
