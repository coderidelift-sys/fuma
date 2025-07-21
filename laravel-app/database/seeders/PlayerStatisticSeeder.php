<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlayerStatisticSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('player_statistics')->insert([
            [
                'match_id' => 1,
                'player_id' => 1,
                'goals' => 2,
                'assists' => 1,
                'yellow_cards' => 0,
                'red_cards' => 0,
                'minutes_played' => 90,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
