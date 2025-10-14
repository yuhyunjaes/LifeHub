<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Notepad;

class NotepadController extends Controller
{
    public function StoreNotepads(Request $request) {
        $notepad = Notepad::create([
            'user_id'=>$request->user_id,
            'title'=>$request->note_title,
            'content'=>null,
            'category'=>null,
        ]);

        return response()->json(['success'=>true, 'id'=>$notepad->id, 'created_at'=>$notepad->created_at->format('Y-m-d H:i:s')]);
    }

    public function GetNotepads($id)
    {
        $notepads = Notepad::where('user_id', $id)
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($n) {
                return [
                    'id' => $n->id,
                    'title' => $n->title,
                    'content' => $n->content,
                    'created_at' => $n->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return response()->json(['success' => true, 'notepads' => $notepads]);
    }


    public function UpdateNotepads(Request $request)
    {
        $notepad = Notepad::findOrFail($request->noteId);

        if (!empty($request->text)) {
            $notepad->update([
                'content' => $request->text
            ]);
        } else if (!empty($request->title)) {
            $notepad->update([
                'title' => $request->title
            ]);
        }

        return response()->json(['success' => true]);
    }


    public function DeleteNotepads(Request $request) {
        $notepad = Notepad::findOrFail($request->noteId);
        $notepad->delete();
        return response()->json(['success' => true]);
    }

}
