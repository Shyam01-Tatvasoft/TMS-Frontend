$(document).ready(function () {
  $("#loginForm").submit(function (e) {
    e.preventDefault(); // Prevent form submission

    let isValid = true;

    // Clear previous errors
    $("#emailError").text("");
    $("#passwordError").text("");

    const email = $("#email").val().trim();
    const password = $("#Password").val().trim();

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email === "") {
      $("#emailError").text("Email is required.");
      isValid = false;
    } else if (!emailRegex.test(email)) {
      $("#emailError").text("Invalid email format.");
      isValid = false;
    }

    // Password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,}$/;
    if (password === "") {
      $("#passwordError").text("Password is required.");
      isValid = false;
    } else if (!passwordRegex.test(password)) {
      $("#passwordError").text(
        "Password must be at least 8 characters and contain uppercase, lowercase, number, and special character."
      );
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
            setTimeout(function () {
              window.location.href = "dashboard.html";
            }, 1000); 
          } else {
            toastr.error("Login failed: " + response.errorMessage);
          }
          console.log("Login successful:", response);
        },
        error: function (xhr, status, error) {
          console.error("Login failed:", error);
        },
      });
    }


    $("#eye-icon").click(function () {
      const input = $("#Password");
      const type = input.attr("type") === "password" ? "text" : "password";
      input.attr("type", type);
      $(this).toggleClass("fa-eye fa-eye-slash");
    });
  });
});
