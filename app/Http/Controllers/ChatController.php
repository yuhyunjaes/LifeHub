<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ChatRoom;

class ChatController extends Controller
{
    public function StoreRooms(Request $request) {

        $room = ChatRoom::create([
            'user_id' => $request->user_id,
            'title' => $request->title,
            'model_name' => $request->model_name
        ]);

        return response()->json(['success'=>true, 'room_id'=>$room->id, 'title'=>$room->title]);
    }
}
