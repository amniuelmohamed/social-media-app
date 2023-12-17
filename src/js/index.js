/* ================== GENERAL ================== */
const baseUrl = "https://tarmeezacademy.com/api/v1";
let currentPage = 1;
let lastPage = null;
/* ================== GENERAL ================== */

// Function to check the img url, and return a true promise if the url is NOT FOUND
function isNotImgUrl(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve(false);
        img.onerror = () => resolve(true);
    });
}

/* ================== LOGIN ================== */
// It called from index.html
const login = async () => {
    toggleLoader(true);
    const url = `${baseUrl}/login`;

    const username = document.getElementById("usernameLogin").value;
    const password = document.getElementById("passwordLogin").value;

    const params = {
        username: username,
        password: password,
    };

    try {
        const response = await axios.post(url, params);
        const userData = response.data;

        // Hide the login modal
        document.querySelector("#loginModal .close-btn").click();

        // Save to local storage
        localStorage.setItem("token", userData.token);
        localStorage.setItem("user", JSON.stringify(userData.user));

        // Change the UI
        setupUI();
        setupEditDeleteVisibility();

        // Show the success alert
        appendAlert("Logged In Successfully!", "success");
    } catch (error) {
        // Show error alert
        appendAlert(error.response.data.message, "danger");
    } finally {
        toggleLoader(false);
    }
};
/* ================== LOGIN ================== */

/* ================== LOGOUT ================== */
// It called from index.html
const logout = () => {
    // Remove user data from local storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Change the UI
    setupUI();
    setupEditDeleteVisibility();

    // Show the success alert
    appendAlert("Logged Out Successfully!", "success");

    const url = `/`;
    window.location.href = url;
};
/* ================== LOGOUT ================== */

/* ================== REGISTER ================== */
// It called from index.html
const register = async () => {
    toggleLoader(true);
    const url = `${baseUrl}/register`;

    const name = document.getElementById("nameRegister").value;
    const email = document.getElementById("emailRegister").value;
    const avatar = document.getElementById("avatarRegister").files[0];
    const username = document.getElementById("usernameRegister").value;
    const password = document.getElementById("passwordRegister").value;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("image", avatar);
    formData.append("username", username);
    formData.append("password", password);

    try {
        const response = await axios.post(url, formData);
        const userData = response.data;

        // Hide the register modal
        const registerModal = bootstrap.Modal.getInstance("#registerModal");
        registerModal.hide();

        // Save to local storage
        localStorage.setItem("token", userData.token);
        localStorage.setItem("user", JSON.stringify(userData.user));

        // Change the UI
        setupUI();

        // Show the success alert
        appendAlert("Registered Successfully!", "success");
    } catch (error) {
        // Show error alert
        appendAlert(error.response.data.message, "danger");
    } finally {
        toggleLoader(false);
    }
};
/* ================== REGISTER ================== */

/* ================== UPLOAD POST ================== */
// It called from index.html
const uploadPost = async () => {
    toggleLoader(true);
    const title = document.getElementById("postModalTitle").value;
    const body = document.getElementById("postModalBody").value;
    const image = document.getElementById("postModalImage").files[0];

    const formData = new FormData();
    formData.append("title", title);
    formData.append("body", body);
    image && formData.append("image", image);

    const config = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    };

    const postId = document.getElementById("postModalHiddenId").value;

    try {
        let url = `${baseUrl}/posts`;

        if (postId !== "") {
            formData.append("_method", "put");
            url += `/${postId}`;
        }

        await axios.post(url, formData, {
            headers: config,
        });

        postId === ""
            ? appendAlert("Post Added Successfully!", "success")
            : appendAlert("Post Updated Successfully!", "success");
    } catch (error) {
        appendAlert(error.response.data.message, "danger");
    } finally {
        toggleLoader(false);
    }

    // Hide the register modal
    const postModal = bootstrap.Modal.getInstance("#postModal");
    postModal.hide();

    location.reload();

    // Set the post id to empty
    document.getElementById("postModalHiddenId").value = "";
};
/* ================== UPLOAD POST ================== */

/* ================== DELETE POST ================== */
// It called from index.html
const deletePost = async () => {
    toggleLoader(true);
    const config = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    };

    const postId = document.getElementById("deletePostModalHiddenId").value;

    try {
        let url = `${baseUrl}/posts/${postId}`;

        await axios.delete(url, {
            headers: config,
        });

        appendAlert("Post Deleted Successfully!", "success");

        // Hide the delete post modal
        const postModal = bootstrap.Modal.getInstance("#deletePostModal");
        postModal.hide();

        const postsContainer = document.querySelector(".posts");
        if (postsContainer) {
            // Get all posts
            postsContainer.innerHTML = "";
            getPosts();
        } else {
            window.location.href = "/";
        }

        // Set the post id to empty
        document.getElementById("deletePostModalHiddenId").value = "";
    } catch (error) {
        appendAlert(error.response.data.message, "danger");
    } finally {
        toggleLoader(false);
    }
};
/* ================== DELETE POST ================== */

/* ================== SET UP UI ================== */
const setupUI = () => {
    const token = localStorage.getItem("token");
    const userInfos = JSON.parse(localStorage.getItem("user"));

    const profileNavItem = document.querySelector(".navbar .profile-nav-item");
    const loginBtn = document.querySelector(".navbar .user-actions .login-btn");
    const registerBtn = document.querySelector(
        ".navbar .user-actions .register-btn"
    );
    const logoutBtn = document.querySelector(
        ".navbar .user-actions .logout-btn"
    );
    const addPostBtn = document.querySelector(".add-post-btn");
    const userProfile = document.querySelector(
        ".navbar .user-actions .user-profile"
    );
    userProfile.innerHTML = "";

    const addCommentArea = document.querySelector(".post .add-comment");

    if (token === null) {
        // Hide the elements
        profileNavItem.style.display = "none";
        loginBtn.style.display = "block";
        registerBtn.style.display = "block";
        logoutBtn.style.display = "none";
        userProfile.style.display = "none";
        addPostBtn ? (addPostBtn.style.display = "none") : null;
        addCommentArea ? (addCommentArea.style.display = "none") : null;
    } else {
        // Show the elements
        profileNavItem.style.display = "block";
        loginBtn.style.display = "none";
        registerBtn.style.display = "none";
        logoutBtn.style.display = "block";
        addPostBtn ? (addPostBtn.style.display = "flex") : null;
        const avatar = document.createElement("img");
        avatar.style.width = "40px";
        avatar.style.height = "40px";
        avatar.style.borderRadius = "50%";
        avatar.style.cursor = "pointer";
        isNotImgUrl(userInfos.profile_image).then((res) =>
            res
                ? (avatar.src = "https://placehold.co/40")
                : (avatar.src = userInfos.profile_image)
        );
        userProfile.appendChild(avatar);
        userProfile.appendChild(document.createTextNode(userInfos.username));
        userProfile.style.display = "flex";
        addCommentArea ? (addCommentArea.style.display = "block") : null;
    }
};
/* ================== SET UP UI ================== */

// It called here to check after opening the website if the user still logged in
setupUI();

/* ================== SET UP EDIT DELETE BUTTONS VISIBILITY ================== */
const setupEditDeleteVisibility = () => {
    // Update for change the visibility of Edit and Delete buttons
    const postsContainer = document.querySelector(".posts");
    if (postsContainer) {
        postsContainer.innerHTML = "";
        getPosts();
    } else if (document.querySelector(".is-post-page")) {
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get("id");
        getPostById(postId);
    }
};
/* ================== SET UP EDIT DELETE BUTTONS VISIBILITY ================== */

/* ================== Show Alert ================== */
const appendAlert = (message, type) => {
    const alertPlaceholder = document.createElement("div");
    alertPlaceholder.id = "alertPlaceholder";
    alertPlaceholder.classList.add("fade", "show");
    const wrapper = document.createElement("div");
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        "</div>",
    ].join("");

    alertPlaceholder.append(wrapper);
    document.body.appendChild(alertPlaceholder);

    // Hiding the alert after 2s
    const alertToHide = bootstrap.Alert.getOrCreateInstance(alertPlaceholder);
    setTimeout(() => {
        alertToHide.close();
    }, 2000);
};
/* ================== Show Alert ================== */

/* ================== SHOW EDIT POST MODAL ================== */
const showEditPostModal = (post) => {
    post = JSON.parse(decodeURIComponent(post));
    document.getElementById("postModalHiddenId").value = post.id;
    setupPostModalUI(post);
    const postModal = new bootstrap.Modal("#postModal", {});
    postModal.toggle();
};
/* ================== SHOW EDIT POST MODAL ================== */

/* ================== SHOW DELETE POST MODAL ================== */
const showDeletePostModal = (postId) => {
    document.getElementById("deletePostModalHiddenId").value = postId;
    const postModal = new bootstrap.Modal("#deletePostModal", {});
    postModal.toggle();
};
/* ================== SHOW DELETE POST MODAL ================== */

/* ================== SHOW ADD POST MODAL ================== */
const showAddPostModal = () => {
    document.getElementById("postModalHiddenId").value = "";
    setupPostModalUI();
};
/* ================== SHOW ADD POST MODAL ================== */

/* ================== SETUP POST MODAL UI ================== */
const setupPostModalUI = (post) => {
    const postId = document.getElementById("postModalHiddenId").value;
    if (postId === "") {
        // Add Post Case
        document.getElementById("postModalLabel").innerHTML = "Add New Post";
        document.getElementById("postModalTitle").value = "";
        document.getElementById("postModalBody").value = "";
        document.getElementById("postModalImage").value = "";
        document.getElementById("postModalBtn").innerHTML = "Add";
    } else {
        // Edit Post Case
        document.getElementById("postModalLabel").innerHTML = "Edit Post";
        document.getElementById("postModalTitle").value = post.title
            ? post.title
            : "";
        document.getElementById("postModalBody").value = post.body
            ? post.body
            : "";
        document.getElementById("postModalImage").value = "";
        document.getElementById("postModalBtn").innerHTML = "Update";
    }
};
/* ================== SETUP POST MODAL UI ================== */

/* ================== GO TO POST DETAILS ================== */
const gotoPostDetails = (id) => {
    const url = `/post.html?id=${id}`;
    window.location.href = url;
};
/* ================== GO TO POST DETAILS ================== */

/* ================== GO TO PROFILE PAGE ================== */
const gotoProfilePage = (id) => {
    const url = `/profile.html?id=${id}`;
    window.location.href = url;
};
/* ================== GO TO PROFILE PAGE ================== */

/* ================== TOGGLE LOADER ================== */
const toggleLoader = (show) => {
    const loader = document.getElementById("loader");
    show
        ? (loader.style.visibility = "visible")
        : (loader.style.visibility = "hidden");
};
/* ================== TOGGLE LOADER ================== */
