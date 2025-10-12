let idSwitch = false;
let passwordSwitch = false;
let csrfToken = null;
let sendSwitch = false;
let emailTimerInterval = null;
let emailSwitch = false;

document.addEventListener('DOMContentLoaded', async ()=> {
    try {
        const res = await fetch('/csrf-token');

        csrfToken = await res.text();
    } catch (err) {
        console.error(err);
    }
})

const idText = document.getElementById('user-id-text');
const userIdInput = document.getElementById('user_id');

function setIdMessage(message = '', type = '') {
    idText.className = `mb-0 form-text${type ? ' text-' + type : ''}`;
    idText.textContent = message;
}

function isValidId(id) {
    return /^[a-zA-Z0-9]{4,15}$/.test(id);
}

async function checkId() {
    const id = userIdInput.value.trim();

    if (!id) return setIdMessage('아이디를 작성해주세요.', 'danger');
    if (id === 'admin') return setIdMessage('사용 불가한 아이디입니다.', 'danger');
    if (!isValidId(id)) return setIdMessage('아이디는 4~15자 영문자와 숫자만 가능합니다.', 'danger');

    try {
        const res = await fetch(`/check-id/${id}`);
        const data = await res.json();

        if (data.success) {
            setIdMessage('사용가능한 아이디입니다.', 'success');
            idSwitch = true;
        } else {
            setIdMessage('이미 존재하는 아이디입니다.', 'danger');
        }
    } catch (err) {
        console.error(err);
    }
}

userIdInput.addEventListener('input', () => {
    idSwitch = false;
    setIdMessage();
});

document.getElementById('password_confirmation').addEventListener('input', isValidPassword);
document.getElementById('password').addEventListener('input', isValidPassword);


function isValidPassword() {
    document.getElementById('password-confirm-text').textContent = document.getElementById('password_confirmation').value !== document.getElementById('password').value ? '비밀번호가 일치하지 않습니다.' : '';
    passwordSwitch = document.getElementById('password_confirmation').value === document.getElementById('password').value;
}

const password_show_btn = document.getElementById('password-show-btn');
const password_confirmation_show_btn = document.getElementById('password-confirmation-show-btn');

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
setupPasswordToggle(password_confirmation_show_btn);


function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

const emailText = document.getElementById('email-text');

function emailMessage(message = '', type = '') {
    emailText.className = `mb-0 form-text${type ? ' text-' + type : ''}`;
    emailText.textContent = message;
}

document.getElementById('email-check-btn').addEventListener('click', async (e)=> {
    const email = document.getElementById('email').value;
    const loading_container = document.getElementById('loading-container');

    if(sendSwitch) return;
    if(!email) return emailMessage('이메일을 작성해주세요.', 'danger');
    if(!isValidEmail(email)) return emailMessage('이메일 형식을 확인해주세요.', 'danger');
    loading_container.style.display = 'block';

    try {
        const res = await fetch('/send-email-code', {
            method : "POST",
            headers : {
                "Content-Type" : "application/json",
                "X-CSRF-TOKEN" : csrfToken,
            },
            body : JSON.stringify({ email })
        });
        const data = await res.json();
        loading_container.style.display = 'none';
        emailMessage(data.message, data.type);
        if(data.success) {
            document.getElementById('email').readOnly = true;
            sendSwitch = true;
            document.querySelector('.email-auth-item').style.display = 'block';

            emailTimer(e.target)
        }
    } catch (err) {
        console.error(err);
    }
})


function emailTimer(button) {
    timer = 90;
    emailTimerInterval = setInterval(() => {
        if (timer > 0) {
            button.textContent = `재전송(${timer}s)`;
            timer--;
        } else {
            clearInterval(emailTimerInterval);
            sendSwitch = false;
            button.textContent = '재전송';
            document.querySelector('.email-auth-item').style.display = 'none';
            document.getElementById('email-auth').value = '';
            emailMessage();
            document.getElementById('email').readOnly = false;
        }
    }, 1000);
}


const email_auth_text = document.getElementById('email-auth-text');
function emailAuthMessage(message = '', type = '') {
    email_auth_text.className = `mb-0 form-text${type ? ' text-' + type : ''}`;
    email_auth_text.textContent = message;
}

document.getElementById('email-auth-btn').addEventListener('click', async ()=> {
    const email_auth = document.getElementById('email-auth').value;
    if(!email_auth) return emailAuthMessage('인증번호가 일치하지 않습니다.', 'danger');

    try {
        const res = await fetch('/check-email-code', {
            method : "POST",
            headers : {
                "Content-Type" : "application/json",
                "X-CSRF-TOKEN" : csrfToken,
            },
            body : JSON.stringify({ code : email_auth })
        });

        const data = await res.json();
        emailAuthMessage(data.message, data.type);
        if(data.success) {
            if(emailTimerInterval) clearInterval(emailTimerInterval);
            document.querySelector('.email-auth-item').style.display = 'none';
            document.getElementById('email-auth').value = '';
            document.getElementById('email-check-btn').textContent = '인증완료';
            emailMessage(data.message, data.type);
            emailSwitch = true;
        }
    } catch (err) {
        console.error(err);
    }
})

function isKorean(name) {
    return /^[가-힣]{2,5}$/.test(name);
}


document.getElementById('form').addEventListener('submit', event => {
    const user_id = document.getElementById('user_id'),
        password = document.getElementById('password'),
        password_confirmation = document.getElementById('password_confirmation'),
        name = document.getElementById('name'),
        email = document.getElementById('email');

    if(!user_id.value) {
        event.preventDefault();
        alert('아이디를 작성해주세요.')
        user_id.focus();
    } else if(!idSwitch) {
        event.preventDefault();
        alert('아이디 중복 확인이 필요합니다.')
    } else if(!password.value) {
        event.preventDefault();
        alert('비밀번호를 작성해주세요.')
        password.focus();
    }  else if(password.value.trim().length < 8) {
        event.preventDefault();
        alert('비밀번호는 8자 이상 작성해주세요.')
        password.focus();
    } else if(!password_confirmation.value) {
        event.preventDefault();
        alert('비밀번호 확인란을 작성해주세요.')
        password_confirmation.focus();
    } else if(!passwordSwitch) {
        event.preventDefault();
        alert('비밀번호가 일치하지 않습니다.');
        password_confirmation.focus();
    } else if(!name.value) {
        event.preventDefault();
        alert('이름을 작성해주세요.')
        name.focus();
    } else if(!isKorean(name.value)) {
        event.preventDefault();
        alert('이름은 2자에서 5자 사이의 한글만 입력 가능합니다.');
        name.focus();
    } else if(!email.value) {
        event.preventDefault();
        alert('이메일을 작성해주세요.')
        email.focus();
    } else if(!emailSwitch) {
        event.preventDefault();
        alert('이메일 인증이 필요합니다.')
        email.focus();
    }
})
