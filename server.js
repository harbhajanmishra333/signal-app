const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Store the status of both users
let users = {
    user1: { ready: false },
    user2: { ready: false }
};

io.on('connection', (socket) => {
    console.log('A user connected');
    
    // Assign user ID (user1 or user2)
    let userId = Object.keys(users).find(id => !users[id].socketId);
    if (!userId) {
        userId = 'user1'; // If both users are connected, default to user1 (for demo purposes)
    }
    users[userId].socketId = socket.id;
    
    // Send current status to the connected user
    socket.emit('init', { 
        userId,
        users: {
            user1: { ready: users.user1.ready },
            user2: { ready: users.user2.ready }
        }
    });
    
    // Handle ready status change
    socket.on('toggleReady', (data) => {
        if (users[userId]) {
            users[userId].ready = data.ready;
            io.emit('statusUpdate', { userId, ready: data.ready });
            
            // Check if both users are ready
            if (users.user1.ready && users.user2.ready) {
                io.emit('bothReady');
            } else {
                io.emit('notBothReady');
            }
        }
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected');
        // Reset the user's status on disconnect
        if (users[userId]) {
            users[userId].ready = false;
            users[userId].socketId = null;
            io.emit('statusUpdate', { userId, ready: false });
        }
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
