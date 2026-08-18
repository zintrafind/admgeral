const container = document.querySelector('.container');
const registerBtns = document.querySelectorAll('.register-btn');
const loginBtns = document.querySelectorAll('.login-btn');

registerBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    container.classList.add('active');
  });
});

loginBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    container.classList.remove('active');
  });
});
