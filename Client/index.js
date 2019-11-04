const baseURL = 'http://localhost:29000'
let userID = false;

document.addEventListener('DOMContentLoaded', ()=> {
    //DIV
    const loginDiv = document.querySelector('#loginDiv');
    const addPostDiv = document.querySelector('#addPostDiv');
    const selectionDiv = document.querySelector('#selection');
    const allUsersDiv = document.querySelector('#allUsers');
    const allPostsDiv = document.querySelector('#allPosts');
    const allUserPostsDiv = document.querySelector('#allUserPosts');
    const feedbackDiv = document.querySelector('#feedbackDiv')


    //BUTTONS
    const loginBtn = document.querySelector('#login');
    const signinBtn = document.querySelector('#signin');
    const getAllUsersBtn = document.querySelector('#getAllUsers');
    const getAllPostsBtn = document.querySelector('#getAllPosts');
    const editProfileBtn = document.querySelector('#editProfile');
    const logoutBtn = document.querySelector('#logout');
    const deleteProfileBtn = document.querySelector('#deleteProfile');
    const getPersonalPostsBtn = document.querySelector('#getPersonalPosts');


    //INPUTS
    const firstNameInput = document.querySelector('#firstNameInput');
    const lastNameInput = document.querySelector('#lastNameInput');
    const ageInput = document.querySelector('#ageInput');
    const postBodyInput = document.querySelector('#postBody');


    //FORMS
    const addPostForm = document.querySelector('form');


    // ULs
    const usersList = document.querySelector('#usersList');
    const allPostsList = document.querySelector('#allPostsList');
    const allUserPostsList = document.querySelector('#allUserPostsList');


    //INITIAL HIDING ALL DIV
    // loginDiv.style.display = 'none';
    addPostDiv.style.display = 'none';
    selectionDiv.style.display = 'none';
    allUsersDiv.style.display = 'none';
    allPostsDiv.style.display = 'none';
    allUserPostsDiv.style.display = 'none';
    feedbackDiv.style.display = 'none';


    //EVENT LISTENER FOR LOGIN
    loginBtn.addEventListener('click', async () => {
        feedbackDiv.style.display = 'none';
        const firstName = firstNameInput.value;
        const lastName = lastNameInput.value;
        const age = ageInput.value;

        if (!firstName || !lastName || !age) {
            feedbackDiv.style.display = 'block';
            feedbackDiv.innerText = 'All fields are required';
        } else {
            const loggedUser = await getUserToLog(firstName, lastName, age);
            if (loggedUser.status === 'success') {
                userID = loggedUser.message.id;

                feedbackDiv.style.display = 'none';
                loginDiv.style.display = 'none';
                addPostDiv.style.display = 'block';
                selectionDiv.style.display = 'block';

                await loadAllPosts();
            } else {
                feedbackDiv.style.display = 'block';
                feedbackDiv.innerText = loggedUser.message;
            }
        }
    })


    //EVENT LISTENER FOR SIGNIN
    signinBtn.addEventListener('click', async () => {
        feedbackDiv.style.display = 'none';
        const firstName = firstNameInput.value;
        const lastName = lastNameInput.value;
        const age = ageInput.value;

        if (!firstName || !lastName || !age) {
            feedbackDiv.style.display = 'block';
            feedbackDiv.innerText = 'All fields are required';
        } else {
            if (signinBtn.className === 'signingIn') {
                const addedUser = await addUser(firstName, lastName, age)
                if (addedUser.status === 'success') {
                    userID = addedUser.message.id;
        
                    loginDiv.style.display = 'none';
                    addPostDiv.style.display = 'block';
                    selectionDiv.style.display = 'block';
    
                    await loadAllPosts();
                } else {
                    feedbackDiv.style.display = 'block';
                    feedbackDiv.innerText = addedUser.message;
                }
            } else if (signinBtn.className === 'editing') {
                loginDiv.style.display = 'none';
                loginBtn.style.display = 'inline';
                signinBtn.innerText = 'Sign-in';
                signinBtn.className = 'signingIn';

                const editedUSer = await editUser(firstName, lastName, age)
                if (editedUSer.status === 'success') {
                    const user = editedUSer.message;
                    feedbackDiv.style.display = 'block';
                    feedbackDiv.innerText = `${user.firstname} ${user.lastname} ${user.age} `;
                } else {
                    feedbackDiv.style.display = 'block';
                    feedbackDiv.innerText = editedUSer.message;
                }
            }
        }
    })

    //EVENT LISTENER FOR ALL USERS BTN
    getAllUsersBtn.addEventListener('click', async() => {
        allUsersDiv.style.display = 'block';
        allPostsDiv.style.display = 'none';
        allUserPostsDiv.style.display = 'none';
        feedbackDiv.style.display = 'none';

        const allUsersData = await getAllUsers();
        if (allUsersData.status === 'success') {
            usersList.innerText = ''
            const allUsers = allUsersData.message;
            if(allUsers.length) {
                for (let user of allUsers) {
                    const newLi = document.createElement('li');
                    newLi.id = user.id;
                    newLi.innerText = `${user.firstname} ${user.lastname}`
                    usersList.appendChild(newLi);
                }
            }
        }
    })

    // LOADING ALL POSTS TO DOM
    const loadAllPosts = async () => {
        allUsersDiv.style.display = 'none';
        allPostsDiv.style.display = 'block';
        allUserPostsDiv.style.display = 'none';
        feedbackDiv.style.display = 'none';

        allPostsList.innerHTML = '';
        
        const allPostsData = await getAllPosts();
        if (allPostsData.status = 'success') {
            const allPosts = allPostsData.message;
            if (allPosts.length) {
                for (let post of allPosts) {
                    const newLi = document.createElement('li');
                    newLi.id = post.id;
                    newLi.innerText = `${post.firstname} ${post.lastname}:\n${post.body}`;
                    allPostsList.appendChild(newLi);
                }
            } else {
                allPostsList.innerHTML = '';
            }
        } else {
            feedbackDiv.style.display = 'block'
            feedbackDiv.innerText = allPostsData.message;
        }
    }
    // EVENT LISTENER FOR WALL BTN (ALL POSTS)
    getAllPostsBtn.addEventListener('click', async () => {
        await loadAllPosts();
    })


    //EVENT LISTENER FOR EDIT PROFILE
    editProfileBtn.addEventListener('click', () => {
        loginDiv.style.display = 'block';
        loginBtn.style.display = 'none'
        signinBtn.innerText = 'Save';
        signinBtn.className = 'editing'
    })


    // EVENT LISTENER FOR DELETE PROFILE
    deleteProfileBtn.addEventListener('click', async () => {
        const deletedUserData = await deleteUser(userID);
        if (deletedUserData.status === 'success') {
            const user = deletedUserData.message;
            feedbackDiv.style.display = 'block';
            feedbackDiv.innerText = `DELETED USER:\n${user.firstname} ${user.lastname}`
            setTimeout(() => {
                location.reload();
            }, 3000);
            userID = false;
        } else {
            feedbackDiv.style.display = 'block';
            feedbackDiv.innerText = deletedUserData.message;
        }
    })

    
    // EVENT LISTENER FOR LOGOUT BTN
    logoutBtn.addEventListener('click', () =>{
        userID = false;
        setTimeout(() => {
            location.reload();
        }, 200);
    })


    // EVENT LISTENER FOR PERSONAL POSTS
    getPersonalPostsBtn.addEventListener('click', async () => {
        allUsersDiv.style.display = 'none';
        allPostsDiv.style.display = 'none';
        allUserPostsDiv.style.display = 'block';
        feedbackDiv.style.display = 'none';

        const individualPostsData = await getPostsByUser(userID);
        if(individualPostsData.status === 'success') {
            const posts = individualPostsData.message;
            if (posts.length) {
                allUserPostsList.innerText = `${posts[0].firstname} ${posts[0].lastname} :`
                for (let post of posts) {
                    const newLi = document.createElement('li');
                    newLi.id = post.id;
                    newLi.innerText = post.body;
                    const newDeleteBtn = document.createElement('button')
                    newDeleteBtn.innerText = 'Delete'
                    newLi.appendChild(newDeleteBtn);
                    const editPostBtn = document.createElement('button');
                    editPostBtn.innerText = 'Edit';
                    newLi.appendChild(editPostBtn);
                    allUserPostsList.appendChild(newLi);
                }
            } else {
                allUserPostsList.innerHTML = '';
            }
        } else {
            feedbackDiv.style.display = 'block'
            feedbackDiv.innerText = individualPostsData.message;
        }
    })

    // INDIVIDUAL POSTS BY USERS
    usersList.addEventListener('click', async (event) => {
        if (event.target.parentNode === usersList) {
            allUsersDiv.style.display = 'none';
            allPostsDiv.style.display = 'none';
            allUserPostsDiv.style.display = 'block';
            feedbackDiv.style.display = 'none';

            const targetUserId = event.target.id;
            const individualPostsData = await getPostsByUser(targetUserId);
            if(individualPostsData.status === 'success') {
                let posts = individualPostsData.message;
                if (posts.length) {
                    allUserPostsList.innerText = `${posts[0].firstname} ${posts[0].lastname}:`
                    for (let post of posts) {
                        const newLi = document.createElement('li');
                        newLi.id = post.id;
                        newLi.innerText = post.body;
                        allUserPostsList.appendChild(newLi);
                    }
                } else {
                    allUserPostsList.innerHTML = '';
                }
            } else {
                feedbackDiv.style.display = 'block'
                feedbackDiv.innerText = individualPostsData.message;
            }
        }
    })


    // DELETE A POST
    allUserPostsList.addEventListener('click', async (event) => {
        if (event.target.parentNode.parentNode === allUserPostsList
            && event.target.innerText === 'Delete'){
            const postID = event.target.parentNode.id
            const deletedPostData = await deletePost(userID, postID);
            if (deletedPostData.status === 'success') {
                event.target.parentNode.style.display = 'none';
                event.target.style.display = 'none';
            } else {
                feedbackDiv.style.display = 'block'
                feedbackDiv.innerText = deletedPostData.message;
            }
        }
    })

    // EDIT A POST
    allUserPostsList.addEventListener('click', (event) => {
        if (event.target.parentNode.parentNode === allUserPostsList
            && event.target.innerText === 'Edit'){
                addPostForm.className = 'updatePost'
                let text = event.target.parentNode.innerText
                postBodyInput.value = text.slice(0, text.length - 10);
                postBodyInput.className = event.target.parentNode.id;
        }
    })


    // ADD A POST
    addPostForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const postBody = postBodyInput.value;
        postBodyInput.value = '';

        if (postBody) {
            if (addPostForm.className === 'addPost') {
                const addedPostData = await addPost(userID, {body: postBody});
                console.log(addedPostData)

            } else if (addPostForm.className === 'updatePost') {
                addPostForm.className = 'addPost';

                const postID = postBodyInput.className;
                const updatedPostData = await updatePost(userID, postID, {body: postBody});
                if (updatedPostData.status === 'success') {
                    
                } else {
                    feedbackDiv.style.display = 'block'
                    feedbackDiv.innerText = updatedPostData.message;
                }
            }
        }

    })



}) // END OF DOM CONTENT LOADED



//===================================================================
const getUserToLog = async (firstName, lastName, age) => {
    try {
        let user = {
            firstname: firstName,
            lastname: lastName,
            age: age
        };
        const response = await axios.patch(`${baseURL}/users/login`, user);
        return response.data;
    } catch (err) {
        console.log(err)
    }
}

const addUser = async (firstName, lastName, age) => {
    const userToAdd = {
        firstname: firstName,
        lastname: lastName,
        age: age
    }
    try {
        const response = await axios.post(`${baseURL}/users/register`, userToAdd)
        return response.data;
    } catch (err) {
        feedbackDiv.style.display = 'block';
        feedbackDiv.innerText = 'Something went wrong'
    }
}

const getAllUsers = async() => {
    try {
        const response = await axios.get(`${baseURL}/users/all`)
        return response.data;
    } catch (err) {
        console.log(err)
    }
}

const getAllPosts = async () => {
    try {
        const response = await axios.get(`${baseURL}/posts/all`)
        return response.data;
    } catch (err) {
        console.log(err)
    }
}

const editUser = async(firstName, lastName, age) => {
    try {
        const user = {
            firstname: firstName,
            lastname: lastName,
            age: age
        };
        const response = await axios.put(`${baseURL}/users/${userID}`, user)
        return response.data;
    } catch (err) {
        console.log(err)
    }
}

const deleteUser = async(userID) => {
    try {
        const response = await axios.delete(`${baseURL}/users/${userID}`);
        return response.data;
    } catch (err) {
        console.log(err)
    }
}

const getPostsByUser = async (userId) => {
    try {
        const response = await axios.get(`${baseURL}/posts/${userId}`);
        return response.data;
    } catch (err) {
        console.log(err)
    }
}

const deletePost = async (userID, postID) => {
    try {
        const response = await axios.delete(`${baseURL}/posts/${userID}/${postID}`);
        return response.data;
    } catch (err) {
        console.log(err)
    }
}

const addPost = async (userID, body) => {
    try {
        const response = await axios.post(`${baseURL}/posts/${userID}/register`, body);
        return response.data;
    } catch (err) {
        console.log(err)
    }
}

const updatePost = async (userID, postID, body) => {
    try {
        const response = await axios.patch(`${baseURL}/posts/${userID}/${postID}`, body);
        return response.data;
    } catch (err) {
        console.log(err)
    }
}