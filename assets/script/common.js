$(function () {
    $("#head-placeholder").load("../partials/header.html");
    $("#footer-placeholder").load("../partials/footer.html");
  });

  function getAuthToken() {
    const match = document.cookie.match(/(^|;)\s*AuthToken=([^;]+)/);
    return match ? match[2] : null;
  }
