<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Tournament;

class TournamentController extends Controller
{
    public function index()
    {
        return Tournament::all();
    }
    public function show($id)
    {
        return Tournament::findOrFail($id);
    }
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required',
            'description' => 'nullable',
            'logo_url' => 'nullable',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'status' => 'required',
            'type' => 'required',
            'created_by' => 'required|exists:users,id',
        ]);
        $tournament = Tournament::create($data);
        return response()->json($tournament, 201);
    }
    public function update(Request $request, $id)
    {
        $tournament = Tournament::findOrFail($id);
        $data = $request->validate([
            'name' => 'required',
            'description' => 'nullable',
            'logo_url' => 'nullable',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'status' => 'required',
            'type' => 'required',
            'created_by' => 'required|exists:users,id',
        ]);
        $tournament->update($data);
        return response()->json($tournament);
    }
    public function destroy($id)
    {
        $tournament = Tournament::findOrFail($id);
        $tournament->delete();
        return response()->json(null, 204);
    }
}
