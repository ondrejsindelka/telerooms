export const typeDefs = `#graphql
  enum RoomStatus {
    FREE
    OCCUPIED
    RESERVED
    OFFLINE
  }

  enum ActionType {
    OCCUPY
    RESERVE
    FREE
    CANCEL_RESERVATION
    ADMIN_OVERRIDE
  }

  type Team {
    id: ID!
    name: String!
    color: String!
    createdAt: String!
    isArchived: Boolean!
    rooms: [Room!]!
  }

  type RoomStats {
    roomId: ID!
    averageOccupationMinutes: Float
    totalVisits: Int!
    lastOccupiedAt: String
  }

  type Room {
    id: ID!
    name: String!
    description: String!
    status: RoomStatus!
    currentTeamId: String
    currentTeam: Team
    occupiedSince: String
    reservedUntil: String
    updatedAt: String!
    stats: RoomStats
  }

  type History {
    id: ID!
    roomId: String!
    room: Room!
    teamId: String!
    team: Team!
    action: ActionType!
    timestamp: String!
    previousStatus: RoomStatus
    newStatus: RoomStatus!
    archivedDate: String
  }

  type DailyStats {
    id: ID!
    date: String!
    totalOccupations: Int!
    totalReservations: Int!
    mostPopularRoomId: String
    averageOccupationMins: Int
    teamActivity: String!
  }

  type Backup {
    id: ID!
    name: String!
    description: String
    createdAt: String!
    teamCount: Int!
    roomCount: Int!
    historyCount: Int!
  }

  type Stats {
    occupiedCount: Int!
    reservedCount: Int!
    freeCount: Int!
    offlineCount: Int!
    totalRooms: Int!
    activeTeams: Int!
  }

  type ArchiveResult {
    success: Boolean!
    archivedHistoryCount: Int!
    message: String!
  }

  type RestoreResult {
    success: Boolean!
    restoredCount: Int!
    message: String!
  }

  type ClearArchiveResult {
    success: Boolean!
    deletedHistory: Int!
    deletedStats: Int!
    deletedTeams: Int!
    message: String!
  }

  input HistoryFilter {
    teamId: String
    roomId: String
    action: ActionType
  }

  type Query {
    rooms: [Room!]!
    teams: [Team!]!
    history(filter: HistoryFilter): [History!]!
    dailyStats(date: String): DailyStats
    currentStats: Stats!
    backups: [Backup!]!
  }

  type AdminResult {
    success: Boolean!
    message: String!
  }

  type Mutation {
    createTeam(name: String!, color: String!): Team!
    updateTeam(id: ID!, name: String, color: String): Team!
    deleteTeam(id: ID!): AdminResult!
    occupyRoom(roomId: ID!, teamId: ID!): Room!
    reserveRoom(roomId: ID!, teamId: ID!): Room!
    freeRoom(roomId: ID!, teamId: ID!): Room!
    cancelReservation(roomId: ID!, teamId: ID!): Room!
    adminSetRoomStatus(roomId: ID!, status: RoomStatus!, teamId: ID): Room!
    adminArchiveAndReset(deleteTeams: Boolean!): ArchiveResult!
    adminRestoreTeamsFromArchive: RestoreResult!
    adminClearArchive: ClearArchiveResult!
    createRoom(name: String!, description: String!): Room!
    updateRoom(id: ID!, name: String, description: String): Room!
    deleteRoom(id: ID!): Boolean!
    createBackup(name: String!, description: String): Backup!
    restoreBackup(id: ID!): AdminResult!
    deleteBackup(id: ID!): AdminResult!
  }

  type Subscription {
    roomsUpdated: [Room!]!
  }
`
