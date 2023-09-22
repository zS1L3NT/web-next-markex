import { useEffect, useState } from "react"

import { Button, Flex, Modal, Text } from "@mantine/core"

declare global {
	interface Window {
		workbox?: {
			messageSkipWaiting(): void
			register(): void
			addEventListener(name: string, callback: () => unknown): void
		}
	}
}

export default function PWAUpdaterModal() {
	const [isOpened, setIsOpened] = useState(false)
	const onConfirmActivate = () => window.workbox?.messageSkipWaiting()

	useEffect(() => {
		window.workbox?.addEventListener("controlling", () => {
			window.location.reload()
		})

		window.workbox?.addEventListener("waiting", () => setIsOpened(true))
		window.workbox?.register()
	}, [])

	return (
		<Modal
			opened={isOpened}
			onClose={() => setIsOpened(false)}
			centered
			title="New version available!">
			<Text>A new version of Markex is available! please click below to update</Text>

			<Flex
				mt="md"
				justify="end"
				gap="md">
				<Button
					variant="light"
					color="gray"
					onClick={() => setIsOpened(false)}>
					Cancel
				</Button>
				<Button
					variant="light"
					color="green"
					onClick={onConfirmActivate}>
					Reload and update
				</Button>
			</Flex>
		</Modal>
	)
}
