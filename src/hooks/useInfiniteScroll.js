import { useEffect, useRef, useState } from "react"

export function useInfiniteScroll(items, pageSize = 12, resetKey = "", delay ) {
    const [count, setCount] = useState(pageSize)
    const [loadingMore, setLoadingMore] = useState(false)
    const sentinelRef = useRef(null)
    const timerRef = useRef(null)
    const hasMore = count < items?.length

    // back to the first page when search/sort changes
    useEffect(() => {
        clearTimeout(timerRef.current)
        setLoadingMore(false)
        setCount(pageSize)
    }, [resetKey, pageSize])

    useEffect(() => {
        const node = sentinelRef.current
        if (!node || !hasMore || loadingMore) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return
                setLoadingMore(true)
                timerRef.current = setTimeout(() => {
                    setCount((c) => c + pageSize)
                    setLoadingMore(false)
                }, delay)
            },
            { rootMargin: "100px" }
        )
        observer.observe(node)
        return () => observer.disconnect()
    }, [hasMore, loadingMore, pageSize, delay])

    // clear a pending timer if the page is left
    useEffect(() => () => clearTimeout(timerRef.current), [])

    return { visibleItems: items?.slice(0, count), hasMore, loadingMore, sentinelRef }
}