const password_show_btn = document.getElementById('password-show-btn');

const setupPasswordToggle = (btn) => {
    const input = btn.parentElement.querySelector('input');
    const icon = btn.querySelector('i');

    const show = () => {
        input.type = 'text';
        icon.className = 'fa-solid fa-eye-slash';
    };

    const hide = () => {
        input.type = 'password';
        icon.className = 'fa-solid fa-eye';
    };

    ['mousedown', 'pointerdown'].forEach(e => btn.addEventListener(e, show));
    ['mouseup', 'mouseleave', 'pointerup', 'pointerleave'].forEach(e => btn.addEventListener(e, hide));
};

setupPasswordToggle(password_show_btn);
