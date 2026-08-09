const cameraToggle = document.getElementById("cameraToggle");
const micToggle = document.getElementById("micToggle");
const joinBtn = document.getElementById("joinBtn");

let cameraOn = false;
let micOn = true;

// Initial button text
cameraToggle.innerHTML =
`<i class="fa-solid fa-video-slash"></i> Camera OFF`;

micToggle.innerHTML =
`<i class="fa-solid fa-microphone"></i> Mic ON`;

// Camera Toggle
cameraToggle.addEventListener("click", () => {

    cameraOn = !cameraOn;

    if(cameraOn){

        cameraToggle.innerHTML =
        `<i class="fa-solid fa-video"></i> Camera ON`;

    }
    else{

        cameraToggle.innerHTML =
        `<i class="fa-solid fa-video-slash"></i> Camera OFF`;

    }

});

// Mic Toggle
micToggle.addEventListener("click", () => {

    micOn = !micOn;

    if(micOn){

        micToggle.innerHTML =
        `<i class="fa-solid fa-microphone"></i> Mic ON`;

    }
    else{

        micToggle.innerHTML =
        `<i class="fa-solid fa-microphone-slash"></i> Mic OFF`;

    }

});

// Join Meeting
joinBtn.addEventListener("click", () => {

    if(!cameraOn && !micOn){

        alert("Please enable Camera or Microphone.");

        return;

    }

    localStorage.setItem("cameraOn", cameraOn);
    localStorage.setItem("micOn", micOn);

    const room =
    new URLSearchParams(window.location.search).get("room");

    window.location.href =
    `meeting.html?room=${room}`;

});