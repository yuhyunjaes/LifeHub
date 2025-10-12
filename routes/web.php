<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\IndexController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\NotepadController;

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

    Route::post('/api/notepads', [NotepadController::class, 'store'])->name('store');
    Route::get('/api/notepads/{id}', [NotepadController::class, 'show'])->name('show');
    Route::put('/api/notepads/{noteId}', [NotepadController::class, 'update'])->name('update');
    Route::delete('/api/notepads/{noteId}', [NotepadController::class, 'delete'])->name('delete');
});

Route::get('/user', function () {
    if(Auth::check()){
        return response()->json(['success' => true, 'user' =>  Auth::user()]);
    }
    return response()->json(['success' => false]);
});

Route::get('/', [IndexController::class, 'index'])->name('index');

Route::get('/{any}', [IndexController::class, 'index'])->where('any', '.*');
