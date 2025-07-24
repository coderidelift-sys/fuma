const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fuma.com' },
    update: {},
    create: {
      name: 'FUMA Administrator',
      email: 'admin@fuma.com',
      whatsapp: '+1234567890',
      passwordHash: adminPassword,
      role: 'ADMIN'
    }
  });

  console.log('✅ Admin user created:', admin.email);

  // Create demo users
  const demoPassword = await bcrypt.hash('demo123', 12);
  const demoUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'manager@fuma.com' },
      update: {},
      create: {
        name: 'Team Manager',
        email: 'manager@fuma.com',
        whatsapp: '+1234567891',
        passwordHash: demoPassword,
        role: 'MANAGER'
      }
    }),
    prisma.user.upsert({
      where: { email: 'viewer@fuma.com' },
      update: {},
      create: {
        name: 'Football Fan',
        email: 'viewer@fuma.com',
        whatsapp: '+1234567892',
        passwordHash: demoPassword,
        role: 'VIEWER'
      }
    })
  ]);

  console.log('✅ Demo users created');

  // Create teams
  const teams = await Promise.all([
    prisma.team.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'City FC',
        shortName: 'CFC',
        logoUrl: 'https://tse4.mm.bing.net/th/id/OIP.KVu2tTbpWum5f0bBJh3JGwHaHa?pid=Api&P=0&h=180',
        foundedYear: 1990,
        stadium: 'City Arena',
        stadiumCapacity: 35000,
        city: 'New York',
        country: 'USA',
        managerName: 'John Smith',
        teamColors: 'Blue, White',
        status: 'ACTIVE'
      }
    }),
    prisma.team.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: 'United SC',
        shortName: 'USC',
        logoUrl: 'https://tse4.mm.bing.net/th/id/OIP.KVu2tTbpWum5f0bBJh3JGwHaHa?pid=Api&P=0&h=180',
        foundedYear: 1985,
        stadium: 'United Stadium',
        stadiumCapacity: 40000,
        city: 'Los Angeles',
        country: 'USA',
        managerName: 'Mike Johnson',
        teamColors: 'Red, White',
        status: 'ACTIVE'
      }
    }),
    prisma.team.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: 'Dynamo FC',
        shortName: 'DFC',
        logoUrl: 'https://tse4.mm.bing.net/th/id/OIP.KVu2tTbpWum5f0bBJh3JGwHaHa?pid=Api&P=0&h=180',
        foundedYear: 1995,
        stadium: 'Dynamo Park',
        stadiumCapacity: 30000,
        city: 'Chicago',
        country: 'USA',
        managerName: 'David Wilson',
        teamColors: 'Green, Black',
        status: 'ACTIVE'
      }
    }),
    prisma.team.upsert({
      where: { id: 4 },
      update: {},
      create: {
        name: 'Rovers FC',
        shortName: 'RFC',
        logoUrl: 'https://tse4.mm.bing.net/th/id/OIP.KVu2tTbpWum5f0bBJh3JGwHaHa?pid=Api&P=0&h=180',
        foundedYear: 1988,
        stadium: 'Rovers Ground',
        stadiumCapacity: 25000,
        city: 'Miami',
        country: 'USA',
        managerName: 'Robert Brown',
        teamColors: 'Yellow, Blue',
        status: 'ACTIVE'
      }
    })
  ]);

  console.log('✅ Teams created');

  // Create players
  const players = [
    // City FC Players
    { teamId: 1, firstName: 'John', lastName: 'Smith', jerseyNumber: 9, position: 'FORWARD', nationality: 'England', height: 1.85, weight: 78 },
    { teamId: 1, firstName: 'James', lastName: 'Wilson', jerseyNumber: 10, position: 'FORWARD', nationality: 'England', height: 1.80, weight: 75 },
    { teamId: 1, firstName: 'Samuel', lastName: 'Parker', jerseyNumber: 7, position: 'MIDFIELDER', nationality: 'USA', height: 1.78, weight: 72 },
    { teamId: 1, firstName: 'Michael', lastName: 'Brown', jerseyNumber: 4, position: 'DEFENDER', nationality: 'Germany', height: 1.88, weight: 82 },
    { teamId: 1, firstName: 'Robert', lastName: 'Taylor', jerseyNumber: 1, position: 'GOALKEEPER', nationality: 'France', height: 1.92, weight: 85 },

    // United SC Players
    { teamId: 2, firstName: 'David', lastName: 'Johnson', jerseyNumber: 8, position: 'MIDFIELDER', nationality: 'Spain', height: 1.75, weight: 70 },
    { teamId: 2, firstName: 'Thomas', lastName: 'Miller', jerseyNumber: 6, position: 'DEFENDER', nationality: 'Germany', height: 1.86, weight: 80 },
    { teamId: 2, firstName: 'Paul', lastName: 'White', jerseyNumber: 11, position: 'FORWARD', nationality: 'England', height: 1.83, weight: 76 },
    { teamId: 2, firstName: 'Carlos', lastName: 'Rodriguez', jerseyNumber: 1, position: 'GOALKEEPER', nationality: 'Spain', height: 1.90, weight: 83 },
    { teamId: 2, firstName: 'Marco', lastName: 'Silva', jerseyNumber: 10, position: 'FORWARD', nationality: 'Brazil', height: 1.77, weight: 73 },

    // Dynamo FC Players
    { teamId: 3, firstName: 'Alex', lastName: 'Martinez', jerseyNumber: 9, position: 'FORWARD', nationality: 'Mexico', height: 1.81, weight: 74 },
    { teamId: 3, firstName: 'Luis', lastName: 'Garcia', jerseyNumber: 8, position: 'MIDFIELDER', nationality: 'Spain', height: 1.76, weight: 71 },
    { teamId: 3, firstName: 'Kevin', lastName: 'Anderson', jerseyNumber: 5, position: 'DEFENDER', nationality: 'USA', height: 1.87, weight: 81 },
    { teamId: 3, firstName: 'Steve', lastName: 'Wilson', jerseyNumber: 1, position: 'GOALKEEPER', nationality: 'England', height: 1.89, weight: 84 },

    // Rovers FC Players
    { teamId: 4, firstName: 'Daniel', lastName: 'Lee', jerseyNumber: 10, position: 'FORWARD', nationality: 'South Korea', height: 1.79, weight: 73 },
    { teamId: 4, firstName: 'Ryan', lastName: 'Murphy', jerseyNumber: 7, position: 'MIDFIELDER', nationality: 'Ireland', height: 1.82, weight: 75 },
    { teamId: 4, firstName: 'Chris', lastName: 'Davis', jerseyNumber: 3, position: 'DEFENDER', nationality: 'USA', height: 1.84, weight: 78 },
    { teamId: 4, firstName: 'Mark', lastName: 'Thompson', jerseyNumber: 1, position: 'GOALKEEPER', nationality: 'Canada', height: 1.91, weight: 86 }
  ];

  for (const playerData of players) {
    await prisma.player.upsert({
      where: { 
        teamId_jerseyNumber: { 
          teamId: playerData.teamId, 
          jerseyNumber: playerData.jerseyNumber 
        } 
      },
      update: {},
      create: {
        ...playerData,
        dateOfBirth: new Date(1990 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        preferredFoot: Math.random() > 0.5 ? 'RIGHT' : 'LEFT',
        photoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDM3hN-VCNh90Pop53o8bQ1L_W8kn4LhZf7Q&s',
        marketValue: Math.floor(Math.random() * 50000000) + 1000000, // 1M to 50M
        status: 'ACTIVE'
      }
    });
  }

  console.log('✅ Players created');

  // Create tournaments
  const tournaments = await Promise.all([
    prisma.tournament.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'Premier League 2023',
        description: 'The top football league featuring 20 teams competing for the championship.',
        startDate: new Date('2023-06-01'),
        endDate: new Date('2023-07-30'),
        tournamentType: 'LEAGUE',
        status: 'ONGOING',
        maxTeams: 20,
        prizeMoney: 10000000
      }
    }),
    prisma.tournament.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: 'Champions Cup',
        description: 'Knockout tournament featuring 16 elite teams.',
        startDate: new Date('2023-08-10'),
        endDate: new Date('2023-09-25'),
        tournamentType: 'KNOCKOUT',
        status: 'UPCOMING',
        maxTeams: 16,
        prizeMoney: 5000000
      }
    }),
    prisma.tournament.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: 'Winter Tournament',
        description: 'Annual cold weather competition.',
        startDate: new Date('2023-01-05'),
        endDate: new Date('2023-02-20'),
        tournamentType: 'LEAGUE',
        status: 'COMPLETED',
        maxTeams: 8,
        prizeMoney: 2000000
      }
    })
  ]);

  console.log('✅ Tournaments created');

  // Add teams to tournaments
  const tournamentTeams = [
    // Premier League teams
    { tournamentId: 1, teamId: 1 },
    { tournamentId: 1, teamId: 2 },
    { tournamentId: 1, teamId: 3 },
    { tournamentId: 1, teamId: 4 },
    
    // Champions Cup teams
    { tournamentId: 2, teamId: 1 },
    { tournamentId: 2, teamId: 2 },
    
    // Winter Tournament teams
    { tournamentId: 3, teamId: 3 },
    { tournamentId: 3, teamId: 4 }
  ];

  for (const tt of tournamentTeams) {
    await prisma.tournamentTeam.upsert({
      where: {
        tournamentId_teamId: {
          tournamentId: tt.tournamentId,
          teamId: tt.teamId
        }
      },
      update: {},
      create: {
        ...tt,
        points: Math.floor(Math.random() * 30),
        matchesPlayed: Math.floor(Math.random() * 10) + 5,
        wins: Math.floor(Math.random() * 8),
        draws: Math.floor(Math.random() * 5),
        losses: Math.floor(Math.random() * 3),
        goalsFor: Math.floor(Math.random() * 25) + 5,
        goalsAgainst: Math.floor(Math.random() * 15) + 2
      }
    });
  }

  console.log('✅ Tournament teams created');

  // Create matches
  const matches = [
    {
      tournamentId: 1,
      homeTeamId: 1,
      awayTeamId: 2,
      matchDate: new Date('2023-06-15T15:00:00Z'),
      venue: 'National Stadium',
      referee: 'John Smith',
      status: 'LIVE',
      homeScore: 2,
      awayScore: 1,
      matchStage: 'Matchday 5'
    },
    {
      tournamentId: 1,
      homeTeamId: 3,
      awayTeamId: 4,
      matchDate: new Date('2023-06-18T16:00:00Z'),
      venue: 'City Arena',
      referee: 'Mike Johnson',
      status: 'SCHEDULED',
      homeScore: 0,
      awayScore: 0,
      matchStage: 'Matchday 6'
    },
    {
      tournamentId: 1,
      homeTeamId: 2,
      awayTeamId: 3,
      matchDate: new Date('2023-06-12T14:00:00Z'),
      venue: 'Community Ground',
      referee: 'David Wilson',
      status: 'COMPLETED',
      homeScore: 1,
      awayScore: 1,
      matchStage: 'Matchday 4'
    }
  ];

  for (const matchData of matches) {
    await prisma.match.upsert({
      where: { id: matches.indexOf(matchData) + 1 },
      update: {},
      create: matchData
    });
  }

  console.log('✅ Matches created');

  // Create match events for the live match
  const liveMatchEvents = [
    {
      matchId: 1,
      playerId: 2, // David Johnson (United SC)
      teamId: 2,
      eventType: 'GOAL',
      minute: 12,
      description: 'Beautiful finish from outside the box'
    },
    {
      matchId: 1,
      playerId: 4, // Michael Brown (City FC)
      teamId: 1,
      eventType: 'YELLOW_CARD',
      minute: 28,
      description: 'Tactical foul'
    },
    {
      matchId: 1,
      playerId: 2, // James Wilson (City FC)
      teamId: 1,
      eventType: 'GOAL',
      minute: 52,
      description: 'Equalizer from close range'
    },
    {
      matchId: 1,
      playerId: 3, // Samuel Parker (City FC)
      teamId: 1,
      eventType: 'GOAL',
      minute: 64,
      description: 'Takes the lead with a brilliant strike'
    }
  ];

  for (const eventData of liveMatchEvents) {
    await prisma.matchEvent.create({
      data: eventData
    });
  }

  console.log('✅ Match events created');

  // Create live match data
  await prisma.liveMatchData.upsert({
    where: { matchId: 1 },
    update: {},
    create: {
      matchId: 1,
      currentMinute: 65,
      additionalTime: 0,
      possessionHome: 58,
      possessionAway: 42,
      shotsHome: 8,
      shotsAway: 3,
      cornersHome: 4,
      cornersAway: 2,
      foulsHome: 7,
      foulsAway: 12
    }
  });

  console.log('✅ Live match data created');

  // Create player statistics
  const playerStats = [
    { playerId: 1, tournamentId: 1, matchesPlayed: 5, goals: 12, assists: 7, yellowCards: 4, minutesPlayed: 450 },
    { playerId: 2, tournamentId: 1, matchesPlayed: 4, goals: 8, assists: 3, yellowCards: 2, minutesPlayed: 360 },
    { playerId: 6, tournamentId: 1, matchesPlayed: 5, goals: 5, assists: 8, yellowCards: 3, minutesPlayed: 450 },
    { playerId: 11, tournamentId: 1, matchesPlayed: 4, goals: 6, assists: 2, yellowCards: 1, minutesPlayed: 320 }
  ];

  for (const statData of playerStats) {
    await prisma.playerStatistic.upsert({
      where: {
        playerId_tournamentId: {
          playerId: statData.playerId,
          tournamentId: statData.tournamentId
        }
      },
      update: {},
      create: {
        ...statData,
        redCards: 0,
        shotsOnTarget: Math.floor(statData.goals * 1.5),
        passesCompleted: Math.floor(statData.minutesPlayed * 0.8),
        tacklesWon: Math.floor(Math.random() * 20) + 5
      }
    });
  }

  console.log('✅ Player statistics created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📝 Demo Accounts:');
  console.log('Admin: admin@fuma.com / admin123');
  console.log('Manager: manager@fuma.com / demo123');
  console.log('Viewer: viewer@fuma.com / demo123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });