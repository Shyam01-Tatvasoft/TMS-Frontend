$(function () {
    $("#head-placeholder").load("../partials/header.html");
    $("#footer-placeholder").load("../partials/footer.html");
  });

  function getAuthToken() {
    const match = document.cookie.match(/(^|;)\s*AuthToken=([^;]+)/);
    return match ? match[2] : null;
  }

  var authToken = getAuthToken();

  $(function () {
    $("#navbar-container").load("../partials/navbar.html");
  });

  var user;
  $.ajax({
    url: "http://localhost:5093/api/User/GetUser",
    type: "GET",
    headers: {
      Authorization: "Bearer " + authToken,
    },
    success: function (response) {
      if (response.isSuccess) {
        $("#userName").text(response.result.firstName);
        user = response.result;
        console.log("User", user);
        manageAuthentication();
      }
    },
    error: function (error) {
      if (error.status == 401) {
        handleLogout();
      }
      console.error("Logout failed", error);
    },
  });
  
  function manageAuthentication() {
    var navUserLink = document.getElementById("nav-item-user");
    if (user.role == "User") {
      navUserLink.style.display = "none";
    }
  }
  
  $(document).on("click", "#logout-btn", function () {
    $.ajax({
      url: "http://localhost:5093/api/Authentication/logout",
      type: "POST",
      headers: {
        Authorization: "Bearer " + authToken,
      },
      success: function (response) {
        console.log(response);
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
    window.location.href = "../templates/Dashboard.html";
  }
  

