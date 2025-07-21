<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MatchSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('matches')->insert([
            [
                'tournament_id' => 1,
                'team1_id' => 1,
                'team2_id' => 2,
                'match_date' => '2025-08-10 15:00:00',
                'location' => 'Garuda Arena',
                'status' => 'scheduled',
                'score_team1' => null,
                'score_team2' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
