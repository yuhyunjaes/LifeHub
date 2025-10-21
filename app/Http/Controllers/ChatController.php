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

    public function GetRooms($id) {
        $rooms = ChatRoom::where('user_id', $id)
            ->orderByDesc('updated_at')
            ->get(['uuid as room_id', 'title']);

        return response()->json([
            'success' => true,
            'rooms' => $rooms
        ]);
    }

    public function DeleteRooms($roomId) {
        $room = ChatRoom::where('uuid', $roomId)->first()->delete();

        if(!$room) return response()->json(['success'=>false, 'message'=>'채팅방이 존재하지 않습니다.']);

        return response()->json(['success'=>true, 'message'=>'채팅방이 삭제되었습니다.']);
    }

    public function UpdateRooms(Request $request, $roomId) {
        $room = ChatRoom::where('uuid', $roomId)->first()->update([
            'title'=>$request->title
        ]);

        if(!$room) return response()->json(['success'=>false, 'message'=>'체팅방 제목 수정중 오류가 발생했습니다.']);

        return response()->json(['success'=>true, 'message'=>'체팅방 제목이 수정되었습니다.']);
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
        $room = ChatRoom::where('uuid', $roomId)
            ->where('user_id', auth('web')->id())
            ->first();
        if(!$room) return response()->json([
            'success'=>false,
            'message'=>'채팅방이 존재하지 않습니다.'
        ]);

        $messages = $room->chatmessages()
            ->get(['id', 'role', 'text']);

        return response()->json(['success'=>true, 'messages'=>$messages]);
    }
}
