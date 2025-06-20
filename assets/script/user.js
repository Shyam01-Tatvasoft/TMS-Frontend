function getAuthToken() {
  const match = document.cookie.match(/(^|;)\s*AuthToken=([^;]+)/);
  return match ? match[2] : null;
}

$(function () {
  $("#navbar-container").load("../partials/navbar.html");
});


var authToken = getAuthToken();

var userTable;
$(document).ready(function () {

  userTable = $("#userTable").DataTable({
    processing: true,
    serverSide: true,
    ordering: true,
    responsive: true,
    pagingType: "simple_numbers",
    ajax: {
      url: "http://localhost:5093/api/user/get-users",
      type: "POST",
      data: function (d) {
        return d;
      },
    },
    columns: [
      { data: "firstName" },
      { data: "lastName" },
      { data: "username" },
      { data: "email" },
      { data: "phone" , orderable: false },
      { data: "countryName" ,orderable: false },
      {
        data: "id",
        orderable: false,
        className: "text-center",
        render: function (data) {
          return `
<button class="btn border-0 me-2 editUser" onclick="editUser(${data})"> <i class="fa-solid fa-pen text-gray"></i></button>
                   <button class="btn border-0 deleteUser" onclick="deleteUser(${data})"> <i class="fa-solid fa-trash text-gray"></i></button>`;
        },
      },
    ],
    pageLength: 5,
    dom:
      "<'row'<'col-auto'i><'col text-end my-1'f>>" +
      "<'row'<'col-sm-12'tr>>" +
      "<'row d-flex justify-content-between'<'col-auto'l><'col-auto'p>>",
    language: {
      info: "Total _TOTAL_ Records",
      lengthMenu:
        "Showing <select>" +
        '<option value="5">5</option>' +
        '<option value="10">10</option>' +
        '<option value="15">15</option>' +
        "</select> records per page",
      search: "",
      searchPlaceholder: "Search users...",
    },
  });

  $('#userTable_filter input').addClass("fs-6 shadow-none ");
});

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
      toastr.error("Error while fetching data of country")
    },
  });
}

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
        toastr.error("Error while fetching the data of timezone.")
      },
    });
  } else {
    $("#Timezone")
      .empty()
      .append('<option value="" hidden>' + "Select Timezone" + "</option>");
  }
});

$("#AddUser").click(function () {
  $("#userModalLabel").text("Add User");
  $("#userForm")[0].reset();
  $(".text-danger").text("");
  $("#email").prop("readonly", false);
  GetCountries();
  $("#userModal").modal("show");
});

function editUser(userId) {
  $(".text-danger").text("");
  $.ajax({
    url: `http://localhost:5093/api/user/${userId}`,
    type: "GET",
    success: function (user) {
      $("#userModalLabel").text("Edit User");
      $("#userFormId").val(user.result.id);
      $("#firstName").val(user.result.firstName);
      $("#lastName").val(user.result.lastName);
      $("#uesrname1").val(user.result.username);
      $("#email").val(user.result.email);
      $("#phone").val(user.result.phone.trim());
      $("#country").val(user.result.fkCountryId);
      $("#timezone").val(user.result.fkCountryTimezone);
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

          $("#country").val(user.result.fkCountryId);
        },
        error: function (error) {
          toastr.error("Error while fetching the data of user")
        },
      });

      $.ajax({
        url: "http://localhost:5093/api/country/timezone/" + user.result.fkCountryId,
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

          $("#timezone").val(user.result.fkCountryTimezone);
        },
        error: function (error) {
          toastr.error("Error while fetching the data of timezone");
        },
      });
      $("#email").prop("readonly", true);
      $("#userModal").modal("show");
    },
  });
}

$("#userForm").validate({
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
    saveUser();
  },
});

function validateInputNumber(input) {
  input.value = input.value.replace(/[^0-9]/g, "");
}

function saveUser() {
  const isEdit = $("#userFormId").val() && $("#userFormId").val() != "0";
  const apiUrl = isEdit
    ? `http://localhost:5093/api/user/${$("#userFormId").val()}`
    : "http://localhost:5093/api/user";

  const method = isEdit ? "PUT" : "POST";

  var form = new FormData();
  form.append("Id", $("#userFormId").val() || 0);
  form.append("FirstName", $("#firstName").val().trim());
  form.append("LastName", $("#lastName").val().trim());
  form.append("Username", $("#uesrname1").val().trim());
  form.append("Email", $("#email").val().trim());
  form.append("Phone", $("#phone").val().trim());
  form.append("FkCountryId", parseInt($("#country").val()));
  form.append("FkCountryTimezone", parseInt($("#timezone").val()));


  $.ajax({
    url: apiUrl,
    type: method,
    contentType: false,
    processData: false,
    data: form,
    success: function (response) {
      if (response.isSuccess) {
        toastr.success(
          isEdit ? "User updated successfully!" : "User added successfully!"
        );
        $("#userForm")[0].reset();
        $("#userModal").modal("hide");
        $("#email").prop("readonly", false);
        $("#userFormId").val("")
        userTable.ajax.reload(); 
      }else{
        toastr.error(response.errorMessage)
      }
      // reload table or data here
    },
    error: function (xhr) {
      const errorMsg = xhr.responseJSON?.message || "Failed to save user.";
      toastr.error("Error: " + errorMsg);
    },
  });
}

// delete user
var deleteUserId;
function deleteUser(userId) {
  deleteUserId = userId;
  $("#deleteUserModal").modal("show");
}

$("#confirmDeleteUserBtn").on("click", function () {
  $.ajax({
    url: `http://localhost:5093/api/user/${deleteUserId}`,
    type: "DELETE",
    success: function (response) {
      toastr.success("User deleted Successfully");
      $("#deleteUserModal").modal("hide");
      GetUsers();
    },
    error: function (xhr) {
      const errorMsg = xhr.responseJSON?.message || "Failed to delete user.";
      toastr.error("Error: " + errorMsg);
    },
  });
});
