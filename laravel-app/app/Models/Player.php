<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Player extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name', 'last_name', 'full_name', 'date_of_birth', 'place_of_birth', 'nationality', 'height', 'weight', 'preferred_foot', 'jersey_number', 'position', 'status', 'market_value', 'bio', 'photo_url', 'team_id'
    ];

    public function team()
    {
        return $this->belongsTo(Team::class);
    }
}
