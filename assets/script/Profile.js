function GetCountries() {
  $.ajax({
    url: "http://localhost:5093/api/country/countries",
    type: "GET",
    success: function (response) {
      $("#country")
        .empty()
        .append(
          '<option value="" data-id="" hidden>' + "Select Country" + "</option>"
        );
      $.each(response.result, function (i, country) {
        $("#country").append(
          '<option value="' + country.id + '">' + country.name + "</option>"
        );
      });
    },
    error: function (error) {
      toastr.error(error)
    },
  });
}
GetCountries();

$(document).on("change", "#country", function () {
  const countryId = $(this).find("option:selected").val();
  if (countryId) {
    $.ajax({
      url: "http://localhost:5093/api/country/timezone/" + countryId,
      type: "GET",
      success: function (response) {
        $("#timezone")
          .empty()
          .append('<option value="" hidden>' + "Select Timezone" + "</option>");
        $.each(response.result, function (i, timezone) {
          $("#timezone").append(
            '<option value="' +
              timezone.id +
              '">' +
              timezone.timezone +
              "</option>"
          );
        });
      },
      error: function (error) {
        toastr.error(error)
      },
    });
  } else {
    $("#Timezone")
      .empty()
      .append('<option value="" hidden>' + "Select Timezone" + "</option>");
  }
});

var userProfile;
$(function () {
  $("#navbar-container").load("../partials/navbar.html");
  $.ajax({
    url: "http://localhost:5093/api/user/get-user",
    type: "GET",
    headers: {
      Authorization: "Bearer " + authToken,
    },
    success: function (response) {
      if (response.isSuccess) {
        userProfile = response.result;
        $("#userProfileId").val(response.result.id);
        $("#profileUserName").val(response.result.username);
        $("#firstName").val(response.result.firstName);
        $("#lastName").val(response.result.lastName);
        $("#phone").val(response.result.phone.trim());
        $("#country").val(response.result.fkCountryId);
        $("#profileImagePath").val(response.result.profileImagePath);
        $("#email").val(response.result.email);
        // set image src profileImagePAth
        if (response.result.profileImagePath) {
          $(".profile-img").attr(
            "src",
            "../images" + response.result.profileImagePath
          );
        } else {
          $(".profile-img").attr("src", "../images/profile.png");
        }
        var timezoneId = response.result.fkCountryTimezone;
        $.ajax({
          url:
            "http://localhost:5093/api/country/timezone/" +
            response.result.fkCountryId,
          type: "GET",
          success: function (response) {
            $("#timezone")
              .empty()
              .append(
                '<option value="" hidden>' + "Select Timezone" + "</option>"
              );
            $.each(response.result, function (i, timezone) {
              $("#timezone").append(
                '<option value="' +
                  timezone.id +
                  '">' +
                  timezone.timezone +
                  "</option>"
              );
            });
            $("#timezone").val(timezoneId);
          },
          error: function (error) {
            toastr.error(error);
          },
        });
        manageAuthentication();
      }
    },
    error: function (error) {
      debugger;
      if (error.status == 401) {
        handleLogout();
      }
    },
  });
});

$("#ProfileForm").validate({
  rules: {
    firstName: {
      required: true,
      maxlength: 100,
      regex: /^[a-zA-Z0-9]+$/,
    },
    lastName: {
      required: true,
      maxlength: 100,
      regex: /^[a-zA-Z0-9]+$/,
    },
    userName: {
      required: true,
      maxlength: 50,
      regex: /^[a-zA-Z0-9_]+$/,
    },
    email: {
      required: true,
      maxlength: 200,
      regex: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/,
      email: true,
    },
    phone: {
      required: true,
      maxlength: 10,
      regex: /^[1-9]\d{9}$/,
    },
    country: {
      required: true,
    },
    timezone: {
      required: true,
    },
    profileImage: {
      extension: "jpg,jpeg,png,gif",
    },
    profileImagePath: {
      required: true,
    },
  },
  messages: {
    firstName: {
      required: "First Name is required.",
      maxlength: "First Name should be less than 100 characters.",
      regex: "First Name can only contain letters and numbers.",
    },
    lastName: {
      required: "Last Name is required.",
      maxlength: "Last Name should be less than 100 characters.",
      regex: "Last Name can only contain letters and numbers.",
    },
    userName: {
      required: "Username is required.",
      maxlength: "Username should be less than 50 characters.",
      regex: "Username can only contain letters, numbers, and underscores.",
    },
    email: {
      required: "Email is required.",
      maxlength: "Email should be less than 200 characters.",
      regex: "Invalid Email format.",
      email: "Invalid Email address.",
    },
    phone: {
      required: "Phone is required.",
      maxlength: "Phone must be 10 digits.",
      regex: "Please enter a valid 10-digit phone number.",
    },
    country: {
      required: "Please select a country.",
    },
    timezone: {
      required: "Please select a timezone.",
    },
  },
  errorPlacement: function (error, element) {
    error.appendTo(element.siblings("span.text-danger"));
  },
  submitHandler: function (form) {
    if ($("#ProfileForm").valid) updateProfile();
  },
});

function updateProfile() {
  var form = new FormData();
  form.append(
    "ProfileImage",
    document.querySelector("#ProfileImageUpload").files[0]
  );
  form.append("Id", $("#userProfileId").val() || 0);
  form.append("FirstName", $("#firstName").val().trim());
  form.append("LastName", $("#lastName").val().trim());
  form.append("Username", $("#profileUserName").val().trim());
  form.append("Email", $("#email").val().trim());
  form.append("Phone", $("#phone").val().trim());
  form.append("FkCountryId", parseInt($("#country").val()));
  form.append("FkCountryTimezone", parseInt($("#timezone").val()));
  form.append("ProfileImagePath", $("#profileImagePath").val().trim());

  $.ajax({
    url: `http://localhost:5093/api/user/${$("#userProfileId").val()}`,
    type: "PUT",
    data: form,
    contentType: false,
    processData: false,
    success: function (response) {
      if (response.isSuccess) {
        toastr.success("User Profile updated successfully!");
      } else {
        toastr.error(response.errorMessage);
      }
    },
    error: function (xhr) {
      const errorMsg = xhr.responseJSON?.message || "Failed to save user.";
      toastr.error("Error: " + errorMsg);
    },
  });
}

document
  .getElementById("ProfileImageUpload")
  .addEventListener("change", function (event) {
    var file = event.target.files[0];
    const uploadfile = document.querySelector("#ProfileImageUpload");
    if (file) {
      if (!file.type.startsWith("image/")) {
        toastr.warning("Invalid file type. Please upload an image file.");
        uploadfile.value = "";
        return;
      }
      const maxSize = 2 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toastr.warning("File size exceeds 2MB. Please choose a smaller image.");
        uploadfile.value = "";
        return;
      }

      var reader = new FileReader();
      reader.onload = function (e) {
        document.querySelector(".profile-img").src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
