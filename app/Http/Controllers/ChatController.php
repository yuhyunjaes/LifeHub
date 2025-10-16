<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ChatRoom;
use App\Models\ChatMessage;
use Illuminate\Support\Str;

class ChatController extends Controller
{
    public function StoreRooms(Request $request) {

        $room = ChatRoom::create([
            'user_id' => $request->user_id,
            'uuid' => Str::uuid()->toString(),
            'title' => $request->title,
            'model_name' => $request->model_name
        ]);

        return response()->json(['success'=>true, 'room_id'=>$room->uuid, 'title'=>$room->title]);
    }

    public function getRooms($id) {
        $rooms = ChatRoom::where('uuid', $id)
        ->orderByDesc('updated_at')
        ->get(['uuid as room_id', 'title']);

        return response()->json([
            'success' => true,
            'rooms' => $rooms
        ]);
    }

    public function StoreMessages(Request $request) {
        $user_message = ChatMessage::create([
            'room_id' => $request->room_id,
            'role' => 'user',
            'text' => $request->user_message
        ]);

        $ai_message = ChatMessage::create([
            'room_id' => $request->room_id,
            'role' => 'model',
            'text' => $request->ai_message
        ]);

        return response()->json([
            'success'=>true,
            'user_id'=>$user_message->id,
            'ai_id'=>$ai_message->id
        ]);

    }

    public function getMessages($roomId) {
        $room = ChatRoom::where('uuid', $roomId)->first();
        $messages = $room->chatmessages()
            ->get(['id', 'role', 'text']);

        return response()->json(['success'=>true, 'messages'=>$messages]);
    }
}
