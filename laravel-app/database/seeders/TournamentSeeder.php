<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TournamentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('tournaments')->insert([
            [
                'name' => 'FUMA League 2025',
                'description' => 'Turnamen liga sepak bola junior tingkat nasional.',
                'logo_url' => null,
                'start_date' => '2025-08-01',
                'end_date' => '2025-10-01',
                'status' => 'upcoming',
                'type' => 'league',
                'created_by' => 1, // admin
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'FUMA Cup 2025',
                'description' => 'Piala sepak bola SSB se-Indonesia.',
                'logo_url' => null,
                'start_date' => '2025-11-01',
                'end_date' => '2025-12-01',
                'status' => 'upcoming',
                'type' => 'cup',
                'created_by' => 2, // organizer
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
