<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tournament extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'description', 'logo_url', 'start_date', 'end_date', 'status', 'type', 'created_by'
    ];
}
