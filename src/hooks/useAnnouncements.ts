import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { announcementsApi } from '@/api/announcements'
import type { AnnouncementDetail, AnnouncementListItem, CreateAnnouncementDto } from '@/types/announcement'
import type { PaginatedResponse } from '@/types/common'

const LIST_KEY = ['announcements'] as const

export function useAnnouncementList() {
  return useInfiniteQuery<PaginatedResponse<AnnouncementListItem>>({
    queryKey: LIST_KEY,
    queryFn: ({ pageParam }) =>
      announcementsApi.list({ page: pageParam as number }).then((r) => r.data),
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page
        ? lastPage.meta.current_page + 1
        : undefined,
    initialPageParam: 1,
  })
}

export function useAnnouncementDetail(id: number | undefined) {
  return useQuery<AnnouncementDetail>({
    queryKey: ['announcement', id],
    queryFn: () => announcementsApi.show(id!).then((r) => r.data),
    enabled: id !== undefined,
  })
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAnnouncementDto) => announcementsApi.create(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LIST_KEY })
    },
  })
}
