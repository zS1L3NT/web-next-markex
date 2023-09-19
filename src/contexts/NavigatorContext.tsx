import { setCookie } from "cookies-next"
import { createContext, PropsWithChildren, useCallback, useEffect, useState } from "react"

import { useMantineTheme } from "@mantine/core"

import { BrowserSize } from "@/pages/_app"

const NavigatorContext = createContext({
	isBelowXs: false,
	isAboveLg: false,
	opened: false,
	setOpened: (() => {}) as (opened: boolean) => void,
})

export default NavigatorContext
export const NavigatorProvider = ({
	children,
	size: size_,
}: PropsWithChildren<{ size: BrowserSize | null }>) => {
	const theme = useMantineTheme()

	const calculate = useCallback((): BrowserSize => {
		if ("window" in globalThis) {
			return {
				isBelowXs: window.matchMedia(`(max-width: ${theme.breakpoints.xs})`).matches,
				isAboveLg: window.matchMedia(`(min-width: ${theme.breakpoints.lg})`).matches,
			}
		} else {
			return {
				isBelowXs: false,
				isAboveLg: false,
			}
		}
	}, [theme.breakpoints.xs, theme.breakpoints.lg])

	const [size, setSize] = useState(size_ ?? calculate())
	const [opened, setOpened] = useState(size.isBelowXs !== size.isAboveLg)

	const onResize = useCallback(() => {
		setCookie("browser-size", JSON.stringify(calculate()), { maxAge: 60 * 60 * 24 * 365 })
		setSize(calculate())
	}, [calculate])

	useEffect(() => {
		onResize()
		window.addEventListener("resize", onResize)
		return () => {
			window.removeEventListener("resize", onResize)
		}
	}, [onResize])

	return (
		<NavigatorContext.Provider value={{ ...size, opened, setOpened }}>
			{children}
		</NavigatorContext.Provider>
	)
}
