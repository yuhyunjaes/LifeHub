<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\ChatRoom;

class ChatMessage extends Model
{
    use HasFactory;

    public function chatroom() {
        return $this->belongsTo(ChatRoom::class, 'room_id', 'uuid');
    }

    protected $fillable = [
        'room_id',
        'role',
        'text'
    ];
}
