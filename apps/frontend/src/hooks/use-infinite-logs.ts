import { useCallback, useEffect, useRef, useState } from "react";

export interface FetchLogsParams {
    page: number;
    limit: number;
    offset: number;
}

interface UseInfiniteLogsOptions<T> {
    initialLogs: T[];
    totalCount?: number;
    isOpen: boolean;
    fetchPage: (params: FetchLogsParams) => Promise<{ data: T[]; total?: number }>;
    pageSize?: number;
}

export function useInfiniteLogs<T extends { id?: string | number }>({
    initialLogs,
    totalCount,
    isOpen,
    fetchPage,
    pageSize = 15,
}: UseInfiniteLogsOptions<T>) {
    const [modalLogs, setModalLogs] = useState<T[]>(initialLogs);
    const [loadingMore, setLoadingMore] = useState(false);
    const [total, setTotal] = useState<number>(totalCount ?? initialLogs.length);
    const [hasMore, setHasMore] = useState<boolean>(
        totalCount !== undefined ? initialLogs.length < totalCount : true,
    );

    // Refs to eliminate stale closures across render cycles
    const loadingRef = useRef(false);
    const hasMoreRef = useRef(true);
    const modalLogsRef = useRef<T[]>(initialLogs);
    const totalRef = useRef<number>(totalCount ?? initialLogs.length);
    const fetchPageRef = useRef(fetchPage);
    const pageSizeRef = useRef(pageSize);
    const prevIsOpenRef = useRef(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);

    // Keep refs in sync with current state & props
    modalLogsRef.current = modalLogs;
    totalRef.current = total;
    fetchPageRef.current = fetchPage;
    pageSizeRef.current = pageSize;
    hasMoreRef.current = hasMore;

    // Core load function that always reads fresh state from refs
    const loadMore = useCallback(async () => {
        if (loadingRef.current || !hasMoreRef.current) return;
        loadingRef.current = true;
        setLoadingMore(true);

        try {
            const currentLogs = modalLogsRef.current;
            const currentOffset = currentLogs.length;
            const limit = pageSizeRef.current;
            const currentPage = Math.floor(currentOffset / limit) + 1;

            const res = await fetchPageRef.current({
                page: currentPage,
                limit,
                offset: currentOffset,
            });

            const newLogs = res.data || [];
            const newTotal = res.total ?? totalRef.current;

            setTotal(newTotal);
            totalRef.current = newTotal;

            if (newLogs.length === 0) {
                hasMoreRef.current = false;
                setHasMore(false);
            } else {
                const existingIds = new Set(
                    modalLogsRef.current.map((item, idx) =>
                        item.id !== undefined ? String(item.id) : `idx-${idx}`,
                    ),
                );
                const filteredNew = newLogs.filter((item, idx) => {
                    const key = item.id !== undefined ? String(item.id) : `idx-${idx}`;
                    return !existingIds.has(key);
                });

                if (filteredNew.length === 0) {
                    hasMoreRef.current = false;
                    setHasMore(false);
                } else {
                    const updated = [...modalLogsRef.current, ...filteredNew];
                    modalLogsRef.current = updated;
                    setModalLogs(updated);

                    const canLoadMore = updated.length < newTotal;
                    hasMoreRef.current = canLoadMore;
                    setHasMore(canLoadMore);

                    // If container still doesn't overflow after rendering this batch, auto-fill so scrolling is active
                    if (canLoadMore) {
                        setTimeout(() => {
                            const container = scrollContainerRef.current;
                            if (
                                container &&
                                container.scrollHeight <= container.clientHeight + 40 &&
                                hasMoreRef.current &&
                                !loadingRef.current
                            ) {
                                loadMore();
                            }
                        }, 60);
                    }
                }
            }
        } catch (err) {
            console.error("Failed to load more logs:", err);
        } finally {
            loadingRef.current = false;
            setLoadingMore(false);
        }
    }, []);

    // Synchronize initial logs on open/close lifecycle
    useEffect(() => {
        if (!isOpen) {
            prevIsOpenRef.current = false;
            setModalLogs(initialLogs);
            modalLogsRef.current = initialLogs;
            const currentTotal = totalCount ?? initialLogs.length;
            setTotal(currentTotal);
            totalRef.current = currentTotal;
            const canLoadMore = initialLogs.length < currentTotal;
            setHasMore(canLoadMore);
            hasMoreRef.current = canLoadMore;
        } else if (isOpen && !prevIsOpenRef.current) {
            // Modal just opened: initialize logs and IMMEDIATELY fetch the next batch so the modal overflows and scrolls
            prevIsOpenRef.current = true;

            const currentTotal = totalCount ?? initialLogs.length;
            setTotal(currentTotal);
            totalRef.current = currentTotal;

            const canLoadMore = initialLogs.length < currentTotal;
            setHasMore(canLoadMore);
            hasMoreRef.current = canLoadMore;

            setModalLogs(initialLogs);
            modalLogsRef.current = initialLogs;

            if (canLoadMore && !loadingRef.current) {
                loadMore();
            }
        }
    }, [isOpen, initialLogs, totalCount, loadMore]);

    // Handle scroll event directly on the container as the primary reliable scroll trigger
    const handleScroll = useCallback(
        (e: React.UIEvent<HTMLDivElement>) => {
            const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
            if (
                scrollHeight - scrollTop - clientHeight < 250 &&
                hasMoreRef.current &&
                !loadingRef.current
            ) {
                loadMore();
            }
        },
        [loadMore],
    );

    // Secondary IntersectionObserver trigger within the scroll container
    useEffect(() => {
        if (!isOpen) return;

        const currentSentinel = sentinelRef.current;
        const currentContainer = scrollContainerRef.current;
        if (!currentSentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting && hasMoreRef.current && !loadingRef.current) {
                    loadMore();
                }
            },
            {
                root: currentContainer || null,
                rootMargin: "250px",
                threshold: 0.01,
            },
        );

        observer.observe(currentSentinel);

        return () => {
            observer.disconnect();
        };
    }, [isOpen, hasMore, loadingMore, loadMore]);

    return {
        modalLogs,
        loadingMore,
        hasMore,
        total,
        scrollContainerRef,
        sentinelRef,
        handleScroll,
        loadMore,
    };
}
