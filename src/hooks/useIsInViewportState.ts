import { Dispatch, SetStateAction, useEffect, useState } from "react"
import useIsInViewport, { CallbackRef } from "use-is-in-viewport"

const useIsInViewportState = (): [boolean, Dispatch<SetStateAction<boolean>>, CallbackRef] => {
	const [state, ref] = useIsInViewport()
	const [isInViewport, setIsInViewport] = useState(false)

	useEffect(() => {
		setIsInViewport(!!state)
	}, [state])

	return [isInViewport, setIsInViewport, ref]
}

export default useIsInViewportState
