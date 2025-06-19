var actionId = new URLSearchParams(window.location.search).get("actionId");
$(function () {
    console.log("Action ID:", actionId);
    if (actionId) {
        loadTaskActionDetails(actionId);
    } else {
        toastr.error("No action ID provided.");
        // window.location.href = "/templates/TaskReview.html";
    }
});


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

            console.log(response)
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
        },
        error: function (error) {
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
    fetch(`http://localhost:5093/api/task-action/download-zip/${id}`)
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