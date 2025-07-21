<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tournament;
use Inertia\Inertia;

class TournamentController extends Controller
{
    public function index()
    {
        $tournaments = Tournament::all();
        return Inertia::render('Admin/Tournaments/Index', [
            'tournaments' => $tournaments
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Tournaments/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'logo_url' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'status' => 'required|in:upcoming,ongoing,completed',
            'type' => 'required|in:league,cup,friendly',
        ]);
        $validated['created_by'] = auth()->id();
        \App\Models\Tournament::create($validated);
        return redirect()->route('admin.tournaments.index')->with('success', 'Turnamen berhasil ditambahkan.');
    }

    public function edit($id)
    {
        $tournament = \App\Models\Tournament::findOrFail($id);
        return Inertia::render('Admin/Tournaments/Edit', [
            'tournament' => $tournament
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'logo_url' => 'nullable|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'status' => 'required|in:upcoming,ongoing,completed',
            'type' => 'required|in:league,cup,friendly',
        ]);
        $tournament = \App\Models\Tournament::findOrFail($id);
        $tournament->update($validated);
        return redirect()->route('admin.tournaments.index')->with('success', 'Turnamen berhasil diupdate.');
    }

    public function destroy($id)
    {
        $tournament = \App\Models\Tournament::findOrFail($id);
        $tournament->delete();
        return redirect()->route('admin.tournaments.index')->with('success', 'Turnamen berhasil dihapus.');
    }
}
