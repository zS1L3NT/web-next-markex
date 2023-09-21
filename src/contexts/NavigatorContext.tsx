import { setCookie } from "cookies-next"
import { createContext, PropsWithChildren, useCallback, useEffect, useState } from "react"

import { BrowserSize } from "@/pages/_app"

const NavigatorContext = createContext<
	{
		isOpened: boolean
		setIsOpened: (opened: boolean) => void
	} & BrowserSize
>({
	isOpened: false,
	setIsOpened: (() => {}) as (opened: boolean) => void,
	isBelowXs: false,
	isBelowSm: false,
	isBelowMd: false,
	isBelowLg: false,
	isBelowXl: false,
	isAboveXs: false,
	isAboveSm: false,
	isAboveMd: false,
	isAboveLg: false,
	isAboveXl: false,
})

export default NavigatorContext
export const NavigatorProvider = (props: PropsWithChildren<{ width: number }>) => {
	const [width, setWidth] = useState(props.width)
	const [isOpened, setIsOpened] = useState(false)

	const onResize = useCallback(() => {
		setWidth(window.innerWidth)
		setCookie("browser-width", window.innerWidth, {
			maxAge: 60 * 60 * 24 * 365,
			sameSite: true,
		})
	}, [])

	useEffect(() => {
		onResize()
		window.addEventListener("resize", onResize)
		return () => {
			window.removeEventListener("resize", onResize)
		}
	}, [onResize])

	return (
		<NavigatorContext.Provider
			value={{
				isOpened,
				setIsOpened,
				isBelowXs: width < 576,
				isBelowSm: width < 768,
				isBelowMd: width < 992,
				isBelowLg: width < 1200,
				isBelowXl: width < 1408,
				isAboveXs: width > 576,
				isAboveSm: width > 768,
				isAboveMd: width > 992,
				isAboveLg: width > 1200,
				isAboveXl: width > 1408,
			}}>
			{props.children}
		</NavigatorContext.Provider>
	)
}
