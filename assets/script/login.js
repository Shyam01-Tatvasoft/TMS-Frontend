$(document).ready(function () {
  function getAuthToken() {
    const match = document.cookie.match(/(^|;)\s*AuthToken=([^;]+)/);
    return match ? match[2] : null;
  }
  var token = getAuthToken();
  console.log(token)
  if(token)
  {
    window.location.href = "assets/templates/Dashboard.html";
  }

  $("#loginForm").submit(function (e) {
    e.preventDefault();

    let isValid = true;

    $("#emailError").text("");
    $("#passwordError").text("");

    const email = $("#email").val().trim();
    const password = $("#Password").val().trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email === "") {
      $("#emailError").text("Email is required.");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      $("#emailError").text("Invalid email format.");
      isValid = false;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/;
    if (password === "") {
      $("#passwordError").text("Password is required.");
      isValid = false;
    }
    const rememberMe = $("#rememberMe").is(":checked");

    if (isValid) {
      $.ajax({
        url: "http://localhost:5093/api/Authentication/login",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify({
          Email: email,
          Password: password,
          RememberMe: rememberMe,
        }),
        success: function (response) {
          if (response.isSuccess) {
            toastr.success("Login successful!");
            const expiryTime = rememberMe ? 24 * 60 * 60 : 3 * 60 * 60;
            const expires = new Date(Date.now() + expiryTime * 1000).toUTCString();
            document.cookie = "AuthToken=" + response.result.token + "; expires=" + expires + "; secure; SameSite=None";
            setTimeout(function () {
              window.location.href = "assets/templates/dashboard.html";
            }, 1000);
          } else {
            toastr.error("Login failed: " + response.errorMessage);
          }
          console.log("Login successful:", response);
        },
        error: function (xhr, status, error) {
          console.log(error)
          toastr.error("Login failed: Invalid Credentials");
        },
      });
    }
  });



  $("#eye-icon").click(function () {
    const input = $("#Password");
    const type = input.attr("type") === "password" ? "text" : "password";
    input.attr("type", type);
    $(this).toggleClass("fa-eye fa-eye-slash");
  });
});
