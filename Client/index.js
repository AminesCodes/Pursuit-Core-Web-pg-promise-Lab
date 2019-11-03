const baseURL = 'http://localhost:29000'
let userID = false;

document.addEventListener('DOMContentLoaded', ()=> {
    //DIV
    const loginDiv = document.querySelector('#loginDiv');
    const addPostDiv = document.querySelector('#addPost');
    const selectionDiv = document.querySelector('#selection');
    const wallDiv = document.querySelector('#wall');
    const allUsersDiv = document.querySelector('#allUsers');
    const allPosts = document.querySelector('#allPosts');
    const allUserPostsDiv = document.querySelector('#allUserPosts');
    const feedbackDiv = document.querySelector('#feedbackDiv')


    //BUTTONS
    const loginBtn = document.querySelector('#login');
    const signinBtn = document.querySelector('#signin');
    const getAllUsersBtn = document.querySelector('#getAllUsers');
    const getAllPostsBtn = document.querySelector('#getAllPosts');


    //INPUTS
    const firstNameInput = document.querySelector('#firstNameInput');
    const lastNameInput = document.querySelector('#lastNameInput');
    const ageInput = document.querySelector('#ageInput');
    const postBodyInput = document.querySelector('#postBody');


    //FORMS
    const addPostForm = document.querySelector('form');


    //INITIAL HIDING ALL DIV
    // loginDiv.style.display = 'none';
    addPostDiv.style.display = 'none';
    selectionDiv.style.display = 'none';
    wallDiv.style.display = 'none';
    allUsersDiv.style.display = 'none';
    allPosts.style.display = 'none';
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
            const allUsersData = await getAllUsers();
            if (allUsersData.status === 'success') {
                const allUsers = allUsersData.message;

                for (let user in allUsers) {
                    if (user.firstname === firstName 
                        && user.lastname === lastName
                        && user.age === age) {
                            userID = user.id
                            loginDiv.style.display = 'none';
                            addPostDiv.style.display = 'block';
                            selectionDiv.style.display = 'block';
                    } else {
                        feedbackDiv.style.display = 'block';
                        feedbackDiv.innerText = 'Invalid User';
                    }
                }
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
            const allUsersData = await getAllUsers();
            if (allUsersData.status === 'success') {
                const allUsers = allUsersData.message;
                let userExists = false;
                for (let user in allUsers) {
                    if (user.firstname === firstName 
                        && user.lastname === lastName
                        && user.age === age) {
                            userExists = true;
                        }
                }
                if (!userExists) {
                    const userToAdd = {
                        firstname: firstName,
                        lastname: lastName,
                        age: age
                    }
                    try {
                        const response = await axios.post(`${baseURL}/users/register`, userToAdd)
                        if (response.data.status === 'success') {
                            userID = response.data.message.id
                            loginDiv.style.display = 'none';
                            addPostDiv.style.display = 'block';
                            selectionDiv.style.display = 'block';
                        }
                    } catch (err) {
                        feedbackDiv.style.display = 'block';
                        feedbackDiv.innerText = 'Something went wrong!'
                    }
                } else {
                    feedbackDiv.style.display = 'block';
                    feedbackDiv.innerText = 'User exists already';
                }
            }
        }
    })

}) // END OF DOM CONTENT LOADED


const getAllUsers = async() => {
    try {
        const response = await axios.get(`${baseURL}/users/all`)
        return response.data;
    } catch (err) {
        console.log(err)
    }
}