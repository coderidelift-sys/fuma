<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PlayerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('players')->insert([
            [
                'first_name' => 'Budi',
                'last_name' => 'Santoso',
                'full_name' => 'Budi Santoso',
                'date_of_birth' => '2010-05-10',
                'place_of_birth' => 'Jakarta',
                'nationality' => 'Indonesia',
                'height' => 165,
                'weight' => 55,
                'preferred_foot' => 'right',
                'jersey_number' => 10,
                'position' => 'FW',
                'status' => 'active',
                'market_value' => '10jt',
                'bio' => 'Striker muda berbakat.',
                'photo_url' => null,
                'team_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'first_name' => 'Andi',
                'last_name' => 'Wijaya',
                'full_name' => 'Andi Wijaya',
                'date_of_birth' => '2011-07-15',
                'place_of_birth' => 'Surabaya',
                'nationality' => 'Indonesia',
                'height' => 160,
                'weight' => 50,
                'preferred_foot' => 'left',
                'jersey_number' => 7,
                'position' => 'MF',
                'status' => 'active',
                'market_value' => '8jt',
                'bio' => 'Gelandang kreatif.',
                'photo_url' => null,
                'team_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
