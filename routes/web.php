<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\IndexController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\NotepadController;
use App\Http\Controllers\ChatController;
use Illuminate\Support\Facades\Log;

Route::post('/gemini/title', function (Request $request) {
    $apiKey = env('GEMINI_API_KEY');
    $model = $request->input('model_name', 'models/gemini-2.5-flash');
    $prompt = $request->input('prompt', '테스트');

    Log::info('Gemini 요청 시작', compact('model', 'prompt'));

    $url = "https://generativelanguage.googleapis.com/v1beta/{$model}:generateContent?key={$apiKey}";

    try {
        $response = Http::withHeaders(['Content-Type' => 'application/json'])
            ->timeout(30)
            ->post($url, [
                'contents' => [['parts' => [['text' => $prompt]]]],
                'generationConfig' => [
                    'temperature' => 0.7,
                    'maxOutputTokens' => 1000,
                ],
            ]);

        Log::info('Gemini 응답', [
            'status' => $response->status(),
            'body' => $response->body(),
        ]);

        if ($response->failed()) {
            return response()->json([
                'error' => 'Gemini 요청 실패',
                'details' => $response->json(),
            ], 500);
        }

        return $response->json();
    } catch (\Throwable $e) {
        Log::error('Gemini 내부 오류', ['msg' => $e->getMessage()]);
        return response()->json(['error' => $e->getMessage()], 500);
    }
});





Route::middleware('guest')->group(function () {
    Route::get('/login', [IndexController::class, 'login'])->name('login.page');
    Route::get('/register', [IndexController::class, 'register'])->name('register.page');
    Route::get('/check-id/{id}', [AuthController::class, 'checkId'])->name('checkId');

    Route::post('/send-email-code', [AuthController::class, 'sendEmail'])->name('sendEmail');
    Route::post('/check-email-code', [AuthController::class, 'checkEmail'])->name('checkEmail');

    Route::post('/register', [AuthController::class, 'register'])->name('register.submit');
    Route::post('/login', [AuthController::class, 'login'])->name('login.submit');
});

Route::get('/csrf-token', function () {
    return csrf_token();
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::post('/api/notepads', [NotepadController::class, 'StoreNotepads'])->name('notepads.store');
    Route::get('/api/notepads/{id}', [NotepadController::class, 'GetNotepads'])->name('notepads.get');
    Route::put('/api/notepads/{noteId}', [NotepadController::class, 'UpdateNotepads'])->name('notepads.update');
    Route::delete('/api/notepads/{noteId}', [NotepadController::class, 'DeleteNotepads'])->name('notepads.delete');

    Route::post('/api/rooms', [ChatController::class, 'StoreRooms'])->name('rooms.store');
    Route::get('/api/rooms/{id}', [ChatController::class, 'getRooms'])->name('rooms.get');

    Route::post('/api/messages', [ChatController::class, 'StoreMessages'])->name('messages.store');
    Route::get('/api/messages/{roomId}', [ChatController::class, 'getMessages'])->name('messages.get');
});

Route::get('/user', function () {
    if(Auth::check()){
        return response()->json(['success' => true, 'user' =>  Auth::user()]);
    }
    return response()->json(['success' => false]);
});

Route::get('/', [IndexController::class, 'index'])->name('index');

Route::get('/{any}', [IndexController::class, 'index'])->where('any', '.*');
