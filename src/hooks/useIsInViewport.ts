import { RefObject, useEffect, useMemo, useState } from "react"

const useIsInViewport = <T extends HTMLElement>(ref: RefObject<T>) => {
	const observer = useMemo(
		() =>
			globalThis.IntersectionObserver
				? new IntersectionObserver(([entry]) =>
						setIsIntersecting(entry?.isIntersecting ?? false)
				  )
				: null,
		[]
	)
	const [isIntersecting, setIsIntersecting] = useState(false)

	useEffect(() => {
		if (ref.current && observer) {
			observer.observe(ref.current)

			return () => {
				observer.disconnect()
			}
		}

		return
	}, [ref, observer])

	return isIntersecting
}

export default useIsInViewport
