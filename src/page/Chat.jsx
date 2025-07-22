import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Navbar from '../components/Navbar';
import '../style/Chat.css';
import logo from '../assets/logo.png';
import bumn from '../assets/BUMN.png';
import profile from '../assets/profile.jpg';

const socket = io('http://85.209.163.237:5000');

function Chat() {
    const [isNavbarActive, setIsNavbarActive] = useState(false);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]); 
    const [searchTerm, setSearchTerm] = useState(''); 
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    const loggedInAdmin = 'admin';

    // Fungsi untuk toggle Navbar
    const handleToggle = (isActive) => {
        setIsNavbarActive(isActive);
    };

    useEffect(() => {
        fetchUsers();

        // Register as admin when component mounts
        socket.emit('register_user', { username: loggedInAdmin });

        socket.on('receive_message', (message) => {
            console.log('Received message:', message);
            if (
                (message.sender === selectedUser && message.receiver === loggedInAdmin) ||
                (message.sender === loggedInAdmin && message.receiver === selectedUser)
            ) {
                // Check for duplicates before adding
                setMessages((prevMessages) => {
                    // Check if message already exists to prevent duplicates
                    const exists = prevMessages.some(msg => 
                        msg.sender === message.sender && 
                        msg.message === message.message && 
                        msg.created_at === message.created_at
                    );
                    if (!exists) {
                        return [...prevMessages, message];
                    }
                    return prevMessages;
                });
            }
        });

        return () => {
            socket.off('receive_message');
        };
    }, [selectedUser]);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://85.209.163.237:5000/api/users');
            const data = await response.json();
            const filtered = data.filter((user) => user !== loggedInAdmin);
            setUsers(filtered);
            setFilteredUsers(filtered); 
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchMessages = async (user) => {
        if (!user) return;
        try {
            const response = await fetch(
                `http://85.209.163.237:5000/api/messages?sender=${user}`
            );
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleUserClick = (user) => {
        setSelectedUser(user);
        fetchMessages(user);
    };

    const handleSendMessage = async () => {
        if (!selectedUser || newMessage.trim() === '') return;

        // Don't create timestamp - let the server handle it
        const messageData = {
            message: newMessage,
            sender: loggedInAdmin,
            receiver: selectedUser
        };

        // Send message through Socket.IO
        socket.emit('send_message', messageData);
        console.log('Sent message:', messageData);
        
        // Clear input immediately for better UX
        setNewMessage('');
        
        // Note: We don't add the message to UI here anymore
        // Instead, we'll wait for the server to send it back via socket
        // This ensures we use the server's timestamp
    };

    // Display the timestamp directly as received from server
    const formatMessageTime = (timestamp) => {
        if (!timestamp) return '';
        
        try {
            // Just extract the time part (HH:MM:SS) from the timestamp
            if (timestamp.includes(' ')) {
                // SQL format: YYYY-MM-DD HH:MM:SS
                return timestamp.split(' ')[1].substring(0, 5); // Extract HH:MM
            } else if (timestamp.includes('T')) {
                // ISO format
                return timestamp.split('T')[1].substring(0, 5); // Extract HH:MM
            }
            
            // If we can't parse it, just return as is
            return timestamp;
        } catch (error) {
            console.error('Error displaying timestamp:', error);
            return timestamp; // Return original on error
        }
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);
        const filtered = users.filter((user) =>
            user.toLowerCase().includes(value)
        );
        setFilteredUsers(filtered);
    };

    return (
        <div className={`layout-chat ${isNavbarActive ? 'navbar-active' : ''}`}>
            <div className={`navbar-chat ${isNavbarActive ? 'active' : ''}`}>
                <Navbar onToggle={handleToggle} />
            </div>
            <div className={`chat-content ${isNavbarActive ? 'shifted' : ''}`}>
                <div className="header-chat">
                    <img src={bumn} alt="BUMN Logo" className="header-logo-left" />
                    <h1 style={{color:"#002966"}}>Manajemen Pesan</h1>
                    <img src={logo} alt="Company Logo" className="header-logo-right" />
                </div>
                <br />
                <p style={{ color: '#fff' }}>
                    Ini adalah konten halaman chat. Lorem ipsum dolor sit amet,
                    consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                    labore et dolore magna aliqua.
                </p>

                <div className="sidebar">
                    <h2 style={{color:"#002966"}}>Pengguna</h2>
                    <div className="cari-pengguna">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            placeholder="Cari pengguna..."
                            className="search-input"
                        />
                    </div>
                    {filteredUsers.map((user, index) => (
                        <div
                            key={index}
                            className={`user-card ${user === selectedUser ? 'active' : ''}`}
                            onClick={() => handleUserClick(user)}
                        >
                            <img src={profile} alt="profile" className="profile" />
                            <span>{user}</span>
                        </div>
                    ))}
                </div>
                <div className="chat-area">
                    {selectedUser ? (
                        <>
                            <h2 style={{color:"#002966"}}>Chat dengan {selectedUser}</h2>
                            <div className="messages">
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`message-card ${
                                            msg.sender === loggedInAdmin
                                                ? 'outgoing'
                                                : 'incoming'
                                        }`}
                                    >
                                        <p>{msg.message}</p>
                                        <small>
                                            {/* Display time without modifying the original format */}
                                            {msg.created_at ? formatMessageTime(msg.created_at) : ''}
                                        </small>
                                    </div>
                                ))}
                            </div>
                            <div className="input-chat">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Ketik pesan..."
                                />
                                <button onClick={handleSendMessage}>Kirim</button>
                            </div>
                        </>
                    ) : (
                        <p style={{color:"#002966"}}>Pilih pengguna untuk melihat pesan.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Chat;
