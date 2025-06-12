
  function getAuthToken() {
    const match = document.cookie.match(/(^|;)\s*AuthToken=([^;]+)/);
    return match ? match[2] : null;
  }

  var authToken = getAuthToken();

  var userProfile;
  $(function () {
    $("#navbar-container").load("../partials/navbar.html");
    $.ajax({
      url: "http://localhost:5093/api/User/GetUser",
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
            $(".profile-photo").attr(
                "src",
                "../assets/images/default-profile.png"
            );
        }
          userProfile = response.result;
          console.log("User", userProfile);
          manageAuthentication();
        }
      },
      error: function (error) {
        debugger
        if (error.status == 401) {
          handleLogout();
        }
      },
    });
  });


  
  function manageAuthentication() {
    var navUserLink = document.getElementById("nav-item-user");
    if (userProfile.role == "User") {
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
    window.location.href = "../templates/Forbidden.html";
  }
  

  function validateInputNumber(input) {
    input.value = input.value.replace(/[^0-9]/g, '');
  }

