<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TeamSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('teams')->insert([
            [
                'name' => 'SSB Garuda Muda',
                'short_name' => 'Garuda',
                'nickname' => 'The Young Eagles',
                'founded_year' => 2010,
                'stadium' => 'Garuda Arena',
                'capacity' => 5000,
                'city' => 'Jakarta',
                'country' => 'Indonesia',
                'logo_url' => null,
                'manager' => 'Manager One',
                'coach_id' => 4, // user coach
                'tournament_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'SSB Macan Putih',
                'short_name' => 'Macan',
                'nickname' => 'The White Tigers',
                'founded_year' => 2012,
                'stadium' => 'Macan Stadium',
                'capacity' => 4000,
                'city' => 'Surabaya',
                'country' => 'Indonesia',
                'logo_url' => null,
                'manager' => 'Manager One',
                'coach_id' => 4, // user coach
                'tournament_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
