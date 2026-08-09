// Check Login
const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}

// Welcome User
const userName = localStorage.getItem("userName");

if (userName) {
    document.getElementById("welcomeUser").innerHTML =
        `Welcome, ${userName}`;
}

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {

    localStorage.removeItem("token");
    localStorage.removeItem("userName");

    alert("Logged Out Successfully!");

    window.location.href = "login.html";

});

// Create Meeting
document.getElementById("createMeeting").addEventListener("click", () => {

    const roomId =
        "CX-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    saveRecentMeeting(roomId);

    window.location.href = `prejoin.html?room=${roomId}`;

});

// Join Meeting
document.getElementById("joinMeeting").addEventListener("click", () => {

    const room = document.getElementById("roomId").value.trim();

    if (room === "") {

        alert("Please enter Room ID");

        return;

    }

    saveRecentMeeting(room);

    window.location.href = `prejoin.html?room=${room}`;

});

// Save Recent Meeting
function saveRecentMeeting(roomId) {

    let meetings =
        JSON.parse(localStorage.getItem("recentMeetings")) || [];

    const meeting = {
        room: roomId,
        time: new Date().toLocaleString()
    };

    meetings.unshift(meeting);

    // Keep only latest 5 meetings
    meetings = meetings.slice(0, 5);

    localStorage.setItem(
        "recentMeetings",
        JSON.stringify(meetings)
    );

}

// Display Recent Meetings
function displayRecentMeetings() {

    const container =
        document.getElementById("recentMeetings");

    const meetings =
        JSON.parse(localStorage.getItem("recentMeetings")) || [];

    if (meetings.length === 0) {

        container.innerHTML =
            "<p>No meetings yet</p>";

        return;

    }

    container.innerHTML = meetings.map(meeting => `

        <div class="recent-meeting">

            <strong>${meeting.room}</strong>

            <small>${meeting.time}</small>

        </div>

    `).join("");

}

displayRecentMeetings();

// Online Users
const socket = io("http://localhost:5000");

socket.on("onlineUsers", (count) => {

    document.getElementById("onlineUsers").innerHTML =
        `${count} users online`;

});