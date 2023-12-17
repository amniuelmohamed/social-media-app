const urlParams = new URLSearchParams(window.location.search);
const postId = urlParams.get("id");

/* ================== GET POST BY ID ================== */
const getPostById = async (id) => {
    toggleLoader(true);
    const url = `${baseUrl}/posts/${id}`;
    const response = await axios.get(url);
    const post = response.data.data;

    try {
        // Check the title
        const postTitle = post.title ? post.title : "";

        // Check the images
        let avatarImg = post.author.profile_image;
        let postImg = post.image;

        await isNotImgUrl(avatarImg).then((res) => {
            res && (avatarImg = "https://placehold.co/40");
        });

        await isNotImgUrl(postImg).then((res) => res && (postImg = null));

        // Dealing With Tags
        post.tags.push({ name: "economy" });
        post.tags.push({ name: "culture" });

        let tagsContent = "";
        post.tags.map(
            (tag) =>
                (tagsContent += `<span class='rounded-5 bg-secondary text-light px-3 py-1'>${tag.name}</span>`)
        );

        // Dealing With Comments
        let commentsContent = "";
        for (const comment of post.comments) {
            let commentAuthorImg = comment.author.profile_image;
            await isNotImgUrl(commentAuthorImg).then(
                (res) => res && (commentAuthorImg = "https://placehold.co/40")
            );

            commentsContent += `<div
                                    class="comment px-4 py-3"
                                    style="
                                        background-color: darkslategray;
                                        color: white;
                                        border-bottom: 1px solid #ddd;
                                    "
                                >
                                    <div class="comment-author">
                                        <img
                                            src=${commentAuthorImg}
                                            alt="comment author image"
                                            class="rounded-circle"
                                            style="
                                                width: 40px;
                                                height: 40px;
                                                object-fit: cover;
                                            "
                                        />
                                        <span>${comment.author.username}</span>
                                    </div>
                                    <p class="mt-2 mb-0">${comment.body}</p>
                                </div>`;
        }

        // Add the edit button
        const loggedInUser = JSON.parse(localStorage.getItem("user"));
        const isMyPost = loggedInUser && loggedInUser.id === post.author.id;

        // Create a post card
        const postCard = `
            <div class="card mb-3 shadow-sm">
            <div
                class="card-header d-flex align-items-center justify-content-between gap-2"
            >
                <div class="d-flex align-items-center gap-2" style="cursor: pointer;" onclick="gotoProfilePage(${
                    post.author.id
                })">
                    <img
                        src=${avatarImg}
                        alt="avatar"
                        class="rounded-circle"
                        style="width: 40px; height: 40px; object-fit: cover;"
                    />
                    <div class="post-owner fw-bold">
                        @<span class="username">${post.author.username}</span>
                    </div>
                </div>
                <div>
                ${
                    isMyPost
                        ? `<button class="edit-post-btn btn btn-secondary" onclick="showEditPostModal('${encodeURIComponent(
                              JSON.stringify(post)
                          )}')">Edit</button>
                          <button class="delete-post-btn btn btn-danger" onclick="showDeletePostModal(${
                              post.id
                          })">Delete</button>
                          `
                        : ""
                }
                </div>
            </div>
                ${
                    postImg
                        ? `<img
                        src=${postImg}
                        class="card-img-top rounded-0"
                        alt="post image"
                        style="max-height: 500px; object-fit: cover;"
                    />`
                        : ""
                }
                <div class="card-body pt-1">
                    <p class="card-text">
                        <small class="text-body-secondary"
                            >${post.created_at}</small
                        >
                    </p>
                    <h5 class="card-title">${postTitle}</h5>
                    <p class="card-text">${post.body}</p>
                    <hr />
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="post-comments-count d-flex gap-2">
                            <i class="bi bi-chat-left-quote"></i>
                            <div style="margin-top: -2px">
                                (<span class="comments-count">${
                                    post.comments_count
                                }</span>)
                                Comments
                            </div>
                        </div>
                        <div class="post-tags d-flex gap-2">
                            ${tagsContent}
                        </div>
                    </div>
                </div>
                <div class="post-comments">
                    ${commentsContent}
                </div>
                <div class="add-comment">
                    <div class="input-group my-3 px-3">
                        <input
                            id="add-comment-input"
                            type="text"
                            class="form-control"
                            placeholder="Add comment ..."
                            aria-label="Add comment ..."
                            aria-describedby="comment-addon"
                        />
                        <button
                            class="btn btn-outline-secondary"
                            type="button"
                            id="comment-addon"
                            onclick="addComment()"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.querySelector(".post").innerHTML = postCard;
        setupUI();
    } catch (error) {
        console.log(error);
    } finally {
        toggleLoader(false);
    }
};
/* ================== GET POST BY ID ================== */

getPostById(postId);

/* ================== ADD COMMENT ================== */
const addComment = async () => {
    toggleLoader(true);
    const commentText = document.getElementById("add-comment-input").value;
    if (commentText.trim() === "") {
        // Show the alert
        appendAlert("You must write something!", "danger");
        return;
    }

    const url = `${baseUrl}/posts/${postId}/comments`;

    const params = {
        body: commentText,
    };

    const headers = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    };

    try {
        await axios.post(url, params, {
            headers: headers,
        });

        // Show the success alert
        appendAlert("Comment Added Successfully!", "success");

        getPostById(postId);
    } catch (error) {
        // Show error alert
        appendAlert(error.response.data.message, "danger");
    } finally {
        toggleLoader(false);
    }
};
/* ================== ADD COMMENT ================== */
