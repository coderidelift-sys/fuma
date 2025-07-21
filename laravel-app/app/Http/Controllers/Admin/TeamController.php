<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    public function index()
    {
        $teams = Team::with(['tournament', 'coach'])->get();
        return Inertia::render('Admin/Teams/Index', [
            'teams' => $teams
        ]);
    }

    public function create()
    {
        $tournaments = Tournament::all();
        $coaches = User::where('role', 'coach')->get();
        return Inertia::render('Admin/Teams/Create', [
            'tournaments' => $tournaments,
            'coaches' => $coaches
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'short_name' => 'nullable|string',
            'nickname' => 'nullable|string',
            'founded_year' => 'nullable|integer',
            'stadium' => 'nullable|string',
            'capacity' => 'nullable|integer',
            'city' => 'nullable|string',
            'country' => 'nullable|string',
            'logo_url' => 'nullable|string',
            'manager' => 'nullable|string',
            'coach_id' => 'nullable|exists:users,id',
            'tournament_id' => 'required|exists:tournaments,id',
        ]);
        Team::create($validated);
        return redirect()->route('admin.teams.index')->with('success', 'Tim berhasil ditambahkan.');
    }

    public function edit($id)
    {
        $team = Team::findOrFail($id);
        $tournaments = Tournament::all();
        $coaches = User::where('role', 'coach')->get();
        return Inertia::render('Admin/Teams/Edit', [
            'team' => $team,
            'tournaments' => $tournaments,
            'coaches' => $coaches
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'short_name' => 'nullable|string',
            'nickname' => 'nullable|string',
            'founded_year' => 'nullable|integer',
            'stadium' => 'nullable|string',
            'capacity' => 'nullable|integer',
            'city' => 'nullable|string',
            'country' => 'nullable|string',
            'logo_url' => 'nullable|string',
            'manager' => 'nullable|string',
            'coach_id' => 'nullable|exists:users,id',
            'tournament_id' => 'required|exists:tournaments,id',
        ]);
        $team = Team::findOrFail($id);
        $team->update($validated);
        return redirect()->route('admin.teams.index')->with('success', 'Tim berhasil diupdate.');
    }

    public function destroy($id)
    {
        $team = Team::findOrFail($id);
        $team->delete();
        return redirect()->route('admin.teams.index')->with('success', 'Tim berhasil dihapus.');
    }
}
