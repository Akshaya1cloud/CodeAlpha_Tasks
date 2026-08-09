const socket = io("http://localhost:5000");

const roomId = new URLSearchParams(window.location.search).get("room");
document.getElementById("roomDisplay").innerHTML =
`Room: ${roomId}`;

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

const micBtn = document.getElementById("micBtn");
const cameraBtn = document.getElementById("cameraBtn");
const leaveBtn = document.getElementById("leaveBtn");

const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("messageInput");
const chatBox = document.getElementById("messages");

if(chatBox.innerHTML.includes("No messages yet")){

    chatBox.innerHTML="";

}

const screenBtn = document.getElementById("screenBtn");

const userName = localStorage.getItem("userName") || "Guest";
console.log("Current User:", userName);

const avatarBox = document.getElementById("avatarBox");
const avatarInitials = document.getElementById("avatarInitials");

const remoteAvatarBox = document.getElementById("remoteAvatarBox");
const remoteAvatarInitials = document.getElementById("remoteAvatarInitials");

const initials = userName
.split(" ")
.map(word => word[0])
.join("")
.toUpperCase();

avatarInitials.innerHTML = initials;

const configuration = {
    iceServers: [
        {
            urls: "stun:stun.l.google.com:19302"
        }
    ]
};

const meetingTimer =
document.getElementById("meetingTimer");

const copyRoomBtn =
document.getElementById("copyRoomBtn");

let seconds = 0;

let localStream;
let peerConnection;

let remoteStream = new MediaStream();

let isInitiator = false;
let cameraEnabled = true;
let micEnabled = true;

async function startMeeting() {

    try {

        const cameraOn =
        localStorage.getItem("cameraOn") === "true";

        const micOn =
        localStorage.getItem("micOn") === "true";

        if (cameraOn || micOn) {

            localStream =
            await navigator.mediaDevices.getUserMedia({

                video: cameraOn,

                audio: micOn

            });

            localVideo.srcObject = localStream;

            if (localStream.getVideoTracks().length > 0) {

                localStream.getVideoTracks()[0].enabled = cameraOn;

            }

            if (!cameraOn) {

                localVideo.style.visibility = "hidden";
                avatarBox.style.display = "flex";

            } else {

                localVideo.style.visibility = "visible";
                avatarBox.style.display = "none";

            }

            if (localStream.getAudioTracks().length > 0) {

                localStream.getAudioTracks()[0].enabled = micOn;

            }

        }

        createPeerConnection();

        socket.emit("joinRoom", {

            room: roomId,

            name: userName,

            cameraOn: cameraOn

        });
        startTimer();

    }

    catch (err) {

        console.error(err);

        alert(err.name + " : " + err.message);

    }

}

function createPeerConnection() {

    peerConnection = new RTCPeerConnection(configuration);

    // Add camera + microphone tracks
    if (localStream) {

        localStream.getTracks().forEach(track => {

            peerConnection.addTrack(track, localStream);

        });

    }

    // Receive remote stream
    
    peerConnection.ontrack = (event) => {

        console.log("REMOTE TRACK:", event.track.kind);

        if (event.track.kind === "video") {

            const stream = event.streams[0];

            if (stream) {
                remoteVideo.srcObject = stream;
            } else {
                remoteStream.addTrack(event.track);
                remoteVideo.srcObject = remoteStream;
            }

            remoteVideo.style.display = "block";
            remoteVideo.style.visibility = "visible";

            remoteAvatarBox.style.display = "none";

            remoteVideo.play().catch(err => {
                console.log("Remote video play error:", err);
            });

            console.log("✅ REMOTE VIDEO RECEIVED");
        }

        if (event.track.kind === "audio") {

            const stream = event.streams[0];

            if (stream) {
                remoteVideo.srcObject = stream;
            } else {
                remoteStream.addTrack(event.track);
                remoteVideo.srcObject = remoteStream;
            }

            console.log("🔊 REMOTE AUDIO RECEIVED");
        }
    };

    // ICE candidates
    peerConnection.onicecandidate = (event) => {

        if (event.candidate) {

            socket.emit("ice-candidate", {

                room: roomId,
                candidate: event.candidate

            });

        }

    };

}

// =======================
// Role
// =======================

socket.on("role", (data) => {

    isInitiator = data.initiator;

    console.log("Initiator:", isInitiator);

});

// =======================
// User Count
// =======================

socket.on("userCount", async (count) => {
    document.getElementById("userCountDisplay").innerHTML =
    `<i class="fa-solid fa-users"></i> ${count}`;

    console.log("Users:", count);

    if (count === 2 && isInitiator) {

        const offer = await peerConnection.createOffer();

        await peerConnection.setLocalDescription(offer);

        socket.emit("offer", {
            room: roomId,
            offer: offer
        });

    }

});

// =======================
// Receive Offer
// =======================

socket.on("offer", async (data) => {

    if (!peerConnection) return;

    await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.offer)
    );

    const answer = await peerConnection.createAnswer();

    await peerConnection.setLocalDescription(answer);

    socket.emit("answer", {
        room: roomId,
        answer: answer
    });

});

// =======================
// Receive Answer
// =======================

socket.on("answer", async (data) => {

    if (!peerConnection) return;

    await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.answer)
    );

});

// =======================
// ICE Candidates
// =======================

socket.on("ice-candidate", async (data) => {

    if (!peerConnection) return;

    try {

        await peerConnection.addIceCandidate(
            new RTCIceCandidate(data.candidate)
        );

    } catch (err) {

        console.error(err);

    }

});

socket.on("notification",(data)=>{

    const div=document.createElement("div");

    div.className="meeting-notification";

    div.innerHTML=`🔔 ${data.message}`;

    chatBox.appendChild(div);

    chatBox.scrollTop=chatBox.scrollHeight;

});

// =======================
// Send Chat
// =======================

sendBtn.addEventListener("click", () => {

    const message = messageInput.value.trim();

    if (message === "") return;

    socket.emit("sendMessage", {
        room: roomId,
        message: message,
        sender: userName
    });

    messageInput.value = "";

});

// =======================
// Receive Chat
// =======================

socket.on("receiveMessage", (data) => {

    const div = document.createElement("div");

    const time = new Date().toLocaleTimeString([],{
        hour:"2-digit",
        minute:"2-digit"
    });

    div.innerHTML = `
    <b>${data.sender}</b>
    <span style="font-size:11px;color:gray;"> ${time}</span><br>
    ${data.message}
    `;

    chatBox.appendChild(div);

    chatBox.scrollTop = chatBox.scrollHeight;

});

// =======================
// Camera Toggle
// =======================

cameraBtn.addEventListener("click", () => {

    if (!localStream || localStream.getVideoTracks().length === 0) return;

    cameraEnabled = !cameraEnabled;

    localStream.getVideoTracks()[0].enabled = cameraEnabled;

    if(cameraEnabled){

        cameraBtn.style.background="#2563EB";

        localVideo.style.display = "block";

        avatarBox.style.display = "none";

        cameraBtn.innerHTML=`
        <i class="fa-solid fa-video"></i>
        Camera`;

    }else{

        cameraBtn.style.background="#dc2626";

        localVideo.style.display = "none";

        avatarBox.style.display = "flex";

        cameraBtn.innerHTML=`
        <i class="fa-solid fa-video-slash"></i>
        Camera`;

    }

});

// =======================
// Mic Toggle
// =======================

micBtn.addEventListener("click", () => {

    if (!localStream || localStream.getAudioTracks().length === 0) return;

    micEnabled = !micEnabled;

    localStream.getAudioTracks()[0].enabled = micEnabled;

    if(micEnabled){

        micBtn.style.background="#2563EB";

        micBtn.innerHTML=`
        <i class="fa-solid fa-microphone"></i>
        Mic`;

    }else{

        micBtn.style.background="#dc2626";

        micBtn.innerHTML=`
        <i class="fa-solid fa-microphone-slash"></i>
        Mic`;

    }

});

// =======================
// Leave Meeting
// =======================

leaveBtn.addEventListener("click", () => {

    // Ask first
    if (!confirm("Leave Meeting?")) {
        return;
    }

    // Stop camera
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }

    // Stop screen sharing
    if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
    }

    // Stop microphone
    if (localStream) {
        localStream.getAudioTracks().forEach(track => track.stop());
    }

    // Close WebRTC connection
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }

    // Tell server that user left
    socket.emit("leaveMeeting", {
        room: roomId
    });

    // Redirect
    window.location.href = "dashboard.html";
});

// =======================
// SCREEN SHARE
// =======================

let screenStream = null;
let screenSender = null;


// Renegotiate connection after adding/removing screen track
async function renegotiateConnection() {

    try {

        if (!peerConnection) return;

        // Only create a new offer when connection is stable
        if (peerConnection.signalingState !== "stable") {
            console.log(
                "⚠️ Cannot renegotiate. Signaling state:",
                peerConnection.signalingState
            );
            return;
        }

        console.log("🔄 Starting renegotiation...");

        const offer = await peerConnection.createOffer();

        await peerConnection.setLocalDescription(offer);

        socket.emit("offer", {
            room: roomId,
            offer: peerConnection.localDescription
        });

        console.log("📤 Renegotiation offer sent");

    } catch (err) {

        console.error("❌ Renegotiation error:", err);

    }
}


screenBtn.addEventListener("click", async () => {

    try {

        screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: false
        });

        const screenTrack = screenStream.getVideoTracks()[0];

        // Find existing camera video sender
        screenSender = peerConnection.getSenders().find(
            sender =>
                sender.track &&
                sender.track.kind === "video"
        );


        // =====================================
        // CASE 1: Camera sender already exists
        // =====================================

        if (screenSender) {

            await screenSender.replaceTrack(screenTrack);

            console.log("🔄 Camera track replaced with screen");

        }


        // =====================================
        // CASE 2: Camera is OFF
        // No video sender exists
        // =====================================

        else {

            screenSender =
                peerConnection.addTrack(
                    screenTrack,
                    screenStream
                );

            console.log("➕ Screen track added to peer connection");

        }


        // =====================================
        // Show screen locally
        // =====================================

        localVideo.srcObject = screenStream;

        localVideo.style.display = "block";
        localVideo.style.visibility = "visible";

        avatarBox.style.display = "none";

        document.getElementById("shareStatus").innerHTML =
            "🖥️ Sharing";


        // =====================================
        // IMPORTANT:
        // Send screen to other browser
        // =====================================

        await renegotiateConnection();

        socket.emit("screenShareStarted", {
            room: roomId
        });

        console.log("✅ SCREEN SHARING STARTED");

        // =====================================
        // Browser "Stop Sharing"
        // =====================================

        screenTrack.onended = async () => {

            console.log("🛑 SCREEN SHARING STOPPED");


            if (!screenSender) return;


            // Camera available?
            const cameraTrack =
                localStream &&
                localStream
                    .getVideoTracks()
                    .find(track => track.kind === "video");


            if (cameraTrack) {

                // Return to camera
                await screenSender.replaceTrack(cameraTrack);

                localVideo.srcObject = localStream;

                localVideo.style.display = "block";
                localVideo.style.visibility = "visible";

                avatarBox.style.display = "none";

            }

            else {

                // Camera was OFF
                peerConnection.removeTrack(screenSender);

                screenSender = null;

                localVideo.srcObject = null;

                localVideo.style.display = "none";

                avatarBox.style.display = "flex";

            }


            document.getElementById("shareStatus").innerHTML =
                "🖥️ Not Sharing";


            // Tell other browser to update UI
            socket.emit("screenShareStopped", {
                room: roomId
            });

            console.log("🔄 Returned to camera");


        };

    }

    catch (err) {

        console.error("Screen sharing error:", err);

    }

});

// =======================
// Start Meeting
// =======================

startMeeting();

// =======================
// WHITEBOARD
// =======================

const whiteboardBtn = document.getElementById("whiteboardBtn");
const whiteboardModal = document.getElementById("whiteboardModal");
const closeBoard = document.getElementById("closeBoard");
const clearBoard = document.getElementById("clearBoard");

const canvas = document.getElementById("whiteboard");
const ctx = canvas.getContext("2d");

let drawing = false;

let lastX = 0;
let lastY = 0;

let penColor = "#2563EB";
let penSize = 4;
let erasing = false;

const penColorInput =
    document.getElementById("penColor");

const penSizeInput =
    document.getElementById("penSize");

const eraserBtn =
    document.getElementById("eraserBtn");

penColorInput.addEventListener("input", () => {

    penColor = penColorInput.value;
    erasing = false;

    eraserBtn.innerText = "🧽 Eraser";

});

penSizeInput.addEventListener("change", () => {

    penSize = Number(penSizeInput.value);

});

eraserBtn.addEventListener("click", () => {

    erasing = !erasing;

    if (erasing) {

        eraserBtn.innerText = "✏️ Pen";

    } else {

        eraserBtn.innerText = "🧽 Eraser";

    }

}); 

// Canvas Size
function resizeCanvas() {

    const oldCanvas = document.createElement("canvas");
    oldCanvas.width = canvas.width;
    oldCanvas.height = canvas.height;

    const oldCtx = oldCanvas.getContext("2d");

    if (canvas.width > 0 && canvas.height > 0) {
        oldCtx.drawImage(canvas, 0, 0);
    }

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.lineWidth = penSize;
    ctx.lineCap = "round";

    if (erasing) {
        ctx.strokeStyle = "#ffffff";
    } else {
        ctx.strokeStyle = penColor;
    }

    if (oldCanvas.width > 0 && oldCanvas.height > 0) {
        ctx.drawImage(
            oldCanvas,
            0,
            0,
            oldCanvas.width,
            oldCanvas.height,
            0,
            0,
            canvas.width,
            canvas.height
        );
    }
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Open Whiteboard
whiteboardBtn.addEventListener("click", () => {
    whiteboardModal.style.display = "flex";
    resizeCanvas();
});

// Close Whiteboard
closeBoard.addEventListener("click", () => {
    whiteboardModal.style.display = "none";
});

// Mouse Down
canvas.addEventListener("mousedown", (e) => {

    drawing = true;

    lastX = e.offsetX;
    lastY = e.offsetY;

});

// Mouse Move
canvas.addEventListener("mousemove", (e) => {

    if (!drawing) return;

    const currentX = e.offsetX;
    const currentY = e.offsetY;

    // Apply selected tool
    ctx.lineWidth = penSize;
    ctx.lineCap = "round";

    if (erasing) {
        ctx.strokeStyle = "#ffffff";
    } else {
        ctx.strokeStyle = penColor;
    }

    // Draw locally
    ctx.beginPath();

    ctx.moveTo(lastX, lastY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();

    // Send drawing to other user
    socket.emit("whiteboardDraw", {
        room: roomId,
        x1: lastX,
        y1: lastY,
        x2: currentX,
        y2: currentY,
        color: erasing ? "#ffffff" : penColor,
        size: penSize
    });

    lastX = currentX;
    lastY = currentY;

});

// Mouse Up
canvas.addEventListener("mouseup", () => {

    drawing = false;

});

// Mouse Leave
canvas.addEventListener("mouseleave", () => {

    drawing = false;

});

// Clear Whiteboard

clearBoard.addEventListener("click", () => {

    if (confirm("Clear the whiteboard?")) {

        // Clear my canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Tell the other participant
        socket.emit("whiteboardClear", {
            room: roomId
        });

    }

});

function startTimer(){

    setInterval(()=>{

        seconds++;

        const mins =
        String(Math.floor(seconds/60)).padStart(2,"0");

        const secs =
        String(seconds%60).padStart(2,"0");

        meetingTimer.innerHTML =
        `<i class="fa-regular fa-clock"></i> ${mins}:${secs}`;

    },1000);

}

copyRoomBtn.addEventListener("click",()=>{

    navigator.clipboard.writeText(roomId);

    alert("Room ID Copied!");

});

messageInput.addEventListener("keypress",(e)=>{

    if(e.key==="Enter"){

        sendBtn.click();

    }

});

socket.on("participantJoined", (data) => {

    console.log("participantJoined", data);

    remoteAvatarInitials.innerText =
        data.name.charAt(0).toUpperCase();

    if (data.cameraOn) {

        remoteAvatarBox.style.display = "none";
        remoteVideo.style.display = "block";

    } else {

        remoteVideo.style.display = "none";
        remoteAvatarBox.style.display = "flex";

    }   

});

// =======================
// REMOTE SCREEN SHARE
// =======================

socket.on("screenShareStarted", () => {

    console.log("🖥️ Remote screen sharing started");

    remoteAvatarBox.style.display = "none";
    remoteVideo.style.display = "block";

});


socket.on("screenShareStopped", () => {

    console.log("🛑 Remote screen sharing stopped");

    remoteVideo.srcObject = null;

    remoteVideo.style.display = "none";

    remoteAvatarBox.style.display = "flex";

});

socket.on("whiteboardDraw", (data) => {

    if (whiteboardModal.style.display !== "flex") {
        whiteboardModal.style.display = "flex";
        resizeCanvas();
    }

    ctx.lineWidth = data.size || 4;
    ctx.lineCap = "round";
    ctx.strokeStyle = data.color || "#2563EB";

    ctx.beginPath();

    ctx.moveTo(data.x1, data.y1);
    ctx.lineTo(data.x2, data.y2);

    ctx.stroke();

});

socket.on("whiteboardClear", () => {

    console.log("🧹 Whiteboard cleared by remote user");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

});

socket.on("participantLeft", () => {

    console.log("👋 Participant left the meeting");

    if (remoteVideo) {
        remoteVideo.srcObject = null;
        remoteVideo.style.display = "none";
    }

    remoteAvatarBox.style.display = "flex";

    userCountDisplay.innerHTML =
        '<i class="fa-solid fa-users"></i> 1';

});