@if(session('success'))
    <div class="alert alert-success w-100 position-absolute top-0 z-3">
        {{ session('success') }}
    </div>
@endif
@if(session('danger'))
    <div class="alert alert-danger w-100 position-absolute top-0 z-3">
        {{ session('danger') }}
    </div>
@endif
