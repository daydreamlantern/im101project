import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { format, parse } from 'date-fns';

dotenv.config(); // Load environment variables

const app = express();
app.use(express.json());
app.use(cors());

// MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "crud"
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true, // true for 465, false for other ports like 587
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS,
    },
});

// Function to convert 12-hour time format to 24-hour format
const convertTimeTo24Hour = (time12h) => {
    return format(parse(time12h, 'h:mm a', new Date()), 'HH:mm:ss');
};

// GET route to retrieve all bookings
app.get('/', (req, res) => {
    const sql = "SELECT * FROM book";
    db.query(sql, (err, data) => {
        if (err) {
            console.error("Error retrieving data:", err);
            return res.json({ Error: "Error retrieving data" });
        }
        return res.json(data);
    });
});

// POST route to create a new booking (with email notification)
app.post('/create', (req, res) => {
    const { name, service, date, time, paymentMethod, email } = req.body;

    console.log("Received booking request:", req.body);

    // Check if the time slot is already booked for the selected date
    const checkSql = "SELECT * FROM book WHERE date = ? AND time = ?";
    const timeIn24h = convertTimeTo24Hour(time); // Convert the time to 24-hour format

    db.query(checkSql, [date, timeIn24h], (err, results) => {
        if (err) {
            console.error("Error checking availability:", err);
            return res.json({ Error: "Error checking availability" });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'Time slot is already booked.' });
        }

        // If not booked, insert the new booking
        const sql = "INSERT INTO book (name, service, date, time, paymentMethod, email) VALUES (?, ?, ?, ?, ?, ?)";
        const values = [name, service, date, timeIn24h, paymentMethod, email];
        db.query(sql, values, (err, data) => {
            if (err) {
                console.error("Error inserting data:", err);
                return res.json({ Error: "Error inserting data" });
            }

            // Send confirmation email
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Booking Confirmation',
                text: `Dear ${name},\n\nYour booking for ${service} on ${date} at ${time} has been confirmed.\n\nThank you for choosing us!\n\nBest regards,\nYour Barbershop`,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    return res.json({ Error: "Error sending confirmation email" });
                }
                console.log('Email sent:', info.response);
                return res.json({ message: "Booking created successfully, confirmation email sent", booking: data });
            });
        });
    });
});

// DELETE route to delete a book by ID
app.delete('/delete/:id', (req, res) => {
    const id = req.params.id;
    const deleteQuery = "DELETE FROM book WHERE id = ?";

    db.query(deleteQuery, [id], (err, data) => {
        if (err) {
            console.error("Error deleting data:", err);
            return res.json({ Error: "Error deleting data" });
        }
        return res.json({ message: "Booking deleted successfully" });
    });
});

// POST route to get booked times for a specific date
app.post('/booked-times', (req, res) => {
    const { date } = req.body;

    const sql = "SELECT time FROM book WHERE date = ?";
    db.query(sql, [date], (err, data) => {
        if (err) {
            console.error("Error retrieving booked times:", err);
            return res.json({ Error: "Error retrieving booked times" });
        }

        // Return an array of booked times for the selected date
        const bookedTimes = data.map((booking) => booking.time);
        return res.json(bookedTimes);
    });
});

// Start the Express server
app.listen(3030, () => {
    console.log("Server running on port 3030");
});

// POST route for admin login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Query to find the admin user
    const sql = "SELECT * FROM admin WHERE username = ?";
    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error("Database error:", err); // Log the error
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const admin = results[0];
        if (password !== admin.password) { // Use hashing in production
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        return res.json({ message: 'Login successful' });
    });
});
