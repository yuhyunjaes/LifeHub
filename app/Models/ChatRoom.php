<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\ChatMessage;
use App\Models\User;

class ChatRoom extends Model
{
    use HasFactory;

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function chatmessages() {
        return $this->hasMany(ChatMessage::class);
    }

    protected $fillable = [
        'user_id',
        'title',
        'model_name'
    ];
}
