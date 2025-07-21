<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CommitteeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('committees')->insert([
            [
                'user_id' => 3, // committee
                'tournament_id' => 1,
                'role' => 'panitia lapangan',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
