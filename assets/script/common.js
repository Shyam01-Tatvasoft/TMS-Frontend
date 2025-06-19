function getAuthToken() {
  const match = document.cookie.match(/(^|;)\s*AuthToken=([^;]+)/);
  return match ? match[2] : null;
}

var authToken = getAuthToken();

var userProfile;
$(function () {
  $("#navbar-container").load("../partials/navbar.html", function () {
    $(".navbar-tabs").each(function () {
      $(this).removeClass("active-navbar");
      if (this.href.toLowerCase() === window.location.href.toLowerCase()) {
        $(this).addClass("active-navbar");
      }
    });
  });
  GetUserProfile();
});

function GetUserProfile()
{
  $.ajax({
    url: "http://localhost:5093/api/user/get-user",
    type: "GET",
    headers: {
      Authorization: "Bearer " + authToken,
    },
    success: function (response) {
      if (response.isSuccess) {
        $("#userName").text(response.result.username);
        if (response.result.profileImagePath) {
          $(".profile-photo").attr(
            "src",
            "../images" + response.result.profileImagePath
          );
        } else {
          $(".profile-photo").attr("src", "../images/profile.png");
        }
        userProfile = response.result;

        GetNotifications();
        manageAuthentication();
      }
    },
    error: function (error) {
      debugger;
      if (error.status == 401) {
        document.cookie =
          "AuthToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "/";
      } else if (error.status == 403) {
        window.location.href = "../templates/Forbidden.html";
      } else {
        toastr.error("Error fetching user profile", error);
      }
    },
  });
}

function GetNotifications() {
  $.ajax({
    url: "http://localhost:5093/api/notification/" + userProfile.id,
    type: "GET",
    success: function (response) {
      if (Array.isArray(response)) {
        const notifications = response;
        const notificationList = $("#notification-list");
        notificationList.empty();

        const notificationCount = notifications.length;
        if (notificationCount > 0) {
          notificationList.append(`<p class="mx-2">Notifications (${notifications.length})</p>`)
          notifications.forEach((notification) => {
            notificationList.append(
              `<li class="dropdown-item" style="">
              <div class="d-flex justify-content-between align-items-center">
              <div class="d-flex flex-column">
              <span class="me-2 fw-bold">${notification.taskType}</span>
              <span class="description">${notification.taskDescription}</span>
              </div>
              <div>
              <button class="btn btn-sm btn-outline-secondary" onclick="markAsRead(${notification.id})">Read</button>
              </div>
              </div>
              <div class="mt-1">
              <span class="badge rounded-pill text-bg-${notification.priority == "Low" ? "success" : notification.priority == "Medium" ? "primary" : "danger"}">${notification.priority}</span>
              </div>
              </li>`
            );
          });
          $("#notification-indicator").removeClass("d-none");
        } else {
          notificationList.append(
            '<li class="dropdown-item">No new notifications</li>'
          );
          $("#notification-indicator").addClass("d-none");
        }
      }
    },
    error: function (error) {
      toastr.error("Error fetching notifications:", error);
    },
  });
}


function markAsRead(id) {
  $.ajax({
    url: "http://localhost:5093/api/notification/" + id,
    type: "PUT",
    success: function (response) {
      GetNotifications();
    },
    error: function (error) {
      toastr.error("Error marking notification as read:", error);
    },
  });
}


const connection = new signalR.HubConnectionBuilder()
  .withUrl("http://localhost:5093/notificationHub")
  .build();

connection
  .start()
  .then(function () {
    console.log("SignalR connected");
  })
  .catch(function (err) {
    return console.error(err.toString());
  });

connection.on("ReceiveNotification", function (id, message) {
  debugger
  if (id == userProfile.id) {
    table.ajax.reload();
    $("#notification-indicator").removeClass('d-none');
    GetNotifications();
  }
});

function manageAuthentication() {
  var navUserLink = document.getElementById("nav-item-user");
  if (userProfile.role == "User") {
    navUserLink.style.display = "none";
  }
}

$(document).on("click", "#logout-btn", function () {
  $.ajax({
    url: "http://localhost:5093/api/authentication/logout",
    type: "POST",
    headers: {
      Authorization: "Bearer " + authToken,
    },
    success: function (response) {
      if (response.isSuccess) {
        document.cookie =
          "AuthToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie =
          "AuthToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; SameSite=None;";
        window.location.href = "/";
      }
    },
    error: function (error) {
      console.error("Logout failed", error);
    },
  });
});

function handleLogout() {
  window.location.href = "../templates/Forbidden.html";
}

function validateInputNumber(input) {
  input.value = input.value.replace(/[^0-9]/g, "");
}
