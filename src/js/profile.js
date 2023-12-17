/* ================== GET USER BY ID ================== */
const getUserById = async (id) => {
    toggleLoader(true);
    const url = `${baseUrl}/users/${id}`;
    const response = await axios.get(url);
    const user = response.data.data;

    try {
        // Get the username
        const username = user.username;

        // Get the posts count
        const postsCount = user.posts_count;

        // Get the comments count
        const commentsCount = user.comments_count;

        // Check the image
        let avatarImg = user.profile_image;
        await isNotImgUrl(avatarImg).then((res) => {
            res && (avatarImg = "https://placehold.co/40");
        });

        // Create the user infos section
        const userInfos = `
        <div
            class="user-infos d-flex align-items-center gap-4 bg-white shadow p-5"
        >
            <img
                class="rounded-circle"
                src=${avatarImg}
                alt="avatar"
                style="
                    width: 150px;
                    height: 150px;
                    border: 3px solid black;
                "
            />
            <span class="username flex-grow-1 fw-bold fs-3"
                >${username}</span
            >
            <div class="flex-grow-1">
                <p>
                    <span style="font-size: 4rem; font-weight: 100"
                        >${postsCount}</span
                    >Posts
                </p>
                <p>
                    <span style="font-size: 4rem; font-weight: 100"
                        >${commentsCount}</span
                    >Comments
                </p>
            </div>
        </div>
        `;

        document.querySelector(".user-infos-wrapper").innerHTML = userInfos;
        document.querySelector(
            ".user-posts-title"
        ).innerHTML = `<h2 class="mt-5 mb-3"><span>${username}</span> Posts</h2>`;
    } catch (error) {
        console.log(error.response.data.message);
    } finally {
        toggleLoader(false);
    }
};
/* ================== GET USER BY ID ================== */

/* ================== GET USER POSTS ================== */
// Get Posts From API
const getUserPosts = async (id) => {
    toggleLoader(true);
    const url = `${baseUrl}/users/${id}/posts`;
    const response = await axios.get(url);
    const posts = response.data.data;

    const userPostsWrapper = document.querySelector(".user-posts-wrapper");
    userPostsWrapper.innerHTML = "";

    try {
        for (const post of posts) {
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

            // Add the edit button
            const loggedInUser = JSON.parse(localStorage.getItem("user"));
            const isMyPost = loggedInUser && loggedInUser.id === post.author.id;

            // Create a post card
            const postCard = `
                <div class="post card mb-3 shadow-sm">
                    <div
                        class="card-header d-flex align-items-center justify-content-between gap-2"
                    >
                        <div class="d-flex align-items-center gap-2">
                            <img
                                src=${avatarImg}
                                alt="avatar"
                                class="rounded-circle"
                                style="width: 40px; height: 40px; object-fit: cover;"
                            />
                            <div class="post-owner fw-bold">
                                @<span class="username">${
                                    post.author.username
                                }</span>
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
                    <div class="card-body pt-1" style="cursor: pointer;" onclick="gotoPostDetails(${
                        post.id
                    })">
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
                </div>
            `;

            // Add the post card to posts container
            userPostsWrapper.innerHTML += postCard;
        }
    } catch (error) {
        console.log(error);
    } finally {
        toggleLoader(false);
    }
};
/* ================== GET USER POSTS ================== */

const urlParams = new URLSearchParams(window.location.search);
let userId = urlParams.get("id");

if (!userId) {
    const connectedUser = JSON.parse(localStorage.getItem("user"));
    userId = connectedUser.id;
}

getUserById(userId);
getUserPosts(userId);
