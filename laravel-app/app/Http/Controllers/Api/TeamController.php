<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Team;

class TeamController extends Controller
{
    public function index()
    {
        return Team::all();
    }
    public function show($id)
    {
        return Team::findOrFail($id);
    }
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required',
            'short_name' => 'nullable',
            'nickname' => 'nullable',
            'founded_year' => 'nullable|integer',
            'stadium' => 'nullable',
            'capacity' => 'nullable|integer',
            'city' => 'nullable',
            'country' => 'nullable',
            'logo_url' => 'nullable',
            'manager' => 'nullable',
            'coach_id' => 'nullable|exists:users,id',
            'tournament_id' => 'required|exists:tournaments,id',
        ]);
        $team = Team::create($data);
        return response()->json($team, 201);
    }
    public function update(Request $request, $id)
    {
        $team = Team::findOrFail($id);
        $data = $request->validate([
            'name' => 'required',
            'short_name' => 'nullable',
            'nickname' => 'nullable',
            'founded_year' => 'nullable|integer',
            'stadium' => 'nullable',
            'capacity' => 'nullable|integer',
            'city' => 'nullable',
            'country' => 'nullable',
            'logo_url' => 'nullable',
            'manager' => 'nullable',
            'coach_id' => 'nullable|exists:users,id',
            'tournament_id' => 'required|exists:tournaments,id',
        ]);
        $team->update($data);
        return response()->json($team);
    }
    public function destroy($id)
    {
        $team = Team::findOrFail($id);
        $team->delete();
        return response()->json(null, 204);
    }
}
