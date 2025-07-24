const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data in proper order (respecting foreign key constraints)
    console.log('🧹 Cleaning existing data...');
    await prisma.liveMatchData.deleteMany();
    await prisma.playerStatistic.deleteMany();
    await prisma.matchEvent.deleteMany();
    await prisma.match.deleteMany();
    await prisma.tournamentTeam.deleteMany();
    await prisma.player.deleteMany();
    await prisma.tournament.deleteMany();
    await prisma.team.deleteMany();
    await prisma.user.deleteMany();

    // Reset auto-increment counters
    await prisma.$executeRaw`ALTER TABLE users AUTO_INCREMENT = 1`;
    await prisma.$executeRaw`ALTER TABLE teams AUTO_INCREMENT = 1`;
    await prisma.$executeRaw`ALTER TABLE players AUTO_INCREMENT = 1`;
    await prisma.$executeRaw`ALTER TABLE tournaments AUTO_INCREMENT = 1`;
    await prisma.$executeRaw`ALTER TABLE tournament_teams AUTO_INCREMENT = 1`;
    await prisma.$executeRaw`ALTER TABLE matches AUTO_INCREMENT = 1`;
    await prisma.$executeRaw`ALTER TABLE match_events AUTO_INCREMENT = 1`;
    await prisma.$executeRaw`ALTER TABLE player_statistics AUTO_INCREMENT = 1`;
    await prisma.$executeRaw`ALTER TABLE live_match_data AUTO_INCREMENT = 1`;

    console.log('✅ Database cleaned');

    // Create users with transaction
    console.log('👥 Creating users...');
    const adminPassword = await bcrypt.hash('admin123', 12);
    const demoPassword = await bcrypt.hash('demo123', 12);

    const users = await prisma.$transaction([
      prisma.user.create({
        data: {
          name: 'FUMA Administrator',
          email: 'admin@fuma.com',
          whatsapp: '+1234567890',
          passwordHash: adminPassword,
          role: 'ADMIN'
        }
      }),
      prisma.user.create({
        data: {
          name: 'Team Manager',
          email: 'manager@fuma.com',
          whatsapp: '+1234567891',
          passwordHash: demoPassword,
          role: 'MANAGER'
        }
      }),
      prisma.user.create({
        data: {
          name: 'Football Fan',
          email: 'viewer@fuma.com',
          whatsapp: '+1234567892',
          passwordHash: demoPassword,
          role: 'VIEWER'
        }
      })
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Create teams with transaction
    console.log('⚽ Creating teams...');
    const teamsData = [
      {
        name: 'Manchester City FC',
        shortName: 'MCI',
        logoUrl: 'https://logos-world.net/wp-content/uploads/2020/06/Manchester-City-Logo.png',
        foundedYear: 1880,
        stadium: 'Etihad Stadium',
        stadiumCapacity: 55000,
        city: 'Manchester',
        country: 'England',
        managerName: 'Pep Guardiola',
        teamColors: 'Sky Blue, White',
        status: 'ACTIVE'
      },
      {
        name: 'Liverpool FC',
        shortName: 'LIV',
        logoUrl: 'https://logos-world.net/wp-content/uploads/2020/06/Liverpool-Logo.png',
        foundedYear: 1892,
        stadium: 'Anfield',
        stadiumCapacity: 54000,
        city: 'Liverpool',
        country: 'England',
        managerName: 'Jürgen Klopp',
        teamColors: 'Red, White',
        status: 'ACTIVE'
      },
      {
        name: 'Chelsea FC',
        shortName: 'CHE',
        logoUrl: 'https://logos-world.net/wp-content/uploads/2020/06/Chelsea-Logo.png',
        foundedYear: 1905,
        stadium: 'Stamford Bridge',
        stadiumCapacity: 40834,
        city: 'London',
        country: 'England',
        managerName: 'Mauricio Pochettino',
        teamColors: 'Blue, White',
        status: 'ACTIVE'
      },
      {
        name: 'Arsenal FC',
        shortName: 'ARS',
        logoUrl: 'https://logos-world.net/wp-content/uploads/2020/06/Arsenal-Logo.png',
        foundedYear: 1886,
        stadium: 'Emirates Stadium',
        stadiumCapacity: 60260,
        city: 'London',
        country: 'England',
        managerName: 'Mikel Arteta',
        teamColors: 'Red, White',
        status: 'ACTIVE'
      }
    ];

    const teams = await prisma.$transaction(
      teamsData.map(teamData => prisma.team.create({ data: teamData }))
    );

    console.log(`✅ Created ${teams.length} teams`);

    // Create tournaments
    console.log('🏆 Creating tournaments...');
    const tournamentsData = [
      {
        name: 'Premier League 2024',
        description: 'The top football league featuring elite teams competing for the championship.',
        startDate: new Date('2024-08-01'),
        endDate: new Date('2024-05-30'),
        tournamentType: 'LEAGUE',
        status: 'ONGOING',
        maxTeams: 20,
        prizeMoney: 100000000
      },
      {
        name: 'FA Cup 2024',
        description: 'Historic knockout tournament open to all English football clubs.',
        startDate: new Date('2024-01-06'),
        endDate: new Date('2024-05-25'),
        tournamentType: 'KNOCKOUT',
        status: 'ONGOING',
        maxTeams: 64,
        prizeMoney: 20000000
      },
      {
        name: 'Champions League 2024',
        description: 'European elite club competition.',
        startDate: new Date('2024-09-17'),
        endDate: new Date('2025-06-01'),
        tournamentType: 'GROUP_KNOCKOUT',
        status: 'UPCOMING',
        maxTeams: 32,
        prizeMoney: 200000000
      }
    ];

    const tournaments = await prisma.$transaction(
      tournamentsData.map(tournamentData => prisma.tournament.create({ data: tournamentData }))
    );

    console.log(`✅ Created ${tournaments.length} tournaments`);

    // Create players with optimized batch processing
    console.log('👨‍⚽ Creating players...');
    const playersData = [
      // Manchester City FC Players
      { teamId: 1, firstName: 'Erling', lastName: 'Haaland', jerseyNumber: 9, position: 'FORWARD', nationality: 'Norway', height: 1.95, weight: 88, preferredFoot: 'LEFT' },
      { teamId: 1, firstName: 'Kevin', lastName: 'De Bruyne', jerseyNumber: 17, position: 'MIDFIELDER', nationality: 'Belgium', height: 1.81, weight: 76, preferredFoot: 'RIGHT' },
      { teamId: 1, firstName: 'Ruben', lastName: 'Dias', jerseyNumber: 3, position: 'DEFENDER', nationality: 'Portugal', height: 1.87, weight: 82, preferredFoot: 'RIGHT' },
      { teamId: 1, firstName: 'Ederson', lastName: 'Moraes', jerseyNumber: 31, position: 'GOALKEEPER', nationality: 'Brazil', height: 1.88, weight: 86, preferredFoot: 'LEFT' },
      { teamId: 1, firstName: 'Phil', lastName: 'Foden', jerseyNumber: 47, position: 'MIDFIELDER', nationality: 'England', height: 1.71, weight: 69, preferredFoot: 'LEFT' },

      // Liverpool FC Players
      { teamId: 2, firstName: 'Mohamed', lastName: 'Salah', jerseyNumber: 11, position: 'FORWARD', nationality: 'Egypt', height: 1.75, weight: 71, preferredFoot: 'LEFT' },
      { teamId: 2, firstName: 'Sadio', lastName: 'Mané', jerseyNumber: 10, position: 'FORWARD', nationality: 'Senegal', height: 1.75, weight: 69, preferredFoot: 'RIGHT' },
      { teamId: 2, firstName: 'Virgil', lastName: 'van Dijk', jerseyNumber: 4, position: 'DEFENDER', nationality: 'Netherlands', height: 1.93, weight: 92, preferredFoot: 'RIGHT' },
      { teamId: 2, firstName: 'Alisson', lastName: 'Becker', jerseyNumber: 1, position: 'GOALKEEPER', nationality: 'Brazil', height: 1.91, weight: 91, preferredFoot: 'RIGHT' },
      { teamId: 2, firstName: 'Jordan', lastName: 'Henderson', jerseyNumber: 14, position: 'MIDFIELDER', nationality: 'England', height: 1.82, weight: 80, preferredFoot: 'RIGHT' },

      // Chelsea FC Players
      { teamId: 3, firstName: 'Thiago', lastName: 'Silva', jerseyNumber: 6, position: 'DEFENDER', nationality: 'Brazil', height: 1.83, weight: 79, preferredFoot: 'RIGHT' },
      { teamId: 3, firstName: 'NGolo', lastName: 'Kanté', jerseyNumber: 7, position: 'MIDFIELDER', nationality: 'France', height: 1.68, weight: 70, preferredFoot: 'RIGHT' },
      { teamId: 3, firstName: 'Timo', lastName: 'Werner', jerseyNumber: 11, position: 'FORWARD', nationality: 'Germany', height: 1.80, weight: 75, preferredFoot: 'RIGHT' },
      { teamId: 3, firstName: 'Kepa', lastName: 'Arrizabalaga', jerseyNumber: 1, position: 'GOALKEEPER', nationality: 'Spain', height: 1.86, weight: 80, preferredFoot: 'RIGHT' },
      { teamId: 3, firstName: 'Mason', lastName: 'Mount', jerseyNumber: 19, position: 'MIDFIELDER', nationality: 'England', height: 1.81, weight: 70, preferredFoot: 'RIGHT' },

      // Arsenal FC Players
      { teamId: 4, firstName: 'Pierre-Emerick', lastName: 'Aubameyang', jerseyNumber: 14, position: 'FORWARD', nationality: 'Gabon', height: 1.87, weight: 80, preferredFoot: 'RIGHT' },
      { teamId: 4, firstName: 'Bukayo', lastName: 'Saka', jerseyNumber: 7, position: 'MIDFIELDER', nationality: 'England', height: 1.78, weight: 70, preferredFoot: 'LEFT' },
      { teamId: 4, firstName: 'Gabriel', lastName: 'Magalhães', jerseyNumber: 6, position: 'DEFENDER', nationality: 'Brazil', height: 1.90, weight: 84, preferredFoot: 'LEFT' },
      { teamId: 4, firstName: 'Aaron', lastName: 'Ramsdale', jerseyNumber: 1, position: 'GOALKEEPER', nationality: 'England', height: 1.88, weight: 82, preferredFoot: 'RIGHT' },
      { teamId: 4, firstName: 'Martin', lastName: 'Ødegaard', jerseyNumber: 8, position: 'MIDFIELDER', nationality: 'Norway', height: 1.78, weight: 68, preferredFoot: 'LEFT' }
    ];

    // Add realistic birth dates and market values
    const playersWithDetails = playersData.map(player => ({
      ...player,
      dateOfBirth: new Date(1990 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      photoUrl: `https://img.a.transfermarkt.technology/portrait/big/default.jpg?lm=1`,
      marketValue: Math.floor(Math.random() * 80000000) + 5000000, // 5M to 85M
      status: 'ACTIVE'
    }));

    // Create players in batches for better performance
    const batchSize = 5;
    const players = [];
    for (let i = 0; i < playersWithDetails.length; i += batchSize) {
      const batch = playersWithDetails.slice(i, i + batchSize);
      const batchResults = await prisma.$transaction(
        batch.map(playerData => prisma.player.create({ data: playerData }))
      );
      players.push(...batchResults);
    }

    console.log(`✅ Created ${players.length} players`);

    // Add teams to tournaments
    console.log('🎯 Adding teams to tournaments...');
    const tournamentTeamsData = [
      // Premier League teams
      { tournamentId: 1, teamId: 1, groupName: null },
      { tournamentId: 1, teamId: 2, groupName: null },
      { tournamentId: 1, teamId: 3, groupName: null },
      { tournamentId: 1, teamId: 4, groupName: null },
      
      // FA Cup teams
      { tournamentId: 2, teamId: 1, groupName: null },
      { tournamentId: 2, teamId: 2, groupName: null },
      { tournamentId: 2, teamId: 3, groupName: null },
      { tournamentId: 2, teamId: 4, groupName: null },
      
      // Champions League teams
      { tournamentId: 3, teamId: 1, groupName: 'A' },
      { tournamentId: 3, teamId: 2, groupName: 'B' }
    ];

    const tournamentTeamsWithStats = tournamentTeamsData.map(tt => ({
      ...tt,
      points: Math.floor(Math.random() * 25) + 5,
      matchesPlayed: Math.floor(Math.random() * 8) + 3,
      wins: Math.floor(Math.random() * 6) + 1,
      draws: Math.floor(Math.random() * 4),
      losses: Math.floor(Math.random() * 3),
      goalsFor: Math.floor(Math.random() * 20) + 8,
      goalsAgainst: Math.floor(Math.random() * 12) + 3
    }));

    const tournamentTeams = await prisma.$transaction(
      tournamentTeamsWithStats.map(ttData => prisma.tournamentTeam.create({ data: ttData }))
    );

    console.log(`✅ Created ${tournamentTeams.length} tournament team entries`);

    // Create matches
    console.log('⚽ Creating matches...');
    const matchesData = [
      {
        tournamentId: 1,
        homeTeamId: 1,
        awayTeamId: 2,
        matchDate: new Date('2024-12-15T15:00:00Z'),
        venue: 'Etihad Stadium',
        referee: 'Michael Oliver',
        status: 'LIVE',
        homeScore: 2,
        awayScore: 1,
        matchStage: 'Matchday 17',
        attendance: 54000,
        weatherConditions: 'Clear, 8°C'
      },
      {
        tournamentId: 1,
        homeTeamId: 3,
        awayTeamId: 4,
        matchDate: new Date('2024-12-18T17:30:00Z'),
        venue: 'Stamford Bridge',
        referee: 'Anthony Taylor',
        status: 'SCHEDULED',
        homeScore: 0,
        awayScore: 0,
        matchStage: 'Matchday 18',
        attendance: null,
        weatherConditions: null
      },
      {
        tournamentId: 1,
        homeTeamId: 2,
        awayTeamId: 3,
        matchDate: new Date('2024-12-12T20:00:00Z'),
        venue: 'Anfield',
        referee: 'Craig Pawson',
        status: 'COMPLETED',
        homeScore: 3,
        awayScore: 1,
        matchStage: 'Matchday 16',
        attendance: 53000,
        weatherConditions: 'Rainy, 6°C'
      },
      {
        tournamentId: 2,
        homeTeamId: 4,
        awayTeamId: 1,
        matchDate: new Date('2024-12-20T15:00:00Z'),
        venue: 'Emirates Stadium',
        referee: 'Simon Hooper',
        status: 'SCHEDULED',
        homeScore: 0,
        awayScore: 0,
        matchStage: 'Quarter Final',
        attendance: null,
        weatherConditions: null
      }
    ];

    const matches = await prisma.$transaction(
      matchesData.map(matchData => prisma.match.create({ data: matchData }))
    );

    console.log(`✅ Created ${matches.length} matches`);

    // Create match events for live and completed matches
    console.log('📝 Creating match events...');
    const matchEventsData = [
      // Events for the live match (Man City vs Liverpool)
      { matchId: 1, playerId: 1, teamId: 1, eventType: 'GOAL', minute: 23, additionalTime: 0, description: 'Haaland scores from close range' },
      { matchId: 1, playerId: 6, teamId: 2, eventType: 'GOAL', minute: 35, additionalTime: 0, description: 'Salah equalizes with a brilliant finish' },
      { matchId: 1, playerId: 2, teamId: 1, eventType: 'YELLOW_CARD', minute: 42, additionalTime: 0, description: 'De Bruyne booked for dissent' },
      { matchId: 1, playerId: 5, teamId: 1, eventType: 'GOAL', minute: 67, additionalTime: 0, description: 'Foden puts City ahead' },
      
      // Events for completed match (Liverpool vs Chelsea)
      { matchId: 3, playerId: 6, teamId: 2, eventType: 'GOAL', minute: 12, additionalTime: 0, description: 'Salah opens the scoring' },
      { matchId: 3, playerId: 13, teamId: 3, eventType: 'GOAL', minute: 28, additionalTime: 0, description: 'Werner equalizes for Chelsea' },
      { matchId: 3, playerId: 7, teamId: 2, eventType: 'GOAL', minute: 55, additionalTime: 0, description: 'Mané restores Liverpool lead' },
      { matchId: 3, playerId: 10, teamId: 2, eventType: 'GOAL', minute: 78, additionalTime: 0, description: 'Henderson seals the victory' },
      { matchId: 3, playerId: 11, teamId: 3, eventType: 'RED_CARD', minute: 85, additionalTime: 0, description: 'Thiago Silva sent off for second yellow' }
    ];

    const matchEvents = await prisma.$transaction(
      matchEventsData.map(eventData => prisma.matchEvent.create({ data: eventData }))
    );

    console.log(`✅ Created ${matchEvents.length} match events`);

    // Create live match data for the live match
    console.log('📊 Creating live match data...');
    await prisma.liveMatchData.create({
      data: {
        matchId: 1,
        currentMinute: 72,
        additionalTime: 0,
        possessionHome: 62,
        possessionAway: 38,
        shotsHome: 12,
        shotsAway: 8,
        cornersHome: 6,
        cornersAway: 3,
        foulsHome: 9,
        foulsAway: 14
      }
    });

    console.log('✅ Live match data created');

    // Create player statistics
    console.log('📈 Creating player statistics...');
    const playerStatsData = [
      // Premier League stats
      { playerId: 1, tournamentId: 1, matchesPlayed: 16, goals: 18, assists: 3, yellowCards: 2, redCards: 0, minutesPlayed: 1440, shotsOnTarget: 27, passesCompleted: 480, tacklesWon: 8 },
      { playerId: 2, tournamentId: 1, matchesPlayed: 15, goals: 6, assists: 12, yellowCards: 4, redCards: 0, minutesPlayed: 1350, shotsOnTarget: 9, passesCompleted: 1215, tacklesWon: 24 },
      { playerId: 6, tournamentId: 1, matchesPlayed: 16, goals: 14, assists: 8, yellowCards: 3, redCards: 0, minutesPlayed: 1440, shotsOnTarget: 21, passesCompleted: 720, tacklesWon: 12 },
      { playerId: 7, tournamentId: 1, matchesPlayed: 14, goals: 9, assists: 5, yellowCards: 2, redCards: 0, minutesPlayed: 1260, shotsOnTarget: 15, passesCompleted: 560, tacklesWon: 18 },
      { playerId: 13, tournamentId: 1, matchesPlayed: 12, goals: 7, assists: 2, yellowCards: 1, redCards: 0, minutesPlayed: 1080, shotsOnTarget: 12, passesCompleted: 360, tacklesWon: 6 },
      { playerId: 16, tournamentId: 1, matchesPlayed: 15, goals: 11, assists: 4, yellowCards: 3, redCards: 0, minutesPlayed: 1350, shotsOnTarget: 18, passesCompleted: 450, tacklesWon: 9 }
    ];

    const playerStats = await prisma.$transaction(
      playerStatsData.map(statData => prisma.playerStatistic.create({ data: statData }))
    );

    console.log(`✅ Created ${playerStats.length} player statistics`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${users.length}`);
    console.log(`⚽ Teams: ${teams.length}`);
    console.log(`👨‍⚽ Players: ${players.length}`);
    console.log(`🏆 Tournaments: ${tournaments.length}`);
    console.log(`🎯 Tournament Teams: ${tournamentTeams.length}`);
    console.log(`⚽ Matches: ${matches.length}`);
    console.log(`📝 Match Events: ${matchEvents.length}`);
    console.log(`📈 Player Statistics: ${playerStats.length}`);
    
    console.log('\n🔐 Demo Accounts:');
    console.log('Admin: admin@fuma.com / admin123');
    console.log('Manager: manager@fuma.com / demo123');
    console.log('Viewer: viewer@fuma.com / demo123');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  });