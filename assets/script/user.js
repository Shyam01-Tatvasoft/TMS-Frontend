$.ajax({
    url: "http://localhost:5093/api/User/GetUsers",
    type: "GET",
    headers: {
      Authorization: "Bearer " + authToken,
    },
    success: function (response) {
      console.log(response);
      if (response.isSuccess && Array.isArray(response.result.data)) {
        const users = response.result.data;
        const tableBody = $("#userTable tbody");
        tableBody.empty();
        console.log(users);
        users.forEach((user) => {
          const row = `
                <tr>
                  <td>${user.id}</td>
                  <td>${user.firstName}</td>
                  <td>${user.lastName}</td>
                  <td>${user.email}</td>
                  <td>${user.phone}</td>
                  <td>${user.country}</td>
                  <td>${user.role}</td>
                  <td>
                    <button class="btn btn-sm btn-primary me-2 editUser" onclick="editUser(${user.id})">Edit</button>
                    <button class="btn btn-sm btn-danger deleteUser" onclick="deleteUser(${user.id})">Delete</button>
                  </td>
                </tr>
              `;
          tableBody.append(row);
        });
      }
    },
    error: function (error) {
      if (error.status == 401 || error.status == 403) {
        handleLogout();
      }
    },
  });


function GetCountries()
{
    $.ajax({
        url: "http://localhost:5093/api/Authentication/countries",
        type: "GET",
        success: function (response) {
          $("#country").empty().append(
            '<option value="" data-id="" hidden>' + "Select Country" + "</option>"
          );
          console.log(response.result);
          $.each(response.result, function (i, country) {
            $("#country").append(
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
}

$(document).on('change',"#country",function () {
    const countryId = $(this).find("option:selected").val();
    console.log("click")
    if (countryId) {
      $.ajax({
        url: "http://localhost:5093/api/Authentication/timezone/" + countryId,
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

$("#AddUser").click(function() {
    $("#userModalLabel").text("Add User");
    $("#userForm")[0].reset();
    GetCountries()
    $("#userModal").modal('show');

});

function editUser(userId) {
    GetCountries()
    $.ajax({
        url: `http://localhost:5093/api/User/GetUserById/${userId}`,
        type: "GET",
        headers: {
            Authorization: "Bearer " + authToken,
        },
        success: function (response) {
            if (response.isSuccess) {
                const user = response.result;
                $("#userModalLabel").text("Edit User");
                $("#userId").val(user.id);
                $("#firstName").val(user.firstName);
                $("#lastName").val(user.lastName);
                $("#email").val(user.email).prop("disabled", true);
                $("#country").val(user.country);
                $("#role").val(user.role);
                $("#userModal").modal('show');
            }
        },
        error: function (error) {
            console.error("Error fetching user data:", error);
        }
    });
}



$("#userForm").submit(function(e) {
    debugger
    e.preventDefault();
    const userId = $("#userId").val();


    const formData = new FormData($("#userForm")[0]);
    const userData = Object.fromEntries(formData.entries());
    
    let isValid = true;
    $(".text-danger").text(""); // Clear previous error messages

    const firstName = $("#firstName").val();
    const lastName = $("#lastName").val();
    const email = $("#email").val();
    const password = $("#password").val();
    const phone = $("#phone").val();
    const country = $("#country").val();
    const timezone = $("#timezone").val();

    if (!firstName) {
        $("#firstNameError").text("First Name is required.");
        isValid = false;
    } else if (firstName.length > 100) {
        $("#firstNameError").text("First Name should be less than 100 characters.");
        isValid = false;
    } else if (!/^[a-zA-Z0-9]+$/.test(firstName)) {
        $("#firstNameError").text("First Name can only contain letters.");
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
        $("#passwordError").text("Password must be at least 8 characters long and less than 200 characters.");
        isValid = false;
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&]).{8,}$/.test(password)) {
        $("#passwordError").text("Password must include uppercase, lowercase, number, and special character.");
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

    if (!isValid) {
        return; 
    }
    console.log(userData);
    const url = userId ? `http://localhost:5093/api/User/PutUser/${userId}` : "http://localhost:5093/api/User/AddUser";
    const type = userId ? "PUT" : "POST";

    $.ajax({
        url: url,
        type: type,
        headers: {
            Authorization: "Bearer " + authToken,
        },
        contentType: "application/json",
        data: JSON.stringify(userData),
        success: function (response) {
            if (response.isSuccess) {
                $("#userModal").modal('hide');
                // Optionally refresh the user list here
            }
        },
        error: function (error) {
            console.error("Error saving user data:", error);
        }
    });
});

