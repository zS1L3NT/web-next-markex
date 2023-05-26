import { createContext, PropsWithChildren, useState } from "react"

const NavigatorContext = createContext({
	opened: true,
	toggle: () => {}
})

export default NavigatorContext
export const NavigatorProvider = ({ children }: PropsWithChildren<{}>) => {
	const [opened, setOpened] = useState(true)

	return (
		<NavigatorContext.Provider
			value={{
				opened,
				toggle: () => setOpened(opened => !opened)
			}}>
			{children}
		</NavigatorContext.Provider>
	)
}
