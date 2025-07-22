const sql = require('mssql');
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const multer = require('multer');
const admin = require('firebase-admin');
const serviceAccount = require('./ServiceKeyFCM.json');


const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// Connection pool configuration
// const config = {
//     user: 'sa',
//     password: '12345678',
//     server: 'LAPTOP-BCF7QI7L',
//     database: 'medsos',
//     options: {
//         encrypt: true,
//         trustServerCertificate: true,
//     },
// };

// // Connection pool configuration
const config = {
    user: 'ra',
    password: '12345678',
    server: 'RAKHA',
    database: 'medsos',
    options: {
        encrypt: true,
        trustServerCertificate: true,
    },
};
// Initialize connection pool
// Connection pool configuration (Ensure this is done only once)
const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to SQL Server');
        return pool;
    })
    .catch(err => {
        console.error('SQL Server Connection Error:', err);
        process.exit(1); // Exit the process on connection failure
    });

// Helper function to get pool from the connection pool promise
const getPool = async () => {
    return poolPromise;
};

// Admin Login
app.post('/api/admin/login', async (req, res) => {
    console.log('Admin login request received:', req.body);
    
    const { email, password } = req.body;

    try {
        const pool = await getPool();

        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .input('password', sql.VarChar, password)
            .query('SELECT * FROM admin WHERE email = @email AND password = @password');

        if (result.recordset.length > 0) {
            const admin = result.recordset[0];
            delete admin.password;
            
            res.json({
                success: true,
                message: 'Login successful',
                user: admin
            });
        } else {
            res.json({
                success: false,
                message: 'Invalid email or password'
            });
        }
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Admin Register
app.post('/api/admin/register', async (req, res) => {
    console.log('Admin register request received:', req.body);
    
    const { username, email, password, confirm_password } = req.body;

    // Validate password match
    if (password !== confirm_password) {
        return res.status(400).json({
            success: false,
            message: 'Passwords do not match'
        });
    }

    try {
        const pool = await getPool();

        // Check if email already exists
        const checkEmail = await pool.request()
            .input('email', sql.VarChar, email)
            .query('SELECT * FROM admin WHERE email = @email');

        if (checkEmail.recordset.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Insert new admin
        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .input('email', sql.VarChar, email)
            .input('password', sql.VarChar, password)
            .query('INSERT INTO admin (username, email, password) VALUES (@username, @email, @password)');

        res.json({
            success: true,
            message: 'Admin registered successfully'
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Login peserta
app.post('/api/peserta/login', async (req, res) => {
    console.log('Login request received:', req.body);
    
    const { ktpa, password } = req.body;

    try {
        const pool = await getPool();

        const result = await pool.request()
            .input('ktpa', sql.VarChar, ktpa)
            .input('password', sql.VarChar, password)
            .query('SELECT * FROM peserta WHERE ktpa = @ktpa AND password = @password');

        if (result.recordset.length > 0) {
            const peserta = result.recordset[0];
            delete peserta.password;
            
            // Add session management logic here (e.g., create JWT token)
            res.json({
                success: true,
                message: 'Login successful',
                peserta: peserta
            });
        } else {
            res.json({
                success: false,
                message: 'KTPA atau Password anda salah'
            });
        }
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Logout logic (clear session or token)
app.post('/api/peserta/logout', (req, res) => {
    // Implement logout logic, clear session or JWT token
    res.json({
        success: true,
        message: 'Logout successful'
    });
});

// Endpoint untuk mengganti password
app.post('/api/peserta/reset-password', async (req, res) => {
    const { ktpa, newPassword } = req.body;

    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('ktpa', sql.VarChar, ktpa)
            .input('newPassword', sql.VarChar, newPassword)
            .query('UPDATE peserta SET password = @newPassword WHERE ktpa = @ktpa');

        if (result.rowsAffected[0] > 0) {
            res.json({ success: true, message: 'Password berhasil diubah' });
        } else {
            res.json({ success: false, message: 'KTPA tidak ditemukan' });
        }
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

app.post('/api/peserta/register', async (req, res) => {
    const { ktpa, nama, jenis_kelamin, password, email } = req.body;
    const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const query = `
        INSERT INTO peserta (ktpa, nama, jenis_kelamin, password, created_at, updated_at, level, email)
        VALUES (@ktpa, @nama, @jenis_kelamin, @password, @created_at, @updated_at, @level, @email)
    `;

    try {
        const pool = await getPool();
        
        const result = await pool.request()
            .input('ktpa', sql.VarChar, ktpa)
            .input('nama', sql.VarChar, nama)
            .input('jenis_kelamin', sql.VarChar, jenis_kelamin)
            .input('password', sql.VarChar, password)
            .input('created_at', sql.DateTime, created_at)
            .input('updated_at', sql.DateTime, created_at)
            .input('level', sql.VarChar, 'peserta')
            .input('email', sql.VarChar, email)
            .query(query);

        res.status(201).json({ message: 'Pendaftaran berhasil' });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint untuk memperbarui data peserta
app.put('/api/peserta/update', async (req, res) => {
    const { ktpa, nama, email, jenis_kelamin, bio } = req.body;

    // Validasi input
    if (!ktpa || !nama || !email) {
        return res.status(400).json({ error: 'KTPA, nama, dan email harus diisi' });
    }

    const query = `
        UPDATE peserta 
        SET nama = @nama, email = @email, jenis_kelamin = @jenis_kelamin, bio = @bio 
        WHERE ktpa = @ktpa
    `;

    try {
        const pool = await getPool();
        
        const result = await pool.request()
            .input('ktpa', sql.VarChar, ktpa)
            .input('nama', sql.VarChar, nama)
            .input('email', sql.VarChar, email)
            .input('jenis_kelamin', sql.VarChar, jenis_kelamin)
            .input('bio', sql.Text, bio)
            .query(query);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Peserta tidak ditemukan' });
        }

        res.json({ message: 'Data peserta berhasil diperbarui' });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Post event
app.post('/api/postev', upload.single('image'), async (req, res) => {
    console.log('Received data:', req.body);
    const image = req.file;
    const { ktpa, title, description, date, loc, kuota } = req.body;

    if (!title || !description) {
        console.error('Invalid data received');
        return res.status(400).send('Title and Description are required');
    }

    const formatDate = (date) => {
        const d = new Date(date);
        return d.toISOString(); // Format: 'yyyy-MM-ddTHH:mm:ss.SSSZ'
    };

    const formattedDate = formatDate(date);
    const created_at = new Date();

    const query = `INSERT INTO event (ktpa, evtitle, evdesc, evdate, evloc, evkuota, eventpic, created_at) 
                   VALUES (@ktpa, @title, @description, @date, @loc, @kuota, @image, @created_at)`;

    try {
        const pool = await getPool();
        const request = pool.request();
        request.input('ktpa', sql.VarChar, ktpa);
        request.input('title', sql.VarChar, title);
        request.input('description', sql.Text, description);
        request.input('date', sql.DateTime, formattedDate);
        request.input('loc', sql.VarChar, loc);
        request.input('kuota', sql.VarChar, kuota);
        request.input('image', sql.VarBinary, image.buffer);
        request.input('created_at', sql.DateTime, created_at);

        await request.query(query);

        const message = {
            notification: {
                title: 'Informasi Event Terbaru!',
                body: `${title}`,
            },
            data: {
                event_title: title,
                event_desc: description,
                event_date: formattedDate,
                event_location: loc,
                event_kuota: kuota,
            },
            topic: 'all',
        };

        admin.messaging().send(message)
            .then(response => {
                console.log('Successfully sent message:', response);
                res.status(200).send('Post created and notification sent');
            })
            .catch(error => {
                console.error('Error sending notification:', error);
                res.status(200).send('Post created but failed to send notification');
            });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).send('Database error');
    }
});

// Get events
app.get('/api/getev', async (req, res) => {
    const query = 'SELECT * FROM event ORDER BY created_at DESC';

    try {
        const pool = await getPool();
        const result = await pool.request().query(query);

        const posts = result.recordset.map(post => {
            if (post.eventpic) {
                post.media_url = `data:image/jpeg;base64,${Buffer.from(post.eventpic).toString('base64')}`;
            } else {
                post.media_url = null;
            }
            return post;
        });

        res.json(posts);
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/komunitas', async (req, res) => {
    try {
        // const pool = await sql.connect(config);
        const pool = await getPool();
        const result = await pool.request().query('SELECT * FROM komunitas');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Endpoint to join a community
app.post('/api/join-komunitas', async (req, res) => {
    const { user_ktpa, komunitas_id } = req.body;
    console.log('Received data:', req.body);

    try {
        // const pool = await sql.connect(config);

        const pool = await getPool();

        // Check if user is already in the community
        const checkQuery = 'SELECT * FROM anggota_komunitas WHERE komunitas_id = @komunitas_id AND user_ktpa = @user_ktpa';
        const checkResult = await pool.request()
            .input('komunitas_id', sql.Int, komunitas_id)
            .input('user_ktpa', sql.NVarChar(16), user_ktpa)
            .query(checkQuery);

        if (checkResult.recordset.length > 0) {
            return res.status(400).json({ success: false, message: 'Pengguna sudah bergabung dengan komunitas ini' });
        }

        // Insert the user into the community
        const insertQuery = 'INSERT INTO anggota_komunitas (komunitas_id, user_ktpa) VALUES (@komunitas_id, @user_ktpa)';
        await pool.request()
            .input('komunitas_id', sql.Int, komunitas_id)
            .input('user_ktpa', sql.NVarChar(16), user_ktpa)
            .query(insertQuery);

        res.status(200).json({ success: true, message: 'Berhasil bergabung dengan komunitas' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Endpoint to leave a community
app.post('/api/unjoin-komunitas', async (req, res) => {
    const { user_ktpa, komunitas_id } = req.body;
    console.log('Received data:', req.body);

    try {
        // const pool = await sql.connect(config);
        const pool = await getPool();

        // Check if user is already in the community
        const checkQuery = 'SELECT * FROM anggota_komunitas WHERE komunitas_id = @komunitas_id AND user_ktpa = @user_ktpa';
        const checkResult = await pool.request()
            .input('komunitas_id', sql.Int, komunitas_id)
            .input('user_ktpa', sql.NVarChar(16), user_ktpa)
            .query(checkQuery);

        if (checkResult.recordset.length === 0) {
            return res.status(400).json({ success: false, message: 'Pengguna belum bergabung dengan komunitas ini' });
        }

        // Delete user from the community
        const deleteQuery = 'DELETE FROM anggota_komunitas WHERE komunitas_id = @komunitas_id AND user_ktpa = @user_ktpa';
        await pool.request()
            .input('komunitas_id', sql.Int, komunitas_id)
            .input('user_ktpa', sql.NVarChar(16), user_ktpa)
            .query(deleteQuery);

        res.status(200).json({ success: true, message: 'Berhasil meninggalkan komunitas' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Endpoint to check if user has joined a community
app.post('/api/is-user-joined', async (req, res) => {
    const { user_ktpa, komunitas_id } = req.body;

    console.log('Checking join status for:', user_ktpa, 'in komunitas', komunitas_id);

    try {
        // const pool = await sql.connect(config);
        const pool = await getPool();

        // Check if user is in the community
        const query = 'SELECT * FROM anggota_komunitas WHERE komunitas_id = @komunitas_id AND user_ktpa = @user_ktpa';
        const result = await pool.request()
            .input('komunitas_id', sql.Int, komunitas_id)
            .input('user_ktpa', sql.NVarChar(16), user_ktpa)
            .query(query);

        if (result.recordset.length > 0) {
            return res.status(200).json(true); // User is joined
        } else {
            return res.status(200).json(false); // User is not joined
        }
    } catch (err) {
        console.error('Error executing query:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Endpoint for a user to leave a community
app.post('/api/leave-komunitas', async (req, res) => {
    const { user_ktpa, komunitas_id } = req.body;

    console.log('Leaving community for:', user_ktpa, 'in komunitas', komunitas_id);

    try {
        // const pool = await sql.connect(config);
        const pool = await getPool();


        // Check if user is already in the community
        const checkQuery = 'SELECT * FROM anggota_komunitas WHERE komunitas_id = @komunitas_id AND user_ktpa = @user_ktpa';
        const checkResult = await pool.request()
            .input('komunitas_id', sql.Int, komunitas_id)
            .input('user_ktpa', sql.NVarChar(16), user_ktpa)
            .query(checkQuery);

        if (checkResult.recordset.length === 0) {
            return res.status(400).json({ success: false, message: 'Pengguna belum bergabung dengan komunitas ini' });
        }

        // Delete user from the community
        const deleteQuery = 'DELETE FROM anggota_komunitas WHERE komunitas_id = @komunitas_id AND user_ktpa = @user_ktpa';
        await pool.request()
            .input('komunitas_id', sql.Int, komunitas_id)
            .input('user_ktpa', sql.NVarChar(16), user_ktpa)
            .query(deleteQuery);

        return res.status(200).json({ success: true, message: 'Berhasil meninggalkan komunitas' });
    } catch (err) {
        console.error('Error executing delete query:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

app.get('/api/posts', async (req, res) => {
    const query = `
        SELECT p.*, pe.nama,
        (SELECT COUNT(*) FROM comment WHERE post_id = p.id) as comment_count
        FROM post p 
        JOIN peserta pe ON p.ktpa = pe.ktpa 
        ORDER BY p.created_at DESC
    `;

    try {
        // Connect to the database
        let pool = await sql.connect(config);

        // Perform the query
        const result = await pool.request().query(query);

        const posts = result.recordset.map(post => {
            if (post.media_url) {
                post.media_url = Buffer.from(post.media_url).toString('base64');
            }
            return {
                ...post,
                comment_count: parseInt(post.comment_count) || 0
            };
        });

        res.json(posts);

    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        // Close the database connection
        sql.close();
    }
});

app.get('/api/posts/:id', async (req, res) => {
    const query = `
        SELECT p.*, pe.nama,
        (SELECT COUNT(*) FROM comment WHERE post_id = p.id) as comment_count
        FROM post p 
        JOIN peserta pe ON p.ktpa = pe.ktpa 
        WHERE p.id = @id
    `;

    try {
        // Connect to the database
        let pool = await sql.connect(config);

        // Perform the query
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(query);

        if (result.recordset.length > 0) {
            const post = result.recordset[0];
            if (post.media_url) {
                post.media_url = Buffer.from(post.media_url).toString('base64');
            }
            post.comment_count = parseInt(post.comment_count) || 0;
            res.json(post);
        } else {
            res.status(404).json({ message: 'Post not found' });
        }

    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        // Close the database connection
        sql.close();
    }
});

// Get comments for a specific post
app.get('/api/posts/:postId/comments', async (req, res) => {
    const query = `
        SELECT c.*, p.nama 
        FROM comment c
        JOIN peserta p ON c.ktpa = p.ktpa
        WHERE c.post_id = @postId
        ORDER BY c.created_at DESC
    `;

    try {
        // Connect to the database
        let pool = await sql.connect(config);

        // Perform the query
        const result = await pool.request()
            .input('postId', sql.Int, req.params.postId)
            .query(query);

        res.json(result.recordset);

    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        // Close the database connection
        sql.close();
    }
});

// Create a new comment
app.post('/api/comments', async (req, res) => {
    const { post_id, ktpa, content } = req.body;
    const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const updated_at = created_at;

    const query = `
        INSERT INTO comment (post_id, ktpa, content, created_at, updated_at)
        VALUES (@post_id, @ktpa, @content, @created_at, @updated_at);
        
        SELECT SCOPE_IDENTITY() AS id;
    `;

    console.log("Received request:", req.body);  // Log input data
    
    try {
        // Connect to the database
        let pool = await sql.connect(config);

        // Perform the query
        const result = await pool.request()
            .input('post_id', sql.Int, post_id)
            .input('ktpa', sql.VarChar, ktpa)
            .input('content', sql.Text, content)
            .input('created_at', sql.DateTime, created_at)
            .input('updated_at', sql.DateTime, updated_at)
            .query(query);

        console.log("Insert result:", result);  // Log insert result

        // Ensure we have a valid ID from the insert
        const newCommentId = result.recordset && result.recordset.length > 0 ? result.recordset[0].id : null;
        if (!newCommentId) {
            throw new Error('Failed to retrieve new comment ID');
        }

        // Get updated comment count
        const countQuery = 'SELECT COUNT(*) as count FROM comment WHERE post_id = @post_id';
        const countResult = await pool.request()
            .input('post_id', sql.Int, post_id)
            .query(countQuery);

        console.log("Comment count:", countResult.recordset[0].count);  // Log comment count
        
        const comment_count = countResult.recordset[0].count;

        // Return the new comment with count
        const selectQuery = `
            SELECT c.*, p.nama 
            FROM comment c
            JOIN peserta p ON c.ktpa = p.ktpa
            WHERE c.id = @id
        `;

        console.log("Fetching comment details for ID:", newCommentId);

        const commentResult = await pool.request()
            .input('id', sql.Int, newCommentId)
            .query(selectQuery);

        console.log("Comment details:", commentResult.recordset[0]);  // Log comment details

        res.json({
            message: 'Comment created successfully',
            comment: commentResult.recordset[0],
            comment_count: comment_count
        });

    } catch (err) {
        console.error("Error:", err.message);  // Log error if any
        res.status(500).json({ error: err.message });
    } finally {
        // Close the database connection
        sql.close();
    }
});

// Delete a comment
app.delete('/api/comments/:id', async (req, res) => {
    const query = 'DELETE FROM comment WHERE id = @id';

    try {
        // Connect to the database
        let pool = await sql.connect(config);

        // Perform the query
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(query);

        res.json({ message: 'Comment deleted successfully' });

    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        // Close the database connection
        sql.close();
    }
});

// Toggle like (like/unlike)
app.post('/api/posts/:postId/like', async (req, res) => {
    const { ktpa } = req.body;
    const postId = req.params.postId;
    const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

    try {
        // Connect to the database
        let pool = await sql.connect(config);

        // Check if like exists
        const checkQuery = 'SELECT id FROM likes WHERE post_id = @postId AND ktpa = @ktpa';
        const checkResult = await pool.request()
            .input('postId', sql.Int, postId)
            .input('ktpa', sql.VarChar, ktpa)
            .query(checkQuery);

        if (checkResult.recordset.length > 0) {
            // Unlike: Remove existing like
            const deleteQuery = 'DELETE FROM likes WHERE post_id = @postId AND ktpa = @ktpa';
            await pool.request()
                .input('postId', sql.Int, postId)
                .input('ktpa', sql.VarChar, ktpa)
                .query(deleteQuery);

            res.json({ liked: false, message: 'Post unliked successfully' });
        } else {
            // Like: Add new like
            const insertQuery = 'INSERT INTO likes (post_id, ktpa, created_at) VALUES (@postId, @ktpa, @created_at)';
            await pool.request()
                .input('postId', sql.Int, postId)
                .input('ktpa', sql.VarChar, ktpa)
                .input('created_at', sql.DateTime, created_at)
                .query(insertQuery);

            res.json({ liked: true, message: 'Post liked successfully' });
        }

    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        // Close the database connection
        sql.close();
    }
});
// Get like count for a specific post
app.get('/api/posts/:postId/likes', async (req, res) => {
    const postId = req.params.postId;

    const query = 'SELECT COUNT(*) as likeCount FROM likes WHERE post_id = @postId';

    try {
        let pool = await sql.connect(config);
        const result = await pool.request()
            .input('postId', sql.Int, postId)
            .query(query);

        res.json({
            likeCount: result.recordset[0].likeCount
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        sql.close();
    }
});

// Update post
app.put('/api/posts/:id', async (req, res) => {
    const postId = req.params.id;
    const { content } = req.body;
    const updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const query = 'UPDATE post SET content = @content, updated_at = @updated_at WHERE id = @postId';

    try {
        let pool = await sql.connect(config);
        const result = await pool.request()
            .input('content', sql.Text, content)
            .input('updated_at', sql.DateTime, updated_at)
            .input('postId', sql.Int, postId)
            .query(query);

        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ message: 'Post not found' });
            return;
        }

        res.json({
            message: 'Post updated successfully',
            post: {
                id: postId,
                content: content,
                updated_at: updated_at
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        sql.close();
    }
});

// Delete all likes for a specific post
app.delete('/api/posts/:postId/likes', async (req, res) => {
    const postId = req.params.postId;

    const query = 'DELETE FROM likes WHERE post_id = @postId';

    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('postId', sql.Int, postId)
            .query(query);

        res.json({ message: 'All likes deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        sql.close();
    }
});

// Delete all comments for a specific post
app.delete('/api/posts/:postId/comments', async (req, res) => {
    const postId = req.params.postId;

    const query = 'DELETE FROM comment WHERE post_id = @postId';

    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('postId', sql.Int, postId)
            .query(query);

        res.json({ message: 'All comments deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        sql.close();
    }
});

// Update delete post endpoint to handle cascading deletes
app.delete('/api/posts/:id', async (req, res) => {
    const postId = req.params.id;

    try {
        let pool = await sql.connect(config);

        // Start transaction
        const transaction = new sql.Transaction(pool);

        await transaction.begin();

        try {
            // First delete likes
            const deleteLikesQuery = 'DELETE FROM likes WHERE post_id = @postId';
            await transaction.request()
                .input('postId', sql.Int, postId)
                .query(deleteLikesQuery);

            // Then delete comments
            const deleteCommentsQuery = 'DELETE FROM comment WHERE post_id = @postId';
            await transaction.request()
                .input('postId', sql.Int, postId)
                .query(deleteCommentsQuery);

            // Finally delete the post
            const deletePostQuery = 'DELETE FROM post WHERE id = @postId';
            const result = await transaction.request()
                .input('postId', sql.Int, postId)
                .query(deletePostQuery);

            if (result.rowsAffected[0] === 0) {
                await transaction.rollback();
                res.status(404).json({ message: 'Post not found' });
                return;
            }

            await transaction.commit();

            res.json({ message: 'Post and all related data deleted successfully' });

        } catch (err) {
            await transaction.rollback();
            res.status(500).json({ error: err.message });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        sql.close();
    }
});

const videoChunks = {};

app.post('/api/post', async (req, res) => {
    const { ktpa, content, created_at, updated_at, media_url, media_type } = req.body;

    try {
        const pool = await getPool();
        console.log('Request body:', req.body);

        // Insert the post
        const query = `
            INSERT INTO post (ktpa, content, created_at, updated_at, media_url, media_type) 
            OUTPUT INSERTED.id
            VALUES (@ktpa, @content, @created_at, @updated_at, @media_url, @media_type)
        `;
        
        const request = pool.request()
            .input('ktpa', sql.VarChar, ktpa)
            .input('content', sql.Text, content)
            .input('created_at', sql.DateTime, created_at)
            .input('updated_at', sql.DateTime, updated_at);

        // Handle media_url and media_type
        if (media_url && media_type) {
            const mediaBlob = Buffer.from(media_url, 'base64');
            request.input('media_url', sql.VarBinary, mediaBlob)
                  .input('media_type', sql.VarChar, media_type);
        } else {
            request.input('media_url', sql.VarBinary, null)
                  .input('media_type', sql.VarChar, null);
        }

        const result = await request.query(query);

        if (!result.recordset || result.recordset.length === 0) {
            throw new Error('Failed to get the inserted post ID.');
        }

        // Calculate similarity scores for all posts
        await calculateSimilarityScores(pool, ktpa);

        // Get the inserted post with updated similarity score
        const selectQuery = `
            SELECT p.*, pe.nama 
            FROM post p
            JOIN peserta pe ON p.ktpa = pe.ktpa
            WHERE p.id = @id
        `;

        const postResult = await pool.request()
            .input('id', sql.Int, result.recordset[0].id)
            .query(selectQuery);

        res.json({
            message: 'Post created successfully',
            post: postResult.recordset[0]
        });
    } catch (err) {
        console.error('Error saving post:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get all news
app.get('/api/news', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .query('SELECT id, title, description, date, created_at, updated_at, image, author FROM news ORDER BY created_at DESC');
        
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching news:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get single news by id
app.get('/api/news/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT id, title, description, date, created_at, updated_at, image, author FROM news WHERE id = @id');
        
        if (result.recordset.length > 0) {
            res.json(result.recordset[0]);
        } else {
            res.status(404).json({ message: 'News not found' });
        }
    } catch (err) {
        console.error('Error fetching news:', err);
        res.status(500).json({ error: err.message });
    }
});

// Add new news
app.post('/api/news', async (req, res) => {
    const { date, title, description, image, author } = req.body;
    const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const updated_at = created_at;

    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('date', sql.DateTime, date)
            .input('title', sql.NVarChar, title)
            .input('description', sql.NText, description)
            .input('image', sql.NVarChar, image)
            .input('author', sql.NVarChar, author)
            .input('created_at', sql.DateTime, created_at)
            .input('updated_at', sql.DateTime, updated_at)
            .query(`
                INSERT INTO news (date, title, description, image, author, created_at, updated_at)
                OUTPUT INSERTED.id
                VALUES (@date, @title, @description, @image, @author, @created_at, @updated_at)
            `);

        res.status(201).json({ 
            id: result.recordset[0].id,
            date, 
            title, 
            description, 
            image, 
            author,
            created_at,
            updated_at
        });
    } catch (err) {
        console.error('Error creating news:', err);
        res.status(500).json({ error: err.message });
    }
});
// Get all news (alternative route)
app.get('/news', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query('SELECT * FROM news');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update news
app.put('/api/news/:id', async (req, res) => {
    const { id } = req.params;
    const { date, title, description, image, author } = req.body;
    const updated_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('date', sql.DateTime, date)
            .input('title', sql.NVarChar, title)
            .input('description', sql.NText, description)
            .input('image', sql.NVarChar, image)
            .input('author', sql.NVarChar, author)
            .input('updated_at', sql.DateTime, updated_at)
            .query(`
                UPDATE news 
                SET date = @date, 
                    title = @title, 
                    description = @description,
                    image = @image,
                    author = @author,
                    updated_at = @updated_at
                WHERE id = @id
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'News not found' });
        }

        res.json({ 
            id: parseInt(id),
            date, 
            title, 
            description,
            image,
            author,
            updated_at
        });
    } catch (err) {
        console.error('Error updating news:', err);
        res.status(500).json({ error: err.message });
    }
});

// Delete news
app.delete('/api/news/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM news WHERE id = @id');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'News not found' });
        }

        res.status(204).send();
    } catch (err) {
        console.error('Error deleting news:', err);
        res.status(500).json({ error: err.message });
    }
});
// Endpoint untuk mendapatkan semua event
app.get('/api/event', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .query('SELECT id, ktpa, evtitle, evdesc, evdate, evloc, evkuota, eventpic FROM event');
        
        // Konversi eventpic dari binary ke Base64
        const formattedResults = result.recordset.map((event) => {
            return {
                ...event,
                eventpic: event.eventpic 
                    ? `data:image/png;base64,${Buffer.from(event.eventpic).toString("base64")}`
                    : null,
            };
        });

        res.json(formattedResults);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint: Tambah event
app.post('/api/events', async (req, res) => {
    const { ktpa, evtitle, evdesc, evdate, evloc, evkuota, eventpic } = req.body;

    try {
        const pool = await getPool();
        const request = pool.request()
            .input('ktpa', sql.VarChar, ktpa)
            .input('evtitle', sql.VarChar, evtitle)
            .input('evdesc', sql.Text, evdesc)
            .input('evdate', sql.DateTime, evdate)
            .input('evloc', sql.VarChar, evloc)
            .input('evkuota', sql.Int, evkuota)
            .input('createdAt', sql.DateTime, new Date());

        // Handle binary image data if present
        if (eventpic) {
            const imageBuffer = Buffer.from(eventpic.split(',')[1], 'base64');
            request.input('eventpic', sql.VarBinary(sql.MAX), imageBuffer);
        } else {
            request.input('eventpic', sql.VarBinary(sql.MAX), null);
        }

        const result = await request.query(`
            INSERT INTO event (ktpa, evtitle, evdesc, evdate, evloc, evkuota, eventpic, created_at)
            OUTPUT INSERTED.id, INSERTED.ktpa, INSERTED.evtitle, INSERTED.evdesc, 
                  INSERTED.evdate, INSERTED.evloc, INSERTED.evkuota
            VALUES (@ktpa, @evtitle, @evdesc, @evdate, @evloc, @evkuota, @eventpic, @createdAt)
        `);

        // Kirim notifikasi setelah event berhasil disimpan
        await sendNotification(evtitle, evdesc, {
            evtitle,
            evdesc,
            evdate,
            evloc,
            evkuota,
            eventpic
        });

        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint: Update event
app.put('/api/event/:id', async (req, res) => {
    const { id } = req.params;
    const { ktpa, evtitle, evdesc, evdate, evloc, evkuota, eventpic } = req.body;

    try {
        const pool = await getPool();
        const request = pool.request()
            .input('id', sql.Int, id)
            .input('ktpa', sql.VarChar, ktpa)
            .input('evtitle', sql.VarChar, evtitle)
            .input('evdesc', sql.Text, evdesc)
            .input('evdate', sql.DateTime, evdate)
            .input('evloc', sql.VarChar, evloc)
            .input('evkuota', sql.Int, evkuota)
            .input('updatedAt', sql.DateTime, new Date());

        // Handle image update if provided
        if (eventpic) {
            const imageBuffer = Buffer.from(eventpic.split(',')[1], 'base64');
            request.input('eventpic', sql.VarBinary(sql.MAX), imageBuffer);
        }

        const query = eventpic ? `
            UPDATE event 
            SET ktpa = @ktpa, evtitle = @evtitle, evdesc = @evdesc, 
                evdate = @evdate, evloc = @evloc, evkuota = @evkuota, 
                eventpic = @eventpic, updated_at = @updatedAt
            OUTPUT INSERTED.id, INSERTED.ktpa, INSERTED.evtitle, INSERTED.evdesc, 
                  INSERTED.evdate, INSERTED.evloc, INSERTED.evkuota
            WHERE id = @id
        ` : `
            UPDATE event 
            SET ktpa = @ktpa, evtitle = @evtitle, evdesc = @evdesc, 
                evdate = @evdate, evloc = @evloc, evkuota = @evkuota, 
                updated_at = @updatedAt
            OUTPUT INSERTED.id, INSERTED.ktpa, INSERTED.evtitle, INSERTED.evdesc, 
                  INSERTED.evdate, INSERTED.evloc, INSERTED.evkuota
            WHERE id = @id
        `;

        const result = await request.query(query);
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint: Hapus event
app.delete('/api/event/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM event WHERE id = @id');
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json({ message: 'Event deleted successfully', id });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// TF-IDF Service class
class TfIdfService {
    constructor() {
        this.tfIdfMatrix = new Map();
        this.idfScores = new Map();
        this.allDocuments = [];
        this.stopWords = new Set([
            'yang', 'dan', 'di', 'ke', 'dari', 'ini', 'itu', 'dengan', 'untuk', 'pada',
            'adalah', 'dalam', 'oleh', 'karena', 'jika', 'atau', 'tetapi', 'namun', 'sehingga',
            'agar', 'supaya', 'karena', 'sebab', 'maka', 'jadi', 'oleh', 'karena', 'sehingga',
            'saya', 'kamu', 'dia', 'mereka', 'kita', 'kami', 'anda', 'beliau', 'mereka',
            'ini', 'itu', 'sini', 'situ', 'sana', 'mana', 'apa', 'siapa', 'kapan', 'dimana',
            'bagaimana', 'mengapa', 'berapa', 'yang', 'pun', 'lah', 'kah', 'tah', 'kan',
            'nya', 'ku', 'mu', 'nya', 'kau', 'dia', 'mereka', 'kita', 'kami', 'anda'
        ]);
    }

    preprocessText(text) {
        if (!text) return '';
        
        // Convert to lowercase
        let processed = text.toLowerCase();
        
        // Remove URLs
        processed = processed.replace(/https?:\/\/\S+/g, '');
        
        // Remove special characters and numbers
        processed = processed.replace(/[^a-z\s]/g, ' ');
        
        // Remove extra whitespace
        processed = processed.replace(/\s+/g, ' ').trim();
        
        // Tokenize
        let tokens = processed.split(' ');
        
        // Remove stopwords
        tokens = tokens.filter(token => !this.stopWords.has(token));
        
        return tokens.join(' ');
    }

    processDocuments(documents) {
        if (!documents || documents.length === 0) return;
        
        this.allDocuments = documents.map(doc => this.preprocessText(doc));
        this.calculateTfIdf();
    }

    calculateTfIdf() {
        // Calculate term frequencies
        const termFrequencies = new Map();
        const allTerms = new Set();

        for (const doc of this.allDocuments) {
            if (!doc) continue;
            
            const docTerms = new Map();
            const terms = doc.split(/\s+/);
            
            for (const term of terms) {
                if (term) {
                    docTerms.set(term, (docTerms.get(term) || 0) + 1);
                    allTerms.add(term);
                }
            }
            termFrequencies.set(doc, docTerms);
        }

        // Calculate IDF scores with smoothing
        for (const term of allTerms) {
            let docsWithTerm = 0;
            for (const docTerms of termFrequencies.values()) {
                if (docTerms.has(term)) {
                    docsWithTerm++;
                }
            }
            const idf = Math.log10((this.allDocuments.length + 1.0) / (docsWithTerm + 1.0));
            this.idfScores.set(term, idf);
        }

        // Calculate TF-IDF scores
        for (const [doc, docTerms] of termFrequencies.entries()) {
            const docTfIdf = new Map();
            for (const [term, tf] of docTerms.entries()) {
                const idf = this.idfScores.get(term);
                docTfIdf.set(term, tf * (idf + 1.0)); // Apply smoothing
            }
            this.tfIdfMatrix.set(doc, docTfIdf);
        }
    }

    calculateCosineSimilarity(vec1, vec2) {
        if (!vec1 || !vec2) return 0;

        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;

        // Calculate dot product
        for (const [term, value] of vec1) {
            if (vec2.has(term)) {
                dotProduct += value * vec2.get(term);
            }
        }

        // Calculate norms
        for (const value of vec1.values()) {
            norm1 += value * value;
        }
        for (const value of vec2.values()) {
            norm2 += value * value;
        }

        norm1 = Math.sqrt(norm1);
        norm2 = Math.sqrt(norm2);

        if (norm1 === 0 || norm2 === 0) {
            return 0;
        }

        return dotProduct / (norm1 * norm2);
    }
}

// Function to calculate similarity scores for all posts
async function calculateSimilarityScores(pool, ktpa) {
    try {
        console.log('Starting similarity score calculation for ktpa:', ktpa);
        
        // Get all posts
        const allPostsQuery = `
            SELECT p.*, pe.nama as userName
            FROM post p
            JOIN peserta pe ON p.ktpa = pe.ktpa
            ORDER BY p.created_at DESC
        `;
        const allPostsResult = await pool.request().query(allPostsQuery);
        console.log('Retrieved', allPostsResult.recordset.length, 'posts');
        
        // Create TF-IDF service
        const tfIdfService = new TfIdfService();
        
        // Get user's posts for comparison
        const userPostsQuery = `
            SELECT content 
            FROM post 
            WHERE ktpa = @ktpa 
            ORDER BY created_at DESC
        `;
        const userPostsResult = await pool.request()
            .input('ktpa', sql.VarChar, ktpa)
            .query(userPostsQuery);
        console.log('Retrieved', userPostsResult.recordset.length, 'user posts');

        // If user has no posts, use all posts for comparison
        const userInterests = userPostsResult.recordset.length > 0 
            ? userPostsResult.recordset.map(post => post.content).join(' ')
            : allPostsResult.recordset.map(post => post.content).join(' ');
        console.log('User interests length:', userInterests.length);

        // Process all documents
        const allPosts = allPostsResult.recordset.map(post => post.content);
        tfIdfService.processDocuments([userInterests, ...allPosts]);
        console.log('Processed documents for TF-IDF calculation');

        // Calculate similarity scores for all posts
        const similarityScores = new Map();
        for (let i = 0; i < allPosts.length; i++) {
            const similarity = tfIdfService.calculateCosineSimilarity(
                tfIdfService.tfIdfMatrix.get(userInterests),
                tfIdfService.tfIdfMatrix.get(allPosts[i])
            );
            similarityScores.set(allPostsResult.recordset[i].id, similarity);
        }
        console.log('Calculated similarity scores for', similarityScores.size, 'posts');

        // Update similarity scores in database
        let updateCount = 0;
        for (const [postId, score] of similarityScores) {
            const updateResult = await pool.request()
                .input('postId', sql.Int, postId)
                .input('similarityScore', sql.Float, score)
                .query('UPDATE post SET similarity_score = @similarityScore WHERE id = @postId');
            updateCount += updateResult.rowsAffected[0];
        }
        console.log('Updated similarity scores for', updateCount, 'posts');

        return similarityScores;
    } catch (err) {
        console.error('Error calculating similarity scores:', err);
        console.error('Error stack:', err.stack);
        throw err;
    }
}

// Function to ensure similarity_score column exists
async function ensureSimilarityScoreColumn(pool) {
    try {
        // Check if column exists
        const checkColumnQuery = `
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'post' 
            AND COLUMN_NAME = 'similarity_score'
        `;
        
        const result = await pool.request().query(checkColumnQuery);
        
        // If column doesn't exist, add it
        if (result.recordset.length === 0) {
            const addColumnQuery = `
                ALTER TABLE post 
                ADD similarity_score FLOAT DEFAULT 0.0
            `;
            await pool.request().query(addColumnQuery);
            console.log('Added similarity_score column to post table');
        }
    } catch (err) {
        console.error('Error ensuring similarity_score column:', err);
        throw err;
    }
}

// Modify the recommended posts endpoint
app.get('/api/recommended-posts', async (req, res) => {
    const { ktpa } = req.query;
    console.log('Getting recommended posts for ktpa:', ktpa);

    try {
        const pool = await getPool();

        // Ensure similarity_score column exists
        await ensureSimilarityScoreColumn(pool);

        // Calculate similarity scores for all posts
        await calculateSimilarityScores(pool, ktpa);

        // Get recommended posts with non-zero similarity scores
        const recommendedPostsQuery = `
            SELECT TOP 10 p.*, pe.nama as userName
            FROM post p
            JOIN peserta pe ON p.ktpa = pe.ktpa
            WHERE p.ktpa != @ktpa
            AND p.similarity_score > 0
            ORDER BY p.similarity_score DESC
        `;

        const recommendedPostsResult = await pool.request()
            .input('ktpa', sql.VarChar, ktpa)
            .query(recommendedPostsQuery);

        console.log('Retrieved', recommendedPostsResult.recordset.length, 'recommended posts');

        const posts = recommendedPostsResult.recordset.map(post => ({
            id: post.id,
            ktpa: post.ktpa,
            content: post.content,
            created_at: post.created_at,
            updated_at: post.updated_at,
            media_url: post.media_url ? post.media_url.toString('base64') : null,
            media_type: post.media_type,
            userName: post.userName,
            similarityScore: post.similarity_score
        }));

        console.log('Sending recommended posts response');
        res.json(posts);
    } catch (err) {
        console.error('Error in recommended posts endpoint:', err);
        console.error('Error stack:', err.stack);
        res.status(500).json({ 
            error: err.message,
            stack: err.stack
        });
    }
});
// API: Get Counts
app.get("/api/counts", async (req, res) => {
    try {
        const pool = await getPool();
        
        // Get user count
        const userCountResult = await pool.request()
            .query("SELECT COUNT(*) AS count FROM peserta");
        console.log('User Count:', userCountResult.recordset);
        
        // Get event count
        const eventCountResult = await pool.request()
            .query("SELECT COUNT(*) AS count FROM event");
        console.log('Event Count:', eventCountResult.recordset);
        
        // Get news count
        const newsCountResult = await pool.request()
            .query("SELECT COUNT(*) AS count FROM news");
        console.log('News Count:', newsCountResult.recordset);
         // Get post count
         const postCountResult = await pool.request()
         .query("SELECT COUNT(*) AS count FROM post");
     console.log('post Count:', postCountResult.recordset);

        // Extract counts
        const userCount = userCountResult.recordset[0]?.count || 0;
        const eventCount = eventCountResult.recordset[0]?.count || 0;
        const newsCount = newsCountResult.recordset[0]?.count || 0;
        const postCount = postCountResult.recordset[0]?.count || 0;

        res.status(200).json({
            peserta: userCount,
            event: eventCount,
            news: newsCount,
            post: postCount,
        });
    } catch (err) {
        console.error("Error fetching counts:", err);
        res.status(500).json({ message: "Failed to fetch counts." });
    }
});

// API: Register Admin
app.post("/api/admin/register", async (req, res) => {
    const { username, email, password, confirm_password } = req.body;

    if (password !== confirm_password) {
        return res.status(400).json({ message: "Passwords do not match." });
    }

    try {
        const pool = await getPool();
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.request()
            .input('username', sql.VarChar, username)
            .input('email', sql.VarChar, email)
            .input('password', sql.VarChar, hashedPassword)
            .input('createdAt', sql.DateTime, new Date())
            .query(`
                INSERT INTO admin (username, email, password, createdAt) 
                OUTPUT INSERTED.id 
                VALUES (@username, @email, @password, @createdAt)
            `);

        res.status(201).json({ 
            message: "User registered successfully.", 
            user: { 
                id: result.recordset[0].id, 
                username, 
                email 
            } 
        });
    } catch (err) {
        res.status(500).json({ message: "Error registering user.", error: err.message });
    }
});

// API: Login Admin
app.post("/api/admin/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query("SELECT * FROM admin WHERE email = @email");
        
        if (result.recordset.length === 0) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        const user = result.recordset[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password." });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({
            message: "Login successful.",
            token,
            user: { username: user.username },
        });
    } catch (err) {
        console.error("Error logging in:", err);
        res.status(500).json({ message: "Error logging in.", error: err.message });
    }
});

// API: Protected Route
app.get("/api/protected", async (req, res) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return res.status(401).json({ message: "Authorization token is required." });
    }

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.status(200).json({ message: "Access granted.", user: decoded });
    } catch (err) {
        res.status(401).json({ message: "Invalid or expired token." });
    }
});

// API: Get Messages Users
app.get('/api/users', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .query(`
                SELECT DISTINCT sender AS username FROM messages
                UNION
                SELECT DISTINCT receiver AS username FROM messages
            `);
            
        res.json(result.recordset.map(row => row.username));
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API: Get Messages
app.get('/api/messages', async (req, res) => {
    const { sender } = req.query;

    if (!sender) {
        return res.status(400).json({ error: 'Sender is required' });
    }

    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('sender', sql.VarChar, sender)
            .query(`
                SELECT * FROM messages
                WHERE sender = @sender OR receiver = @sender
                ORDER BY created_at ASC
            `);
            
        res.json(result.recordset);
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// API: Send Message
app.post('/api/messages', async (req, res) => {
    const { message, sender, receiver } = req.body;

    if (!message || !sender || !receiver) {
        return res.status(400).json({ error: 'Invalid input data' });
    }

    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('message', sql.Text, message)
            .input('sender', sql.VarChar, sender)
            .input('receiver', sql.VarChar, receiver)
            .input('createdAt', sql.DateTime, new Date())
            .query(`
                INSERT INTO messages (message, sender, receiver, created_at)
                OUTPUT INSERTED.id, INSERTED.message, INSERTED.sender, INSERTED.receiver, INSERTED.created_at
                VALUES (@message, @sender, @receiver, @createdAt)
            `);

        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error occurred.' });
    }
});
// Endpoint untuk mendapatkan semua event
app.get('/api/event', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .query('SELECT id, ktpa, evtitle, evdesc, evdate, evloc, evkuota, eventpic FROM event');
        
        // Konversi eventpic dari binary ke Base64
        const formattedResults = result.recordset.map((event) => {
            return {
                ...event,
                eventpic: event.eventpic 
                    ? `data:image/png;base64,${Buffer.from(event.eventpic).toString("base64")}`
                    : null,
            };
        });

        res.json(formattedResults);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint: Tambah event
app.post('/api/events', async (req, res) => {
    const { ktpa, evtitle, evdesc, evdate, evloc, evkuota, eventpic } = req.body;

    try {
        const pool = await getPool();
        const request = pool.request()
            .input('ktpa', sql.VarChar, ktpa)
            .input('evtitle', sql.VarChar, evtitle)
            .input('evdesc', sql.Text, evdesc)
            .input('evdate', sql.DateTime, evdate)
            .input('evloc', sql.VarChar, evloc)
            .input('evkuota', sql.Int, evkuota)
            .input('createdAt', sql.DateTime, new Date());

        // Handle binary image data if present
        if (eventpic) {
            const imageBuffer = Buffer.from(eventpic.split(',')[1], 'base64');
            request.input('eventpic', sql.VarBinary(sql.MAX), imageBuffer);
        } else {
            request.input('eventpic', sql.VarBinary(sql.MAX), null);
        }

        const result = await request.query(`
            INSERT INTO event (ktpa, evtitle, evdesc, evdate, evloc, evkuota, eventpic, created_at)
            OUTPUT INSERTED.id, INSERTED.ktpa, INSERTED.evtitle, INSERTED.evdesc, 
                  INSERTED.evdate, INSERTED.evloc, INSERTED.evkuota
            VALUES (@ktpa, @evtitle, @evdesc, @evdate, @evloc, @evkuota, @eventpic, @createdAt)
        `);

        // Kirim notifikasi setelah event berhasil disimpan
        await sendNotification(evtitle, evdesc, {
            evtitle,
            evdesc,
            evdate,
            evloc,
            evkuota,
            eventpic
        });

        res.status(201).json(result.recordset[0]);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint: Update event
app.put('/api/event/:id', async (req, res) => {
    const { id } = req.params;
    const { ktpa, evtitle, evdesc, evdate, evloc, evkuota, eventpic } = req.body;

    try {
        const pool = await getPool();
        const request = pool.request()
            .input('id', sql.Int, id)
            .input('ktpa', sql.VarChar, ktpa)
            .input('evtitle', sql.VarChar, evtitle)
            .input('evdesc', sql.Text, evdesc)
            .input('evdate', sql.DateTime, evdate)
            .input('evloc', sql.VarChar, evloc)
            .input('evkuota', sql.Int, evkuota)
            .input('updatedAt', sql.DateTime, new Date());

        // Handle image update if provided
        if (eventpic) {
            const imageBuffer = Buffer.from(eventpic.split(',')[1], 'base64');
            request.input('eventpic', sql.VarBinary(sql.MAX), imageBuffer);
        }

        const query = eventpic ? `
            UPDATE event 
            SET ktpa = @ktpa, evtitle = @evtitle, evdesc = @evdesc, 
                evdate = @evdate, evloc = @evloc, evkuota = @evkuota, 
                eventpic = @eventpic, updated_at = @updatedAt
            OUTPUT INSERTED.id, INSERTED.ktpa, INSERTED.evtitle, INSERTED.evdesc, 
                  INSERTED.evdate, INSERTED.evloc, INSERTED.evkuota
            WHERE id = @id
        ` : `
            UPDATE event 
            SET ktpa = @ktpa, evtitle = @evtitle, evdesc = @evdesc, 
                evdate = @evdate, evloc = @evloc, evkuota = @evkuota, 
                updated_at = @updatedAt
            OUTPUT INSERTED.id, INSERTED.ktpa, INSERTED.evtitle, INSERTED.evdesc, 
                  INSERTED.evdate, INSERTED.evloc, INSERTED.evkuota
            WHERE id = @id
        `;

        const result = await request.query(query);
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Endpoint: Hapus event
app.delete('/api/event/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM event WHERE id = @id');
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json({ message: 'Event deleted successfully', id });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: err.message });
    }
});
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${port}`);
  });
  
