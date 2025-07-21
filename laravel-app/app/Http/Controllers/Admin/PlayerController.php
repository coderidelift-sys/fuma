<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Player;
use App\Models\Team;
use Inertia\Inertia;
use Illuminate\Http\Request;

class PlayerController extends Controller
{
    public function index()
    {
        $players = Player::with('team')->get();
        return Inertia::render('Admin/Players/Index', [
            'players' => $players
        ]);
    }

    public function create()
    {
        $teams = Team::all();
        return Inertia::render('Admin/Players/Create', [
            'teams' => $teams
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string',
            'full_name' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'place_of_birth' => 'nullable|string',
            'nationality' => 'nullable|string',
            'height' => 'nullable|numeric',
            'weight' => 'nullable|numeric',
            'preferred_foot' => 'nullable|in:left,right,both',
            'jersey_number' => 'nullable|integer',
            'position' => 'nullable|in:GK,DF,MF,FW',
            'status' => 'required|in:active,injured,suspended,inactive',
            'market_value' => 'nullable|string',
            'bio' => 'nullable|string',
            'photo_url' => 'nullable|string',
            'team_id' => 'required|exists:teams,id',
        ]);
        Player::create($validated);
        return redirect()->route('admin.players.index')->with('success', 'Pemain berhasil ditambahkan.');
    }

    public function edit($id)
    {
        $player = Player::findOrFail($id);
        $teams = Team::all();
        return Inertia::render('Admin/Players/Edit', [
            'player' => $player,
            'teams' => $teams
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string',
            'full_name' => 'required|string|max:255',
            'date_of_birth' => 'required|date',
            'place_of_birth' => 'nullable|string',
            'nationality' => 'nullable|string',
            'height' => 'nullable|numeric',
            'weight' => 'nullable|numeric',
            'preferred_foot' => 'nullable|in:left,right,both',
            'jersey_number' => 'nullable|integer',
            'position' => 'nullable|in:GK,DF,MF,FW',
            'status' => 'required|in:active,injured,suspended,inactive',
            'market_value' => 'nullable|string',
            'bio' => 'nullable|string',
            'photo_url' => 'nullable|string',
            'team_id' => 'required|exists:teams,id',
        ]);
        $player = Player::findOrFail($id);
        $player->update($validated);
        return redirect()->route('admin.players.index')->with('success', 'Pemain berhasil diupdate.');
    }

    public function destroy($id)
    {
        $player = Player::findOrFail($id);
        $player->delete();
        return redirect()->route('admin.players.index')->with('success', 'Pemain berhasil dihapus.');
    }
}
