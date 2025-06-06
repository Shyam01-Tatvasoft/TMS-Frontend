$.ajax({
  url: "https://country-state-city-search-rest-api.p.rapidapi.com/allcountries",
  headers: {
    "x-rapidapi-key": "04c359e481msh193f2089d017a37p159b72jsnd109f04920fc",
    "x-rapidapi-host": "country-state-city-search-rest-api.p.rapidapi.com",
  },
  type: "GET",
  success: function (response) {
    $("#Country").append(
      '<option value="" data-id="" hidden>' + "Select Country" + "</option>"
    );
    $.each(response, function (i, country) {
      $("#Country").append(
        '<option value="' +
          country.name +
          '" data-id="' +
          country.isoCode +
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

  if (isValid) {
    $("#loginForm").off("submit").submit();
    const userRegisterDto = {
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      Password: password,
      Phone: phone,
      Country: country,
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
            window.location.href = "login.html";
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
