'use client'

import { ApolloProvider, useQuery, useMutation } from '@apollo/client'
import { client } from '@/lib/apollo-client'
import { useParams, useRouter } from 'next/navigation'
import { GET_ROOMS, GET_HISTORY, ADMIN_SET_ROOM_STATUS } from '@/lib/graphql/queries'
import RoomDetail from '@/components/RoomDetail'

function RoomDetailContent() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string

  const { data: roomsData, refetch } = useQuery(GET_ROOMS, {
    pollInterval: 3000
  })

  const { data: historyData } = useQuery(GET_HISTORY, {
    variables: { filter: { roomId } },
    pollInterval: 5000
  })

  const [setRoomStatus] = useMutation(ADMIN_SET_ROOM_STATUS)

  const room = roomsData?.rooms?.find((r: any) => r.id === roomId)

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-xl text-gray-400">Nacitani...</div>
      </div>
    )
  }

  const handleQuickAction = async (status: string) => {
    await setRoomStatus({
      variables: { roomId, status, teamId: null }
    })
    refetch()
  }

  const handleBackToDashboard = () => {
    router.push('/admin')
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background">
      <div className="max-w-6xl mx-auto">
        <RoomDetail
          room={room}
          visitHistory={historyData?.history || []}
          onQuickAction={handleQuickAction}
          onBack={handleBackToDashboard}
        />
      </div>
    </div>
  )
}

export default function RoomDetailPage() {
  return (
    <ApolloProvider client={client}>
      <RoomDetailContent />
    </ApolloProvider>
  )
}
