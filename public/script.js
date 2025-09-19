document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    let userId;
    
    // DOM Elements
    const circle1 = document.getElementById('circle1');
    const circle2 = document.getElementById('circle2');
    const toggle1 = document.getElementById('toggle1');
    const toggle2 = document.getElementById('toggle2');
    const message = document.getElementById('message');
    
    // Initialize socket connection
    socket.on('connect', () => {
        console.log('Connected to server');
    });
    
    // Initialize user interface
    socket.on('init', (data) => {
        userId = data.userId;
        console.log(`You are ${userId}`);
        
        // Update UI based on initial status
        updateCircle('user1', data.users.user1.ready);
        updateCircle('user2', data.users.user2.ready);
        
        // Enable the correct toggle button
        if (userId === 'user1') {
            toggle1.disabled = false;
            toggle2.disabled = true;
            toggle1.textContent = data.users.user1.ready ? 'Not Ready' : 'I\'m Ready';
            toggle1.classList.toggle('ready', data.users.user1.ready);
        } else {
            toggle2.disabled = false;
            toggle1.disabled = true;
            toggle2.textContent = data.users.user2.ready ? 'Not Ready' : 'I\'m Ready';
            toggle2.classList.toggle('ready', data.users.user2.ready);
        }
    });
    
    // Update status when other user changes their status
    socket.on('statusUpdate', (data) => {
        updateCircle(data.userId, data.ready);
        
        // Update button text if it's the current user
        if (userId === data.userId) {
            const button = userId === 'user1' ? toggle1 : toggle2;
            button.textContent = data.ready ? 'Not Ready' : 'I\'m Ready';
            button.classList.toggle('ready', data.ready);
        }
    });
    
    // Handle both users being ready
    socket.on('bothReady', () => {
        message.textContent = 'Both users are ready! You can start your conversation now.';
        message.classList.add('show');
    });
    
    // Handle when users are not both ready
    socket.on('notBothReady', () => {
        message.classList.remove('show');
    });
    
    // Toggle ready status
    toggle1.addEventListener('click', () => toggleReady('user1'));
    toggle2.addEventListener('click', () => toggleReady('user2'));
    
    function toggleReady(user) {
        const isReady = !document.getElementById(`circle${user === 'user1' ? '1' : '2'}`).classList.contains('ready');
        socket.emit('toggleReady', { ready: isReady });
    }
    
    function updateCircle(user, isReady) {
        const circle = user === 'user1' ? circle1 : circle2;
        if (isReady) {
            circle.classList.add('ready');
        } else {
            circle.classList.remove('ready');
        }
    }
    
    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });
});
