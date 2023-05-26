import { createContext, PropsWithChildren, useState } from "react"

const NavigatorContext = createContext({
	opened: true,
	setOpened: (opened: boolean) => {}
})

export default NavigatorContext
export const NavigatorProvider = ({ children }: PropsWithChildren<{}>) => {
	const [opened, setOpened] = useState(true)

	return (
		<NavigatorContext.Provider value={{ opened, setOpened }}>
			{children}
		</NavigatorContext.Provider>
	)
}
