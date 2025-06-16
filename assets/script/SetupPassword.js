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
      ConfirmNewPassword: {
        required: "Confirm password is required",
        equalTo: "Passwords do not match"
      }
    },
    errorPlacement: function (error, element) {
      error.appendTo(element.parent().find("span.error"));
    }
  });

  if (token) {
    $.ajax({
      url: 'http://localhost:5093/api/authentication/reset-password', 
      method: 'GET',
      data: { token: token , type: "SetupPassword" },
      success: function(response) {
      },
      error: function(error) {
        if(error.responseJSON.isSuccess == false)
            window.location.href = '../templates/setupDenyPage.html'; 
      }
    });
  }


  $("#setupPasswordForm").on("submit", function(event) {
    event.preventDefault(); 

      const newPassword = $("#PasswordReset1").val();
      const confirmPassword = $("#PasswordReset2").val();
    
      $("#newPasswordError").text("");
      $("#confirmPasswordError").text("");


      if($("#setupPasswordForm").valid())
      {
        const resetToken = $("#resetToken").val(); 
        const ResetPasswordDto = {
          Token: resetToken,
          NewPassword: newPassword,
          ConfirmNewPassword:confirmPassword,
          Type: "SetupPassword"
        }
        $.ajax({
          url: 'http://localhost:5093/api/authentication/reset-password', 
          method: 'POST',
          data: JSON.stringify(ResetPasswordDto),
          contentType: "application/json",
          success: function(response) {
            if (response.isSuccess) {
              $(".setupContainer").addClass("d-none")
              $("#resultHeader").text("Congratulations");
              $("#resultMessage").text("You have successfully setup your password and your new account is ready.");
              $(".responseContainer").removeClass('d-none');
            }
          },
          error: function(error) {
            toastr.error("Error");
          },
          statusCode: {
            400: function(response) {
              toastr.error(response.responseJSON.errorMessage);
            }
          }
        });
      }
  });
  