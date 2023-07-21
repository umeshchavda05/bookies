function check() {
    var storedName = localStorage.getItem('username');
    var storedPw = localStorage.getItem('password');
  
    var userName = document.getElementById('enuser');
    var userPw = document.getElementById('enpw');
  
    if(userName.value == storedName && userPw.value == storedPw) {
        alert('You are logged in.');
        popup.style.display = "none";
    }else {
        alert('ERROR.');
    }
}

document.addEventListener("DOMContentLoaded", function() {
    var popup = document.getElementById("popup");
  
    
    popup.style.display = "block";
  
    // verifying credentials from local storage
    var loginButton = document.querySelector("button[type='submit']");
    loginButton.addEventListener("click", function(event) {
      event.preventDefault();
      check();
    });


  
    var signupLink = document.querySelector("a[href='#signup-form']");
    signupLink.addEventListener("click", function(event) {
      event.preventDefault();
      popup.style.display = "none";
    });
  });


