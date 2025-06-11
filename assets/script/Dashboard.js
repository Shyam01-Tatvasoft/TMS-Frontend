$(function () {
  $("#head-placeholder").load("../partials/header.html");
  $("#footer-placeholder").load("../partials/footer.html");
});

const token = getAuthToken();
if (!token) {
  window.location.href = "/";
}

var user;
$.ajax({
  url: "http://localhost:5093/api/Dashboard/dashboard",
  type: "GET",
  headers: {
    Authorization: "Bearer " + token,
  },
  success: function (response) {
    console.log(response);
  },
  error: function (error) {
    if (error.status == 401) {
      if (document.cookie.includes("AuthToken")) {
        document.cookie =
          "AuthToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
      window.location.href = "/";
    }
  },
});

$("#logout-btn").click(function () {
  $.ajax({
    url: "http://localhost:5093/api/Authentication/logout",
    type: "POST",
    success: function () {
      document.cookie =
        "AuthToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    },
    error: function (error) {
      
    },
  });
  window.location.href = "/";
});
