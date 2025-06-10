$(function () {
    $("#head-placeholder").load("../partials/header.html");
    $("#footer-placeholder").load("../partials/footer.html");
  });

  $("#resetPassEyeBtn1").click(function () {
    const input = $("#PasswordReset1");
    const type = input.attr("type") === "password" ? "text" : "password";
    input.attr("type", type);
    $(this).toggleClass("fa-eye fa-eye-slash");
  });

  $("#resetPassEyeBtn2").click(function () {
    const input = $("#PasswordReset2");
    const type = input.attr("type") === "password" ? "text" : "password";
    input.attr("type", type);
    $(this).toggleClass("fa-eye fa-eye-slash");
  });

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  $("#resetToken").val(token)

  $("#setupPasswordForm").validate({
    rules: {
      NewPassword: {
        required: true,
        minlength: 8,
        maxlength: 200,
        regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/
      },
      ConfirmNewPassword: {
        required: true,
        minlength: 8,
        maxlength: 200,
        equalTo: "#PasswordReset1"
      }
    },
    messages: {
      NewPassword: {
        required: "Password is required",
        minlength: "Password must be at least 8 characters long",
        maxlength: "Password should be less than 200 characters",
        regex: "Password must include uppercase, lowercase, number, and special character."
      },
      PasswordReset2: {
        required: "Please confirm your password",
        minlength: "Password must be at least 8 characters long",
        maxlength: "Password should be less than 200 characters",
        equalTo: "Passwords do not match"
      }
    },
    errorPlacement: function (error, element) {
      error.appendTo(element.parent().find("span.error"));
    }
  });

  if (token) {
    console.log(token);
    $.ajax({
      url: 'http://localhost:5093/api/Authentication/reset-password', 
      method: 'GET',
      data: { token: token },
      success: function(response) {
        if (response.isSuccess == false) {
          
        } else {
          console.log(response);
        }
      },
      error: function(error) {
        debugger
        if(error.responseJSON.isSuccess == false)
            window.location.href = '../templates/ResetDenyPage.html'; 
        console.log(error);
      }
    });
  }


  $("#setupPasswordForm").on("submit", function(event) {
    event.preventDefault(); 

      const newPassword = $("#PasswordReset1").val();
      const confirmPassword = $("#PasswordReset2").val();
      let isValid = false;
      console.log(newPassword,confirmPassword,token)
      $("#newPasswordError").text("");
      $("#confirmPasswordError").text("");


      if($("#setupPasswordForm").valid())
      {
        const resetToken = $("#resetToken").val(); 
        const ResetPasswordDto = {
          Token: resetToken,
          NewPassword: newPassword,
          ConfirmNewPassword:confirmPassword
        }
        $.ajax({
          url: 'http://localhost:5093/api/Authentication/reset-password', 
          method: 'POST',
          data: JSON.stringify(ResetPasswordDto), // Use the reset token
          contentType: "application/json",
          success: function(response) {
            if (response.isSuccess) {
              toastr.succes("Password set successfully.");
            }
          },
          error: function(error) {
            toastr.error("Error");
          }
        });
      }
  });
  