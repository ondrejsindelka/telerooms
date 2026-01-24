'use client'

import { useEffect, useState } from 'react'
import { ApolloProvider } from '@apollo/client'
import { client } from '@/lib/apollo-client'
import TeamSetup from '@/components/TeamSetup'
import RoomsGrid from '@/components/RoomsGrid'

interface Team {
  id: string
  name: string
  color: string
}

export default function Home() {
  const [team, setTeam] = useState<Team | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Load team from localStorage
    const savedTeam = localStorage.getItem('team')
    if (savedTeam) {
      try {
        setTeam(JSON.parse(savedTeam))
      } catch (e) {
        console.error('Error parsing saved team:', e)
      }
    }

    // Start auto-release job (poll API)
    const interval = setInterval(() => {
      fetch('/api/cron').catch(console.error)
    }, 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const handleTeamCreated = (newTeam: Team) => {
    setTeam(newTeam)
    localStorage.setItem('team', JSON.stringify(newTeam))
  }

  const handleLogout = () => {
    setTeam(null)
    localStorage.removeItem('team')
  }

  if (!mounted) {
    return null // Avoid hydration mismatch
  }

  return (
    <ApolloProvider client={client}>
      {!team ? (
        <TeamSetup onTeamCreated={handleTeamCreated} />
      ) : (
        <RoomsGrid team={team} onLogout={handleLogout} />
      )}
    </ApolloProvider>
  )
}
