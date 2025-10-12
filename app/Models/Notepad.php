<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Notepad extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'content',
        'category'
    ];
}
