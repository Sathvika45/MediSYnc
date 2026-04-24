const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 1. Serve static files (CSS/JS/Images) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// 2. Database Connection
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '2420030660', // <-- CHANGE THIS TO YOUR ACTUAL PASSWORD
    database: 'medicare_hub',
    waitForConnections: true,
    connectionLimit: 10
}).promise();

// 3. API: User Login (Matches your role-based buttons)
app.post('/api/login', async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const [rows] = await db.query(
            "SELECT id, name, email, role, specialty FROM users WHERE email=? AND password=? AND role=?", 
            [email, password, role]
        );
        
        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(401).json({ error: "Invalid credentials or role selection." });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database connection failed." });
    }
});

// 4. API: Fetch Appointments (For the Doctor/Staff Dashboard)
app.get('/api/doctor/appointments/:id', async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, patient_name, DATE_FORMAT(app_date, '%Y-%m-%d') as app_date, app_time, status FROM appointments WHERE doctor_id = ?", 
            [req.params.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Could not fetch data." });
    }
});

// This serves your homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'MediCarehub.html'));
});

// This handles everything else WITHOUT using the '*' that causes the PathError
app.get('/:any', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'MediCarehub.html'));
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});