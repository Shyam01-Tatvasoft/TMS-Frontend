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
  url: "http://localhost:5093/api/dashboard/dashboard",
  type: "GET",
  headers: {
    Authorization: "Bearer " + token,
  },
  success: function (response) {
    console.log(response);
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
      console.log(response.result.data);
      if (Array.isArray(response.result.data)) {
        const users = response.result.data;
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
      console.error("Error fetching users:", error);
    },
  });
}

function GetTaskTypes(id) {
  $.ajax({
    url: "http://localhost:5093/api/tasks/get-tasks",
    type: "GET",
    success: function (response) {
      console.log(response);
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
      console.error("Error fetching tasks:", error);
    },
  });
}

function editTask(taskId) {
  $("#taskForm")[0].reset();
  $("#taskId").val(taskId);
  $("#userId").empty();
  $("#taskType").empty();
  $(".text-danger").text("");

  $.ajax({
    url: "http://localhost:5093/api/tasks/" + taskId,
    type: "GET",
    success: async function (response) {
      console.log(response);
      if (response) {
        $("#taskModalLabel").text("Edit Task");
        $("#taskId").val(response.id);
        $("#userId").val(response.fkUserId);
        $("#userId").attr("disabled", true);
        $("#taskType").val(response.fkTaskId);
        $("#taskType").attr("disabled", true);
        $("#taskType").trigger("change");
        $("#priority").val(response.priority);
        $("#priority").attr("disabled", true);
        $("#dueDate").val(
          new Date(response.dueDate).toISOString().substring(0, 10)
        );
        $("#description").val(response.description);
        $("#status").val(response.status);
        
        await GetAllUsers(response.fkUserId);
        await GetTaskTypes(response.fkTaskId);
        await GetSubTask(response.fkTaskId)
        $("#subTaskType").attr("disabled", true);
        $("#subTaskType").val(response.fkSubtaskId);
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
        }

        $("#taskModal").modal("show");
      }
    },
    error: function (error) {
      console.error("Error fetching tasks:", error);
    },
  });
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
      console.log(response);
      if (Array.isArray(response)) {
        const subTasks = response;
        const selectSubTask = $("#subTaskType");
        selectSubTask.empty();
        selectSubTask.append('<option value="" hidden>Select Sub Task</option>');
        subTasks.forEach((subTask) => {
          selectSubTask.append(
            `<option value="${subTask.id}">${subTask.name}</option>`
          );
        });
      }
    },
    error: function (error) {
      console.error("Error fetching subTasks:", error);
    },
  });
});

function GetSubTask(id)
{
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
      console.log(response);
      if (Array.isArray(response)) {
        const subTasks = response;
        const selectSubTask = $("#subTaskType");
        selectSubTask.empty();
        selectSubTask.append('<option value="" hidden>Select Sub Task</option>');
        subTasks.forEach((subTask) => {
          selectSubTask.append(
            `<option value="${subTask.id}">${subTask.name}</option>`
          );
        });
      }
    },
    error: function (error) {
      console.error("Error fetching subTasks:", error);
    },
  });
}

// Data Table
// new DataTable('#taskTable', {
//   ordering: false,
//  pagingType: 'simple',
//  dom: "<'row'<'col-sm-6 col-offset-sm-6'f>>" +
//      "<'row'<'col-sm-12'tr>>" +
//      "<'row d-flex justify-content-end align-items-center'<'col-auto'l><'col-auto'i><'col-auto'p>>",
//  language: {
//      info: 'Showing _START_ - _END_ of _TOTAL_ ',
//      lengthMenu: '<select>' +
//          '<option value="5">5</option>' +
//          '<option value="10">10</option>' +
//          '<option value="15">15</option>' +
//          '</select>'
//  },
//  pageLength: 5
// });

function GetAllTasks() {
  $.ajax({
    url: "http://localhost:5093/api/tasks",
    type: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
    success: function (response) {
      console.log(response);
      if (Array.isArray(response)) {
        const tasks = response;

        const tableBody = $("#taskTable tbody");
        tableBody.empty(); // Clear existing rows
        tasks.forEach((task) => {
          const row = `
            <tr>
              <td>${task.taskName}</td>
              <td>${task.subTaskName}</td>
              <td>${task.userName}</td>
              <td>${task.description}</td>
              <td>${new Date(task.dueDate).toLocaleDateString()}</td>
              <td>${task.status}</td>
              <td>${task.priority}</td>
              <td class="text-center">
                <button class="btn border-0 p-0" onclick="editTask(${task.id})">
                  <i class="fa-solid fa-pen"></i>
                </button>
              </td>
            </tr>
          `;
          tableBody.append(row);
        });
      }
    },
    error: function (error) {
      if (error.status == 401 || error.status == 403) {
        document.cookie =
          "AuthToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "/";
      }
    },
  });
}
GetAllTasks();

$("#addTaskButton").click(function () {
  $("#taskModal").modal("show");
  $("#taskForm")[0].reset();
  $("#priority").attr("disabled", false);
  $("#taskType").attr("disabled", false);
  $("#userId").attr("disabled", false);
  
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
    success: function (response) {
      $("#taskModal").modal("hide");
      toastr.success(
        isEdit ? "Task updated successfully!" : "Task added successfully!"
      );
      GetAllTasks();
    },
    error: function (xhr) {
      console.log(xhr.responseText)
      // alert(xhr.responseText || "Error saving task");
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
