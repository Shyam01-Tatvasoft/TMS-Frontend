const AdminStatus = [
  { label: "Pending", value: "1" },
  { label: "In Progress", value: "2" },
  { label: "On Hold", value: "4" },
  { label: "Cancelled", value: "5" },
];
const UserStatus = [
  { label: "In Progress", value: "2" },
  { label: "On Hold", value: "4" },
];
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
  url: "http://localhost:5093/api/dashboard",
  type: "GET",
  headers: {
    Authorization: "Bearer " + token,
  },
  success: function (response) {
    if (response.result.role == "User") {
      $("#addTaskButton").hide();
    }
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
    url: "http://localhost:5093/api/authentication/logout",
    type: "POST",
    success: function () {
      document.cookie =
        "AuthToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    },
    error: function (error) {},
  });
  window.location.href = "/";
});

function GetAllUsers(id) {
  $.ajax({
    url: "http://localhost:5093/api/user",
    type: "GET",
    success: function (response) {
      if (Array.isArray(response)) {
        const users = response;
        const userSelect = $("#userId");
        userSelect.empty();
        userSelect.append('<option value="" hidden>Select User</option>');
        users.forEach((user) => {
          userSelect.append(
            `<option value="${user.id}">${user.firstName} ${user.lastName}</option>`
          );
        });
        if (id) {
          userSelect.val(id);
        }
      }
    },
    error: function (error) {
      toastr.error("Error fetching users:", error);
    },
  });
}

function GetTaskTypes(id) {
  $.ajax({
    url: "http://localhost:5093/api/tasks/get-tasks",
    type: "GET",
    success: function (response) {
      if (Array.isArray(response)) {
        const tasks = response;
        const taskSelect = $("#taskType");
        taskSelect.empty();
        taskSelect.append('<option value="" hidden>Select Task</option>');
        tasks.forEach((task) => {
          taskSelect.append(`<option value="${task.id}">${task.name}</option>`);
        });
        if (id) {
          taskSelect.val(id);
          taskSelect.trigger("change");
        }
      }
    },
    error: function (error) {
      toastr.error("Error fetching tasks:", error);
    },
  });
}

function editTask(taskId) {
  $("#taskForm")[0].reset();
  $("#taskId").val(taskId);
  $("#userId").empty();
  $("#taskType").empty();
  $(".text-danger").text("");
  PopulateStatusDropdowns();
  $.ajax({
    url: "http://localhost:5093/api/tasks/" + taskId,
    type: "GET",
    success: async function (response) {
      if (response) {
        $("#taskModalLabel").text("Edit Task");
        $("#taskId").val(response.id);
        $("#userId").val(response.fkUserId);
        $("#userId").attr("disabled", true);
        $("#taskType").val(response.fkTaskId);
        $("#taskType").attr("disabled", true);
        $("#taskType").trigger("change");
        $("#priority").val(response.priority);
        $("#dueDate").val(
          new Date(response.dueDate).toISOString().substring(0, 10)
        );
        $("#dueDate").removeAttr("min");

        $("#description").val(response.description);
        $("#status").val(response.status);
        if (userProfile.role == "User") {
          $("#priority").attr("disabled", true);
          $("#dueDate").attr("disabled", true);
          $("#description").attr("disabled", true);
        }
        await GetAllUsers(response.fkUserId);
        await GetTaskTypes(response.fkTaskId);
        await GetSubTask(response.fkTaskId, response.fkSubTaskId);
        if (response.fkTaskId == "2") {
          $("#dynamicFields").empty();
          $("#dynamicFields").append(`
            <div class="col-md-6">
            <div class="form-floating">
            <select class="form-select" id="length" name="length">
              <option value="1" >1</option>
              <option value="2" >2</option>
              <option value="3" >3</option>
              <option value="4" >4</option>
              <option value="5" >5</option>
              <option value="6" >6</option>
              <option value="7" >7</option>
              <option value="8" >8</option>
              <option value="9" >9</option>
              <option value="10" >10</option>
            </select>
            <label for="length" class="form-label">Length</label>
              <div class="text-danger" id="lengthError"></div>
            </div>
            </div>
            <div class="col-md-6">
            <div class="form-floating">
            <select class="form-select" id="size" name="size">
            <option value="1">1MB</option>
            <option value="5">5MB</option>
            <option value="10">10MB</option>
            </select>
            <label for="size" class="form-label">Size</label>
              <div class="text-danger" id="sizeError"></div>
            </div>
            </div>
          `);
          $("#length").val(response.taskData.length);
          $("#size").val(response.taskData.size);
          if (userProfile.role == "User") {
            $("#length").attr("disabled", true);
            $("#size").attr("disabled", true);
          }
        }

        $("#taskModal").modal("show");
      }
    },
    error: function (error) {
      toastr.error("Error fetching task:", error);
    },
  });
}

function PopulateStatusDropdowns() {
  if (userProfile.role == "User") {
    $("#status").empty();
    $("#status").append('<option value="" hidden>Select Status</option>');
    UserStatus.forEach((status) => {
      $("#status").append(
        `<option value="${status.value}">${status.label}</option>`
      );
    });
  } else {
    $("#status").empty();
    $("#status").append('<option value="" hidden>Select Status</option>');
    AdminStatus.forEach((status) => {
      $("#status").append(
        `<option value="${status.value}">${status.label}</option>`
      );
    });
  }
}

$("#taskType").change(function () {
  $.ajax({
    url: "http://localhost:5093/api/tasks/get-sub-tasks/" + $(this).val(),
    type: "GET",
    success: function (response) {
      $("#subTaskField").empty();
      $("#subTaskField").append(`
        <div class="mb-md-4">
        <div class="form-floating">
        <select class="form-select" id="subTaskType" name="subTaskType">
        <option value="" hidden>Select Sub Task</option>
        </select>
        <label for="subTaskType" class="form-label">Sub Task</label>
          <div class="text-danger" id="subTaskTypeError"></div>
        </div>
        </div>
      `);
      if (Array.isArray(response)) {
        const subTasks = response;
        const selectSubTask = $("#subTaskType");
        selectSubTask.empty();
        selectSubTask.append(
          '<option value="" hidden>Select Sub Task</option>'
        );
        subTasks.forEach((subTask) => {
          selectSubTask.append(
            `<option value="${subTask.id}">${subTask.name}</option>`
          );
        });
      }
    },
    error: function (error) {
      toastr.error("Error fetching subTasks:", error);
    },
  });
});

function GetSubTask(id, subTaskId) {
  $.ajax({
    url: "http://localhost:5093/api/tasks/get-sub-tasks/" + id,
    type: "GET",
    success: function (response) {
      $("#subTaskField").empty();
      $("#subTaskField").append(`
        <div class="mb-md-4">
        <div class="form-floating">
        <select class="form-select" id="subTaskType" name="subTaskType">
        <option value="" hidden>Select Sub Task</option>
        </select>
        <label for="subTaskType" class="form-label">Sub Task</label>
          <div class="text-danger" id="subTaskTypeError"></div>
        </div>
        </div>
      `);
      if (Array.isArray(response)) {
        const subTasks = response;
        const selectSubTask = $("#subTaskType");
        selectSubTask.empty();
        selectSubTask.append(
          '<option value="" hidden>Select Sub Task</option>'
        );
        subTasks.forEach((subTask) => {
          selectSubTask.append(
            `<option value="${subTask.id}">${subTask.name}</option>`
          );
        });
      }
      if (subTaskId) {
        $("#subTaskType").val(subTaskId);
        $("#subTaskType").attr("disabled", true);
      }
    },
    error: function (error) {
      toastr.error("Error fetching subTasks:", error);
    },
  });
}

var table;
$(document).ready(function () {
  table = $("#taskTable").DataTable({
    processing: true,
    serverSide: true,
    ordering: true,
    responsive: true,
    pagingType: "simple_numbers",
    ajax: {
      url: "http://localhost:5093/api/tasks/get-tasks",
      type: "POST",
      headers: {
        Authorization: "Bearer " + token,
      },
      data: function (d) {
        return d;
      },
    },
    columns: [
      { data: "taskName", orderable: false },
      { data: "subTaskName", orderable: false },
      {
        data: "userName",
        orderable: true,
        render: function (data) {
          return `<span class="fw-bold">${data}</span>`;
        },
      },
      { data: "description", orderable: false },
      {
        data: "dueDate",
        render: function (data) {
          return new Date(data).toLocaleDateString();
        },
      },
      {
        data: "status",
        orderable: false,
        render: function (data) {
          return `
            <span class="status-${data.replace(/\s+/g, "")}">${data}</span>
            `;
        },
      },
      { data: "priority", orderable: false },
      {
        data: "id",
        orderable: false,
        className: "text-center",
        render: function (data, type, row) {
          if (row.status === "Completed" || row.status === "Cancelled") {
            return `<button class="btn border-0 p-0 me-md-1" onclick="seeDetails()" title="see details"><i class="fa-solid fa-eye"></i></button>`;
          } else if (
            row.status == "In Progress" &&
            userProfile.role == "User"
          ) {
            if (row.taskName == "Upload File") {
              return `<button class="btn border-0 p-0 me-md-1" onclick="PerformTask(${data}, '${row.taskName}')" title="upload file"><i class="fa-solid fa-upload"></i></button>
                <button class="btn border-0 p-0" onclick="editTask(${data})" title="edit task"> <i class="fa-solid fa-pen"></i> </button>`;
            } else if (row.taskName == "Send Email") {
              return `<button class="btn border-0 p-0 me-md-1" onclick="PerformTask(${data},'${row.taskName}')" title="send mail"><i class="fa-solid fa-envelope"></i></button>
              <button class="btn border-0 p-0" onclick="editTask(${data})" title="edit task"> 
              <i class="fa-solid fa-pen"></i>
            </button>`;
            }
          } else {
            return `
            <button class="btn border-0 p-0" onclick="editTask(${data})" title="edit task"> 
              <i class="fa-solid fa-pen"></i>
            </button>`;
          }
        },
      },
    ],
    pageLength: 5,
    dom:
      "<'row'<'col-auto'i><'col text-end my-1'f>>" +
      "<'row'<'col-sm-12'tr>>" +
      "<'row d-flex justify-content-between'<'col-auto'l><'col-auto'p>>",
    language: {
      info: "Showing _START_ - _END_ of _TOTAL_ ",
      lengthMenu:
        "Showing <select>" +
        '<option value="5">5</option>' +
        '<option value="10">10</option>' +
        '<option value="15">15</option>' +
        "</select> records per page",
      search: "",
      searchPlaceholder: "Search tasks...",
    },
  });

  $("#taskTable_filter input").addClass("fs-6 shadow-none ");
});

$("#addTaskButton").click(function () {
  $("#taskModal").modal("show");
  $("#taskForm")[0].reset();
  $("#priority").attr("disabled", false);
  $("#taskType").attr("disabled", false);
  $("#userId").attr("disabled", false);
  $("#dueDate").attr("disabled", false);
  $("#description").attr("disabled", false);
  var today = new Date();
  PopulateStatusDropdowns();
  //disable past dates
  document
    .getElementById("dueDate")
    .setAttribute("min", today.toISOString().split("T")[0]);
  $("#subTaskField").empty();
  GetAllUsers();
  GetTaskTypes();
  $("#taskId").val("");
  $("#taskModalLabel").text("Add Task");
  $("#dynamicFields").empty();
  $(".text-danger").text("");
});

$("#taskForm").validate({
  rules: {
    userId: {
      required: true,
    },
    taskType: {
      required: true,
    },
    subTaskType: {
      required: true,
    },
    priority: {
      required: true,
    },
    status: {
      required: true,
    },
    dueDate: {
      required: true,
      date: true,
    },
    description: {
      required: true,
      maxlength: 500,
    },
  },
  messages: {
    userId: {
      required: "User is required",
    },
    taskType: {
      required: "Task type is required",
    },
    subTaskType: {
      required: "Sub Task is required",
    },
    priority: {
      required: "Priority is required",
    },
    status: {
      required: "Status is required",
    },
    dueDate: {
      required: "Due Date is required",
      date: "Please enter a valid date",
    },
    description: {
      required: "Description is required",
      maxlength: "Description cannot exceed 500 characters",
    },
  },
  errorPlacement: function (error, element) {
    error.appendTo(element.parent().find(".text-danger"));
  },
});

$("#taskForm").on("submit", function (event) {
  event.preventDefault();
  const isEdit = $("#taskId").val() !== "";
  const method = isEdit ? "PUT" : "POST";
  const taskType = $("#taskType").val();
  var data = {};
  var TaskData = {};

  if (isEdit) {
    data = {
      Id: $("#taskId").val(),
      Description: $("#description").val(),
      TaskData: TaskData,
      DueDate: $("#dueDate").val(),
      Status: $("#status").val(),
      Priority: $("#priority").val(),
    };
  } else {
    data = {
      FkUserId: $("#userId").val(),
      FkTaskId: $("#taskType").val(),
      FkSubtaskId: $("#subTaskType").val(),
      TaskData: TaskData,
      DueDate: $("#dueDate").val(),
      Priority: $("#priority").val(),
      Status: $("#status").val(),
      Description: $("#description").val(),
    };
  }

  if (taskType == "2") {
    data.TaskData.length = $("#length").val();
    data.TaskData.size = $("#size").val();
  }

  $.ajax({
    url: "http://localhost:5093/api/tasks",
    type: method,
    contentType: "application/json",
    data: JSON.stringify(data),
    headers: {
      Authorization: "Bearer " + token,
    },
    success: function (response) {
      $("#taskModal").modal("hide");
      toastr.success(
        isEdit ? "Task updated successfully!" : "Task added successfully!"
      );
      table.ajax.reload();
    },
    error: function (xhr) {
      if (xhr.status != 400) {
        toastr.clear();
        toastr.error("Error while assign task.");
      } else {
        toastr.clear();
        toastr.error(xhr.responseText);
      }
    },
  });
});

$(document).ready(function () {
  $("#taskType").on("change", function () {
    const taskType = $(this).val();
    const $dynamic = $("#dynamicFields");
    $dynamic.empty();

    if (taskType === "2") {
      $dynamic.append(`
        <div class="col-md-6">
        
        <div class="form-floating">
        <select class="form-select" id="length" name="length">
        <option value="1" selected>1</option>
        <option value="2">2</option>
        <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
            </select>
            <label for="length" class="form-label">Length</label>
          <div class="text-danger" id="lengthError"></div>
        </div>
        </div>
        <div class="col-md-6">
        <div class="form-floating">
        <select class="form-select" id="size" name="size">
        <option value="1" selected>1MB</option>
        <option value="5">5MB</option>
        <option value="10">10MB</option>
        </select>
        <label for="size" class="form-label">Size</label>
          <div class="text-danger" id="sizeError"></div>
        </div>
        </div>
      `);
    }
  });
});

$("#notification-bell").on("click", function () {
  $("#notification-indicator").hide();
});

function PerformTask(id, taskName) {
  if (userProfile.role == "User" && taskName == "Upload File") {
    ManageFileUpload(id);
  } else {
    ManageEmailSend(id);
  }
}

var taskData;
function ManageFileUpload(id) {
  $.ajax({
    url: "http://localhost:5093/api/tasks/" + id,
    type: "GET",
    success: function (response) {
      taskData = response;
      console.log(taskData);
      $("#file-upload-modal").modal("show");
    },
    error: function (error) {
      toastr.error("Error fetching task:", error);
    },
  });
}

$("#fileUploadForm").on("submit", function (e) {
  e.preventDefault();

  const files = $("#fileInput")[0].files;

  if (files.length > parseInt(taskData.taskData.length)) {
    alert(`Maximum ${taskData.length} files allowed.`);
    return;
  }

  for (let file of files) {
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!taskData.fileTypes.includes(ext)) {
      alert(`File type ${ext} not allowed.`);
      return;
    }

    if (file.size > taskData.size * 1024 * 1024) {
      alert(`${file.name} exceeds ${taskData.size} MB size.`);
      return;
    }
  }

  let formData = new FormData(this);
  for (let i = 0; i < files.length; i++) {
    formData.append("files", files[i]);
  }
});

function ManageEmailSend() {
  $("#send-mail-modal").modal('show')
}
