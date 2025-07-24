-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `whatsapp` VARCHAR(20) NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('ADMIN', 'MANAGER', 'VIEWER') NOT NULL DEFAULT 'VIEWER',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teams` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `short_name` VARCHAR(10) NOT NULL,
    `logo_url` VARCHAR(255) NULL,
    `founded_year` INTEGER NULL,
    `stadium` VARCHAR(100) NULL,
    `stadium_capacity` INTEGER NULL,
    `city` VARCHAR(100) NULL,
    `country` VARCHAR(100) NULL,
    `manager_name` VARCHAR(100) NULL,
    `team_colors` VARCHAR(100) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `players` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `team_id` INTEGER NULL,
    `first_name` VARCHAR(50) NOT NULL,
    `last_name` VARCHAR(50) NOT NULL,
    `jersey_number` INTEGER NULL,
    `position` ENUM('GOALKEEPER', 'DEFENDER', 'MIDFIELDER', 'FORWARD') NOT NULL,
    `date_of_birth` DATE NULL,
    `nationality` VARCHAR(50) NULL,
    `height` DECIMAL(3, 2) NULL,
    `weight` DECIMAL(5, 2) NULL,
    `preferred_foot` ENUM('LEFT', 'RIGHT', 'BOTH') NULL,
    `photo_url` VARCHAR(255) NULL,
    `market_value` DECIMAL(12, 2) NULL,
    `status` ENUM('ACTIVE', 'INJURED', 'SUSPENDED', 'TRANSFERRED') NOT NULL DEFAULT 'ACTIVE',

    UNIQUE INDEX `players_team_id_jersey_number_key`(`team_id`, `jersey_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tournaments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `tournament_type` ENUM('LEAGUE', 'KNOCKOUT', 'GROUP_KNOCKOUT') NOT NULL,
    `status` ENUM('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'UPCOMING',
    `max_teams` INTEGER NULL,
    `prize_money` DECIMAL(12, 2) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tournament_teams` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tournament_id` INTEGER NOT NULL,
    `team_id` INTEGER NOT NULL,
    `group_name` VARCHAR(10) NULL,
    `points` INTEGER NOT NULL DEFAULT 0,
    `matches_played` INTEGER NOT NULL DEFAULT 0,
    `wins` INTEGER NOT NULL DEFAULT 0,
    `draws` INTEGER NOT NULL DEFAULT 0,
    `losses` INTEGER NOT NULL DEFAULT 0,
    `goals_for` INTEGER NOT NULL DEFAULT 0,
    `goals_against` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `tournament_teams_tournament_id_team_id_key`(`tournament_id`, `team_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `matches` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tournament_id` INTEGER NOT NULL,
    `home_team_id` INTEGER NOT NULL,
    `away_team_id` INTEGER NOT NULL,
    `match_date` DATETIME(3) NOT NULL,
    `venue` VARCHAR(100) NULL,
    `referee` VARCHAR(100) NULL,
    `status` ENUM('SCHEDULED', 'LIVE', 'HALFTIME', 'COMPLETED', 'POSTPONED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    `home_score` INTEGER NOT NULL DEFAULT 0,
    `away_score` INTEGER NOT NULL DEFAULT 0,
    `match_stage` VARCHAR(50) NULL,
    `attendance` INTEGER NULL,
    `weather_conditions` VARCHAR(100) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `match_events` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `match_id` INTEGER NOT NULL,
    `player_id` INTEGER NULL,
    `team_id` INTEGER NOT NULL,
    `event_type` ENUM('GOAL', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION_IN', 'SUBSTITUTION_OUT') NOT NULL,
    `minute` INTEGER NOT NULL,
    `additional_time` INTEGER NOT NULL DEFAULT 0,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `player_statistics` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `player_id` INTEGER NOT NULL,
    `tournament_id` INTEGER NOT NULL,
    `matches_played` INTEGER NOT NULL DEFAULT 0,
    `goals` INTEGER NOT NULL DEFAULT 0,
    `assists` INTEGER NOT NULL DEFAULT 0,
    `yellow_cards` INTEGER NOT NULL DEFAULT 0,
    `red_cards` INTEGER NOT NULL DEFAULT 0,
    `minutes_played` INTEGER NOT NULL DEFAULT 0,
    `shots_on_target` INTEGER NOT NULL DEFAULT 0,
    `passes_completed` INTEGER NOT NULL DEFAULT 0,
    `tackles_won` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `player_statistics_player_id_tournament_id_key`(`player_id`, `tournament_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `live_match_data` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `match_id` INTEGER NOT NULL,
    `current_minute` INTEGER NOT NULL,
    `additional_time` INTEGER NOT NULL DEFAULT 0,
    `possession_home` INTEGER NOT NULL DEFAULT 50,
    `possession_away` INTEGER NOT NULL DEFAULT 50,
    `shots_home` INTEGER NOT NULL DEFAULT 0,
    `shots_away` INTEGER NOT NULL DEFAULT 0,
    `corners_home` INTEGER NOT NULL DEFAULT 0,
    `corners_away` INTEGER NOT NULL DEFAULT 0,
    `fouls_home` INTEGER NOT NULL DEFAULT 0,
    `fouls_away` INTEGER NOT NULL DEFAULT 0,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `live_match_data_match_id_key`(`match_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `players` ADD CONSTRAINT `players_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_teams` ADD CONSTRAINT `tournament_teams_tournament_id_fkey` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tournament_teams` ADD CONSTRAINT `tournament_teams_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matches` ADD CONSTRAINT `matches_tournament_id_fkey` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matches` ADD CONSTRAINT `matches_home_team_id_fkey` FOREIGN KEY (`home_team_id`) REFERENCES `teams`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matches` ADD CONSTRAINT `matches_away_team_id_fkey` FOREIGN KEY (`away_team_id`) REFERENCES `teams`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_events` ADD CONSTRAINT `match_events_match_id_fkey` FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_events` ADD CONSTRAINT `match_events_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `match_events` ADD CONSTRAINT `match_events_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `player_statistics` ADD CONSTRAINT `player_statistics_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `player_statistics` ADD CONSTRAINT `player_statistics_tournament_id_fkey` FOREIGN KEY (`tournament_id`) REFERENCES `tournaments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `live_match_data` ADD CONSTRAINT `live_match_data_match_id_fkey` FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
