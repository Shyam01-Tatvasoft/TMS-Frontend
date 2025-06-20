var actionId = new URLSearchParams(window.location.search).get("actionId");
var role = document.cookie.split('; ').find(row => row.startsWith('role=')).split('=')[1];
$(async function () {
    if (actionId) {
        loadTaskActionDetails(actionId);
    } else {
        toastr.error("No action ID provided.");
    }
});

var taskActionDetails = null;
function loadTaskActionDetails(actionId) {
    $.ajax({
        url: `http://localhost:5093/api/task-action/${actionId}`,
        type: "GET",
        headers: {
            Authorization: "Bearer " + authToken,
        },
        success: function (response) {
            $("#user-full-name").text(response.userName);
            $("#task-name").text(response.taskName);
            $("#submitted-at").text(new Date(response.submittedAt).toLocaleString());
            taskActionDetails = response;
            const submittedData = response.submittedData;
            if (Array.isArray(submittedData)) {
                $("#fileListDetails").show();
                $("#uploadedFilesList").empty();

                submittedData.forEach(f => {
                    $("#uploadedFilesList").append(`
                        <li>
                            ${f.OriginalFileName} (${(f.Size / (1024 * 1024)).toFixed(2)} MB)
                            <button onClick="downloadFile('${f.StoredFileName}','${f.OriginalFileName}')" class="btn"><i class="fa-solid fa-download"></i></button>
                            </li>
                            `);
                        });
                    $("#uploadedFilesList").append(`
                        <button onClick="downloadZip(${response.id})" class="btn"><i class="fa-solid fa-download"></i>(Download Zip)</button>
                        `);
            } else if (submittedData.Email) {
                $("#emailDetails").show();
                $("#emailTo").text(submittedData.Email);
                $("#emailSubject").text(submittedData.Subject);
            }
            
            if(response.status == "Review" && role == "Admin")
            {
              $("#task-review-buttons").append(`<div class="btn btn-outline-success me-2" id="approve-task">Approve</div>`);
              $("#task-review-buttons").append(`<div class="btn btn-outline-primary" id="reassign-task">Reassign</div>`);
            }
        },
        error: function (error) {
            if( error.status == 401) {
                window.location.href = "../templates/Forbidden.html";
            }
            toastr.error("Error loading task action details", error);
        }
    });
}

function downloadFile(storedFileName, originalFileName) {
    fetch(`http://localhost:5093/api/task-action/download?fileName=${storedFileName}`)
        .then(response => {
            if (!response.ok) throw new Error("Download failed");
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = originalFileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        })
        .catch(err => alert("Error downloading file: " + err.message));
    
}

function downloadZip(id)
{
    fetch(`http://localhost:5093/api/task-action/download-zip/${id}/${taskActionDetails.fkUserId}`)
        .then(response => {
            if (!response.ok) throw new Error("Download failed");
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `TaskData_${id}.zip`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        })
        .catch(err => alert("Error downloading zip file: " + err.message));
}

$(document).on('click',"#reassign-task",function(){
    $("#reassign-user-id").val(taskActionDetails.fkUserId);
    $("#reassign-task-id").val(taskActionDetails.fkTaskId);
    $("#reassignTaskModal").modal('show')
});
$(document).on('click',"#approve-task",function(){
    console.log("log")
    $("#approveTaskModal").modal('show')
})

$(document).on('click',"#approve-task-btn",function(){
    $.ajax({
        url: `http://localhost:5093/api/tasks/approve/${taskActionDetails.fkTaskId}`,
        type: "POST",
        headers: {
            Authorization: "Bearer " + authToken,
        },
        success: function (response) {
            toastr.success("Task approved successfully.");
            $("#approveTaskModal").modal('hide');
            GetNotifications();
            loadTaskActionDetails(actionId)
        },
        error: function (error) {
            toastr.error("Error approving task", error);
        }
    });
})

$("#reassign-task-form").submit(function (e) {
    e.preventDefault();
    var formdata = new FormData(this);
    $.ajax({
        url: "http://localhost:5093/api/tasks/reassign",
        type: "POST",
        headers: {
            Authorization: "Bearer " + authToken,
        },
        data: formdata,
        processData: false,
        contentType: false,
        success: function (response) {
            toastr.success("Task reassigned successfully.");
            $("#reassignTaskModal").modal('hide');
            // GetNotifications();
            debugger
            loadTaskActionDetails(actionId);
        },
        error: function (error) {
            toastr.error("Error reassigning task", error);
        }
    });
});