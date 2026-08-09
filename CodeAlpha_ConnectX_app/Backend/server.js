const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

app.get("/", (req, res) => {
    res.send("🚀 ConnectX Server Running...");
});

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

// ✅ Shared for all connected users
const roomUsers = {};
const roomInfo = {};

let onlineUsers = 0;

io.on("connection", (socket) => {

    onlineUsers++;

    io.emit("onlineUsers", onlineUsers);

    console.log("User Connected:", socket.id);

    // Join Room
    socket.on("joinRoom", (data) => {

        const room = data.room;
        const name = data.name;

        socket.join(room);
        
        socket.userName = name;
        socket.room = room;
        socket.cameraOn = data.cameraOn;

        if (!roomUsers[room]) {
            roomUsers[room] = [];
            roomInfo[room] = [];
        }

        roomUsers[room].push(socket.id);

        roomInfo[room].push({
            id: socket.id,
            name: name,
            cameraOn: data.cameraOn
        });

        roomInfo[room].forEach(user => {

            if (user.id !== socket.id) {

                io.to(socket.id).emit("participantJoined", {
                    name: user.name,
                    cameraOn: user.cameraOn
                });

            }

        });

        io.to(socket.id).emit("role", {
            initiator: roomUsers[room].length === 1
        });

        io.to(room).emit("userCount", roomUsers[room].length);

        socket.to(room).emit("notification", {
            message: `${name} joined the meeting`
        });
        socket.to(room).emit("participantJoined", {
            name: name,
            cameraOn: data.cameraOn
        });

    });

    // Chat Message
    socket.on("sendMessage", (data) => {

        io.to(data.room).emit("receiveMessage", {
            message: data.message,
            sender: data.sender
        });

    });

    // =======================
    // WebRTC Offer
    // =======================

    socket.on("offer", (data) => {

        socket.to(data.room).emit("offer", data);

    });

    // =======================
    // WebRTC Answer
    // =======================

    socket.on("answer", (data) => {

        socket.to(data.room).emit("answer", data);

    });

    // =======================
    // ICE Candidate
    // =======================

    socket.on("ice-candidate", (data) => {

        socket.to(data.room).emit("ice-candidate", data);

    });

    // =======================
    // SCREEN SHARE EVENTS
    // =======================

    socket.on("screenShareStarted", (data) => {

        socket.to(data.room).emit("screenShareStarted");

    });

    socket.on("screenShareStopped", (data) => {

        socket.to(data.room).emit("screenShareStopped");

    });

    socket.on("whiteboardDraw", (data) => {

        socket.to(data.room).emit("whiteboardDraw", data);

    });

    socket.on("whiteboardClear", (data) => {

        socket.to(data.room).emit("whiteboardClear");

    });

    socket.on("leaveMeeting", ({ room }) => {

        socket.to(room).emit("participantLeft");

        socket.leave(room);

    });

    // Disconnect
    socket.on("disconnect", () => {

        onlineUsers--;

        io.emit("onlineUsers", onlineUsers);

        const room = socket.room;

        if (!room) return;

        if (roomUsers[room]) {
            roomUsers[room] =
                roomUsers[room].filter(id => id !== socket.id);
        }

        if (roomInfo[room]) {
            roomInfo[room] =
                roomInfo[room].filter(user => user.id !== socket.id);
        }

        io.to(room).emit("userCount", roomUsers[room].length);

        socket.to(room).emit("notification", {
            message: `${socket.userName} left the meeting`
        });

        if (roomUsers[room] && roomUsers[room].length === 0) {

            delete roomUsers[room];
            delete roomInfo[room];

        }

    });

});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});