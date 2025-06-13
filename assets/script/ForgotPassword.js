// apply validation on forgot password form
$(document).ready(function() {
    $("#forgotPasswordForm").validate({
        rules: {
            email: {
                required: true,
                email: true
            }
        },
        messages: {
            email: {
                required: "Please enter your email address",
                email: "Please enter a valid email address"
            }
        },
        errorPlacement: function (error, element) {
            error.appendTo(element.parent().find(".text-danger"));
        },
        submitHandler: function(form) {
            const email = $("#email").val();
            var ForgotPasswordDto = {
                Email: email
            }
            $.ajax({
                url: 'http://localhost:5093/api/authentication/forgot-password',
                method: 'POST',
                data: JSON.stringify(ForgotPasswordDto),
                contentType: "application/json",
                success: function(response) {
                    if (response.isSuccess) {
                        toastr.success("A password reset link has been sent to your email.");
                    } else {
                        toastr.error(response.message);
                    }
                },
                error: function(error) {
                    toastr.error(error.responseJSON.errorMessage[0]);
                }
            });
        }
    });
});