/*
async function sendMessage(request) {
    let formData = new FormData();
    let token = getCookie('csrftoken');

    formData.append('textmessage', messageField.value);
    formData.append('csrfmiddlewaretoken', token);
    console.log(token)
    try {
        messageContainer.innerHTML += `
        <div style="color: grey" id="deleteMessage">
            <span>[Datum]</span>{{ request.user }}: ${messageField.value}
        </div>            
        `;
        let response = await fetch('/chat/', {
            method: 'POST',
            body: formData
        });
        let responseAsJSON = await response.json();
        console.log(responseAsJSON);
        document.getElementById('deleteMessage').remove();
        messageContainer.innerHTML += `
        <div>
            <span>[Datum]</span>${request.user}: ${messageField.value}
        </div>
        `;
        messageField.value = '';
        
    } catch (e) {
        console.log(e)
    }

}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  */

function render(){
    let msgCon = document.getElementById('messageContainer');
    if(msgCon){
        setTimeout(() => {
            msgCon.scrollTop = msgCon.scrollHeight;
        }, 1)
    }
}

function scrollToBottom(){
    let msgCon = document.getElementById('messageContainer');
    msgCon.scrollTop = msgCon.scrollHeight;
}

function getFormatedDate(){
    let options = {year: 'numeric', month: 'long', day: 'numeric'};
    let date = new Date().toLocaleDateString("en-US", options);
    let dateArr = date.split(' ');
    let month = dateArr[0].substring(0,3);
    let formatedDate = month + '. ' + dateArr[1] + ' ' + dateArr[2];
    return formatedDate;
}

function loginJs(){
    document.getElementById('loadingContainerLogin').style="display: flex";
    if(usernameLoginInput.value.length == 0 || passwordLoginInput.value.length == 0){
        document.getElementById('emptyFields').style="display: unset;";
        document.getElementById('loadingContainerLogin').style="display: none";
        return false;
    }else{
        return true;
    }
}

function createUser(){
    document.getElementById('loadingContainerRegister').style="display: flex";
    if(usernameRegInput.value.length == 0 || passwordRegInput.value.length == 0 || passwordAgainRegInput.value.length == 0){
        document.getElementById('emptyFields').style="display: unset;";
        document.getElementById('loadingContainerRegister').style="display: none";
        return false;
    }else{
        return true;
    }
}