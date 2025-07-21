<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('users')->insert([
            [
                'full_name' => 'Super Admin',
                'email' => 'admin@fuma.com',
                'whatsapp_number' => '081234567890',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'full_name' => 'Organizer One',
                'email' => 'organizer@fuma.com',
                'whatsapp_number' => '081234567891',
                'password' => Hash::make('password'),
                'role' => 'organizer',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'full_name' => 'Committee One',
                'email' => 'committee@fuma.com',
                'whatsapp_number' => '081234567892',
                'password' => Hash::make('password'),
                'role' => 'committee',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'full_name' => 'Coach One',
                'email' => 'coach@fuma.com',
                'whatsapp_number' => '081234567893',
                'password' => Hash::make('password'),
                'role' => 'coach',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'full_name' => 'Manager One',
                'email' => 'manager@fuma.com',
                'whatsapp_number' => '081234567894',
                'password' => Hash::make('password'),
                'role' => 'manager',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'full_name' => 'Player One',
                'email' => 'player@fuma.com',
                'whatsapp_number' => '081234567895',
                'password' => Hash::make('password'),
                'role' => 'player',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
