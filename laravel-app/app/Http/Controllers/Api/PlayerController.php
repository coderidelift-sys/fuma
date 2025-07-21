<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Player;

class PlayerController extends Controller
{
    public function index()
    {
        return Player::all();
    }
    public function show($id)
    {
        return Player::findOrFail($id);
    }
    public function store(Request $request)
    {
        $data = $request->validate([
            'first_name' => 'required',
            'last_name' => 'nullable',
            'full_name' => 'required',
            'date_of_birth' => 'required|date',
            'place_of_birth' => 'nullable',
            'nationality' => 'nullable',
            'height' => 'nullable|numeric',
            'weight' => 'nullable|numeric',
            'preferred_foot' => 'nullable',
            'jersey_number' => 'nullable|integer',
            'position' => 'nullable',
            'status' => 'required',
            'market_value' => 'nullable',
            'bio' => 'nullable',
            'photo_url' => 'nullable',
            'team_id' => 'required|exists:teams,id',
        ]);
        $player = Player::create($data);
        return response()->json($player, 201);
    }
    public function update(Request $request, $id)
    {
        $player = Player::findOrFail($id);
        $data = $request->validate([
            'first_name' => 'required',
            'last_name' => 'nullable',
            'full_name' => 'required',
            'date_of_birth' => 'required|date',
            'place_of_birth' => 'nullable',
            'nationality' => 'nullable',
            'height' => 'nullable|numeric',
            'weight' => 'nullable|numeric',
            'preferred_foot' => 'nullable',
            'jersey_number' => 'nullable|integer',
            'position' => 'nullable',
            'status' => 'required',
            'market_value' => 'nullable',
            'bio' => 'nullable',
            'photo_url' => 'nullable',
            'team_id' => 'required|exists:teams,id',
        ]);
        $player->update($data);
        return response()->json($player);
    }
    public function destroy($id)
    {
        $player = Player::findOrFail($id);
        $player->delete();
        return response()->json(null, 204);
    }
}
