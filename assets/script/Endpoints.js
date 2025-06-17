const BACKEND_URL = "http://localhost:5093/api/";

const API_ENDPOINTS = {
    GetNotifications: BACKEND_URL + "notification/", 
}


// function apiCall({ url, method = "GET", data = {}, headers = {}, success, error }) {
//     $.ajax({
//         url,
//         method,
//         data,
//         headers: {
//             "Content-Type": "application/json",
//             ...headers
//         },
//         success,
//         error
//     });
// }

// apiCall({
//     url: API_ROUTES.createUser,
//     method: "POST",
//     data: JSON.stringify({ name: "Shyam", email: "test@mail.com" }),
//     success: function (res) {
//         console.log("User created", res);
//     },
//     error: function (err) {
//         console.log("Error creating user", err);
//     }
// });