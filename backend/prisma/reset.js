const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetDatabase() {
  console.log('🔄 Starting database reset...');

  try {
    // Disable foreign key checks temporarily
    await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0`;

    // Drop all data in correct order
    console.log('🗑️ Clearing all data...');
    
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
    console.log('🔢 Resetting auto-increment counters...');
    
    await prisma.$executeRaw`ALTER TABLE users AUTO_INCREMENT = 1`;
    await prisma.$executeRaw`ALTER TABLE teams AUTO_INCREMENT = 1`;
    await prisma.$executeRaw`ALTER TABLE players AUTO_INCREMENT = 1`;
    await prisma.$executeRaw`ALTER TABLE tournaments AUTO_INCREMENT = 1`;
    await prisma.$executeRaw`ALTER TABLE tournament_teams AUTO_INCREMENT = 1`;
    await prisma.$executeRaw`ALTER TABLE matches AUTO_INCREMENT = 1`;
    await prisma.$executeRaw`ALTER TABLE match_events AUTO_INCREMENT = 1`;
    await prisma.$executeRaw`ALTER TABLE player_statistics AUTO_INCREMENT = 1`;
    await prisma.$executeRaw`ALTER TABLE live_match_data AUTO_INCREMENT = 1`;

    // Re-enable foreign key checks
    await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1`;

    console.log('✅ Database reset completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during database reset:', error);
    throw error;
  }
}

async function main() {
  await resetDatabase();
}

main()
  .catch((e) => {
    console.error('❌ Reset failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  });