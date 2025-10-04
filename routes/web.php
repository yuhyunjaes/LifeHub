<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\IndexController;
use App\Http\Controllers\AuthController;

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

Route::get('/', [IndexController::class, 'index'])->name('index');

Route::get('/{any}', [IndexController::class, 'index'])->where('any', '.*');
