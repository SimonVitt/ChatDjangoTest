/**
 * returns a value of cookie
 * @param {String} name : cookiename
 * @returns cookievalue
 */
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

//index.html
/**
 * sets scrollposition of messagecontainer on load
 */
function render(){
    let msgCon = document.getElementById('messageContainer');
    if(msgCon){
        setTimeout(() => {
            msgCon.scrollTop = msgCon.scrollHeight;
        }, 1)
    }
}

/**
 * scrolls to bottom of message container
 */
function scrollToBottom(){
    let msgCon = document.getElementById('messageContainer');
    msgCon.scrollTop = msgCon.scrollHeight;
}

/**
 * formats Date
 * @returns String of formated Date
 */
function getFormatedDate(){
    let options = {year: 'numeric', month: 'long', day: 'numeric'};
    let date = new Date().toLocaleDateString("en-US", options);
    let dateArr = date.split(' ');
    let month = dateArr[0].substring(0,3);
    let formatedDate = month + '. ' + dateArr[1] + ' ' + dateArr[2];
    return formatedDate;
}

/**
 * sends post request to backend to post message and handles answer
 * @param {FormData} formData : data of message
 */
async function requestsHttpMessage(formData) {
    await fetch('/chat/', {
        method: 'POST',
        body: formData
    }).then(async (response) => {
        scrollToBottom();
        if (!response.ok || response.status >= 400) {
            throw new Error('failed');
        } else {
            let responseAsJSON = await response.json();
            sendSuccess(responseAsJSON);
        }
    }).catch((error) => {
        sendingFailed();
    });
}

/**
 * displays message while it's sending and there wasnt a response from the backend yet
 */
function setToSending(){
    messageField.disabled = true;
    sendMsgBtn.disabled = true;
    messageContainer.innerHTML += `
        <div class="mdl-shadow--2dp message-card toRight sending" id="deleteMessage">
            <span class="dateSpan">${getFormatedDate()}</span><span class="authorSpan">${ requestUserName }:</span><span>${messageField.value}</span>
            <p class="sendingSign">sending...</p>
        </div>            
    `;
}

/**
 * enables input and button, when message was send or an error occurred
 */
function sendingEnded(){
    scrollToBottom();
    messageField.value = '';
    messageField.disabled = false;
    sendMsgBtn.disabled = false;
}

/**
 * displays successfully send message
 */
async function sendSuccess(responseAsJSON) {
    let newMessage = JSON.parse(responseAsJSON).fields;
    let messageAuthor = JSON.parse(responseAsJSON).authorname;
    document.getElementById('deleteMessage').remove();
    messageContainer.innerHTML += `
        <div class="mdl-shadow--2dp message-card toRight">
            <span class="dateSpan">${getFormatedDate()}</span><span class="authorSpan">${messageAuthor}</span><span>${newMessage.text}</span>
        </div>
        `;
        sendingEnded();
}

/**
 * displays not successfully send message(error)
 */
function sendingFailed() {
    document.getElementById('deleteMessage').remove();
    messageContainer.innerHTML += `
        <div class="mdl-shadow--2dp message-card toRight sendingFailed">
            <span class="dateSpan">${getFormatedDate()}</span><span class="authorSpan">${ requestUserName }</span><span>${messageField.value}</span>
            <span class="failedSign">Sending failed...</span>
        </div>
    `;
    sendingEnded();
}

/**
 * gets calleon submit of form to send message, creates formData and calls functions to send
 */
function sendMessage() {
    let formData = new FormData();
    let token = getCookie('csrftoken');
    formData.append('textmessage', messageField.value);
    formData.append('csrfmiddlewaretoken', token);
    setToSending();
    requestsHttpMessage(formData);
}

//register.html
/**
 * checks if all fields are filled out and shows error if not. Starts loading animation. 
 * @returns boolean: true if all fields are filled out
 */
function createUser(){
    document.getElementById('loadingContainerRegister').style="display: flex";
    if(usernameRegInput.value.length == 0 || passwordRegInput.value.length == 0 || passwordAgainRegInput.value.length == 0){
        document.getElementById('emptyFields').style="display: unset;";
        document.getElementById('usernameExists').style="display: none";
        document.getElementById('wrongPassword').style="display: none";
        document.getElementById('unknownErrorRegister').style="display: none";
        document.getElementById('loadingContainerRegister').style="display: none";
        return false;
    }else{
        return true;
    }
}

/**
 * sends post request to backend to register new user and handles responses
 */
async function handleRegister() {
    if (createUser()) {
        let formData = setFormDataRegister();
        await fetch('/register/', {
            method: 'POST',
            body: formData
        })
            .then((response) => {
                handleResponseRegister(response);
            })
            .catch((e) => {
                handleErrorRegister();
            });
    }
}

/**
 * displays message and ends loading, if response is an error
 */
function handleErrorRegister() {
    document.getElementById('emptyFields').style = "display: none;";
    document.getElementById('usernameExists').style = "display: none";
    document.getElementById('wrongPassword').style = "display: none";
    document.getElementById('unknownErrorRegister').style = "display: unset";
    document.getElementById('loadingContainerRegister').style = "display: none";
}

/**
 * handles response(if successful), calls functions or redirects
 */
async function handleResponseRegister(response) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        let responseAsJSON = await response.json();
        if (responseAsJSON.wrongPassword) {
            handlePasswordsW();
        } else {
            handleUsernameE();
        }
    } else {
        window.location.href = response.url;
    }
}

/**
 * displays message and ends loading, if passwords arent the same
 */
function handlePasswordsW() {
    document.getElementById('emptyFields').style = "display: none;";
    document.getElementById('usernameExists').style = "display: none";
    document.getElementById('wrongPassword').style = "display: unset";
    document.getElementById('unknownErrorRegister').style = "display: none";
    document.getElementById('loadingContainerRegister').style = "display: none";
}

/**
 * displays message and ends loading, if username already exists
 */
function handleUsernameE() {
    document.getElementById('emptyFields').style = "display: none;";
    document.getElementById('usernameExists').style = "display: unset";
    document.getElementById('wrongPassword').style = "display: none";
    document.getElementById('unknownErrorRegister').style = "display: none";
    document.getElementById('loadingContainerRegister').style = "display: none";
}

/**
 * sets formData of registerform to send to backend
 */
function setFormDataRegister() {
    let formData = new FormData();
    let token = getCookie('csrftoken');
    formData.append('username', usernameRegInput.value);
    formData.append('password', passwordRegInput.value);
    formData.append('passwordAgain', passwordAgainRegInput.value);
    formData.append('csrfmiddlewaretoken', token);
    return formData;
}

//login.html
/**
 * checks if all fields are filled out and shows error if not. Starts loading animation. 
 * @returns boolean: true if all fields are filled out
 */
function loginJs(){
    document.getElementById('loadingContainerLogin').style="display: flex";
    if(usernameLoginInput.value.length == 0 || passwordLoginInput.value.length == 0){
        document.getElementById('emptyFields').style="display: unset;";
        document.getElementById('loadingContainerLogin').style="display: none";
        document.getElementById('unknownError').style="display: none";
        document.getElementById('loadingContainerLogin').style="display: none";
        return false;
    }else{
        return true;
    }
}

/**
 * sends post request to backend to login user and handles responses
 */
async function handleLogin() {
    if (loginJs()) {
        let formData = setFormDataLogin();
        await fetch('/login/', {
            method: 'POST',
            body: formData
        })
        .then((response) => {
            handleResponseLogin(response);
        })
        .catch((e) => {
            console.log(e);
            handleErrorLogin();
        });
    }
}

/**
 * handles response, shows error message, if password wrong, or redirects
 */
async function handleResponseLogin(response) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        let responseAsJSON = await response.json();
        if (responseAsJSON.wrongPassword) {
            document.getElementById('wrongFields').style = "display: unset;"
            document.getElementById('emptyFields').style = "display: none;";
            document.getElementById('loadingContainerLogin').style = "display: none";
            document.getElementById('unknownError').style = "display: none";
        }
    } else {
        window.location.href = response.url;
    }
}

/**
 * sets formData from loginform to send to backend
 */
function setFormDataLogin() {
    let formData = new FormData();
    let token = getCookie('csrftoken');
    formData.append('username', usernameLoginInput.value);
    formData.append('password', passwordLoginInput.value);
    formData.append('csrfmiddlewaretoken', token);
    return formData;
}

/**
 * displays message and ends loading, if response is an error
 */
function handleErrorLogin() {
    document.getElementById('emptyFields').style = "display: none;";
    document.getElementById('loadingContainerLogin').style = "display: none";
    document.getElementById('unknownError').style = "display: unset";
    usernameLoginInput.value = '';
    passwordLoginInput.value = '';
}