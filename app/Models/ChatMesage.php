<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\ChatRoom;

class ChatMesage extends Model
{
    use HasFactory;

    public function chatroom() {
        return $this->belongsTo(ChatRoom::class);
    }

    protected $fillable = [
        'room_id',
        'role',
        'text'
    ];
}
