//code to store username and password in local storage
function store() {
    var username = document.getElementById('username');
    var password = document.getElementById('pw');
    localStorage.setItem('username', username.value);
    localStorage.setItem('password', password.value);
    alert('Account created successfully');
}

document.addEventListener("DOMContentLoaded", function() {
    var signupButton = document.querySelector("button[type='submit']");
    signupButton.addEventListener("click", function(event) {
      event.preventDefault();
      store();
      window.location.href = "index.html";
    });
  });

