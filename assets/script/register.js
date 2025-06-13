$.ajax({
  url: "http://localhost:5093/api/country/countries",
  type: "GET",
  success: function (response) {
    $("#Country").append(
      '<option value="" data-id="" hidden>' + "Select Country" + "</option>"
    );
    console.log(response.result);
    $.each(response.result, function (i, country) {
      $("#Country").append(
        '<option value="' +
          country.id +
          '">' +
          country.name +
          "</option>"
      );
    });
  },
  error: function (error) {
    console.log(error);
  },
});

$("#Country").change(function () {
  const countryId = $(this).find("option:selected").val();
  if (countryId) {
    $.ajax({
      url: "http://localhost:5093/api/country/timezone/" + countryId,
      type: "GET",
      success: function (response) {
        $("#Timezone")
          .empty()
          .append('<option value="" hidden>' + "Select Timezone" + "</option>");
        $.each(response.result, function (i, timezone) {
          $("#Timezone").append(
            '<option value="' +
              timezone.id +
              '">' +
              timezone.timezone +
              "</option>"
          );
        });
      },
      error: function (error) {
        console.log(error);
      },
    });
  } else {
    $("#Timezone")
      .empty()
      .append('<option value="" hidden>' + "Select Timezone" + "</option>");
  }
});

$("#eye-icon").click(function () {
  const input = $("#Password");
  const type = input.attr("type") === "password" ? "text" : "password";
  input.attr("type", type);
  $(this).toggleClass("fa-eye fa-eye-slash");
});

function handleFormSubmission() {
  let isValid = true;
  const firstName = $("#FirstName").val().trim();
  const lastName = $("#LastName").val().trim();
  const email = $("#Email").val().trim();
  const phone = $("#Phone").val().trim();
  const country = $("#Country").val();
  const timezone = $("#Timezone").val();
  const username = $("#Username").val().trim();

  $(".text-danger").text("");

  if (!firstName) {
    $("#firstNameError").text("First Name is required.");
    isValid = false;
  } else if (firstName.length > 100) {
    $("#firstNameError").text("First Name should be less than 100 characters.");
    isValid = false;
  } else if (!/^[a-zA-Z0-9]+$/.test(firstName)) {
    $("#firstNameError").text(
      "First Name can only contain letters and digits."
    );
    isValid = false;
  }

  if (!lastName) {
    $("#lastNameError").text("Last Name is required.");
    isValid = false;
  } else if (lastName.length > 100) {
    $("#lastNameError").text("Last Name should be less than 100 characters.");
    isValid = false;
  } else if (!/^[a-zA-Z0-9]+$/.test(lastName)) {
    $("#lastNameError").text("Last Name can only contain letters.");
    isValid = false;
  }

  if (!email) {
    $("#emailError").text("Email is required.");
    isValid = false;
  } else if (email.length > 200) {
    $("#emailError").text("Email should be less than 200 characters.");
    isValid = false;
  } else if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email)) {
    $("#emailError").text("Invalid Email.");
    isValid = false;
  }

  if (!username) {
    $("#usernameError").text("Username is required.");
    isValid = false;
  } else if (username.length > 50) {
    $("#usernameError").text("Username should be less than 50 characters.");
    isValid = false;
  } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    $("#usernameError").text("Username can only contain letters, numbers, and underscores.");
    isValid = false;
  }

  if (!phone) {
    $("#phoneError").text("Phone is required.");
    isValid = false;
  } else if (!/^[1-9]\d{9}$/.test(phone)) {
    $("#phoneError").text("Please enter a valid phone number.");
    isValid = false;
  }

  if (!country) {
    $("#countryError").text("Country is required.");
    isValid = false;
  }

  if (!timezone) {
    $("#timezoneError").text("Timezone is required.");
    isValid = false;
  }

  if (isValid) {
    // $("#registerForm").off("submit").submit();
    const userRegisterDto = {
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      Phone: phone,
      CountryId:country,
      Timezone: timezone,
      UserName: username
    };

    $.ajax({
      url: "http://localhost:5093/api/authentication/register",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(userRegisterDto),
      success: function (response) {
        if (response.isSuccess) {
          toastr.success("User account created. Email has been sent for complete your account setup. the setup link is valid for 24 hours");
          $("#registerForm")[0].reset();
        } else {
          toastr.error("Register failed: " + response.errorMessage);
        }
      },
      error: function (error) {
        console.log(error);
      },
      statusCode: {
        400: function(response) {
          toastr.error(response.responseJSON.errorMessage);
        }
      }
    });
  }
}

$(document).ready(function () {
  $("#registerForm").on("submit", function (event) {
    event.preventDefault();
    handleFormSubmission();
  });
});


function validateInputNumber(input) {
  input.value = input.value.replace(/[^0-9]/g, '');
}