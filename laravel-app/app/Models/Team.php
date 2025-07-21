<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'short_name', 'nickname', 'founded_year', 'stadium', 'capacity', 'city', 'country', 'logo_url', 'manager', 'coach_id', 'tournament_id'
    ];

    public function tournament()
    {
        return $this->belongsTo(Tournament::class);
    }
    public function coach()
    {
        return $this->belongsTo(User::class, 'coach_id');
    }
}
