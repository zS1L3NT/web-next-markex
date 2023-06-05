import { createContext, PropsWithChildren, useState } from "react"

const NavigatorContext = createContext({
	opened: false,
	setOpened: (() => {}) as (opened: boolean) => void,
})

export default NavigatorContext
export const NavigatorProvider = ({ children }: PropsWithChildren) => {
	const [opened, setOpened] = useState(false)

	return (
		<NavigatorContext.Provider value={{ opened, setOpened }}>
			{children}
		</NavigatorContext.Provider>
	)
}
