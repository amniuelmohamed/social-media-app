// Get Posts Container
const postsContainer = document.querySelector(".posts");
postsContainer.innerHTML = "";

window.onload = () => getPosts(currentPage);

/* ================== INFINITE SCROLL ================== */
const handleInfiniteScrolling = (entries) => {
    if (
        entries[0].isIntersecting &&
        lastPage &&
        currentPage < lastPage &&
        postsContainer.innerHTML != ""
    ) {
        getPosts(++currentPage);
    }
};

const watcher = document.querySelector(".watcher");
new IntersectionObserver(handleInfiniteScrolling).observe(watcher);

/* ================== INFINITE SCROLL ================== */

/* ================== GET ALL POSTS ================== */
// Get Posts From API
const getPosts = async (page) => {
    toggleLoader(true);
    const url = `${baseUrl}/posts?limit=5&page=${page}`;
    const response = await axios.get(url);
    const posts = response.data.data;

    if (page === 1) lastPage = +response.data.meta.last_page;

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
            postsContainer.innerHTML += postCard;
        }
    } catch (error) {
        console.log(error);
    } finally {
        toggleLoader(false);
    }
};
/* ================== GET ALL POSTS ================== */
