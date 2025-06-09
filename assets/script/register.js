$.ajax({
  url: "http://localhost:5093/api/Authentication/countries",
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
          country.countryName +
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
      url: "http://localhost:5093/api/Authentication/timezone/" + countryId,
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
              timezone.timezoneName +
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
  const password = $("#Password").val().trim();
  const phone = $("#Phone").val().trim();
  const country = $("#Country").val();
  const countryName = $("#Country option:selected").text();
  const timezone = $("#Timezone").val();

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

  if (!password) {
    $("#passwordError").text("Password is required.");
    isValid = false;
  } else if (password.length < 8 || password.length > 200) {
    $("#passwordError").text("Password must be between 8 and 200 characters.");
    isValid = false;
  } else if (
    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/.test(password)
  ) {
    $("#passwordError").text(
      "Password must include upper, lower, number, and special character."
    );
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
    $("#loginForm").off("submit").submit();
    const userRegisterDto = {
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      Password: password,
      Phone: phone,
      Country: countryName,
      CountryId:country,
      Timezone: timezone
    };

    $.ajax({
      url: "http://localhost:5093/api/Authentication/register",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(userRegisterDto),
      success: function (response) {
        if (response.isSuccess) {
          toastr.success("Register successful!");
          setTimeout(function () {
            window.location.href = "../../index.html";
          }, 1000);
        } else {
          toastr.error("Register failed: " + response.errorMessage);
        }
      },
      error: function (error) {
        toastr.success("Registered successfully" + error.errorMessage);
        console.log("Registration failed:", error);
      },
    });
  }
}

$(document).ready(function () {
  $("#registerForm").on("submit", function (event) {
    event.preventDefault();
    handleFormSubmission();
  });
});
