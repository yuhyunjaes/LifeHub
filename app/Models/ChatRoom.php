<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\ChatMesage;
use App\Models\User;

class ChatRoom extends Model
{
    use HasFactory;

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function chatmesages() {
        return $this->hasMany(ChatMesage::class);
    }

    protected $fillable = [
        'user_id',
        'title',
        'model_name'
    ];
}
