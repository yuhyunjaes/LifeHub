<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Notepad;

class NotepadController extends Controller
{
    public function store(Request $request) {
        $notepad = Notepad::create([
            'user_id'=>$request->user_id,
            'content'=>null,
            'category'=>null,
        ]);

        return response()->json(['success'=>true, 'id'=>$notepad->id]);
    }

    public function show(Request $request) {
        $notepads = Notepad::where('user_id', $request->id)->get();
        return response()->json(['success'=>true, 'notepads'=>$notepads]);
    }

    public function update(Request $request) {
        $notepad = Notepad::findOrFail($request->noteId);
        $notepad->update([
            'content' => $request->text
        ]);

        return response()->json(['success' => true]);
    }

    public function delete(Request $request) {
        $notepad = Notepad::findOrFail($request->noteId);
        $notepad->delete();
        return response()->json(['success' => true]);
    }

}
