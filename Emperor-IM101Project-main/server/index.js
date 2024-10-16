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

// Connect to MySQL
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

// GET route to retrieve all customers
app.get('/', (req, res) => {
    const sql = "SELECT * FROM Customer"; // Corrected table name
    db.query(sql, (err, data) => {
        if (err) {
            console.error("Error retrieving data:", err);
            return res.json({ Error: "Error retrieving data" });
        }
        return res.json(data);
    });
});

// POST route to create a new booking (with email notification)
app.post('/submit-booking', (req, res) => {
    const { name, service, date, time, paymentMethod, email, contactNo } = req.body;

    // Log the entire request body for debugging
    console.log("Received booking request:", req.body);

    // Ensure contactNo is being retrieved here
    if (!contactNo) {
        console.error("Contact number is missing in the request body");
        return res.status(400).json({ Error: "Contact number is required" });
    }

    // Convert the date to YYYY-MM-DD format
    const formattedDate = format(new Date(date), 'yyyy-MM-dd');

    // Check if the time slot is already booked for the selected date
    const checkSql = "SELECT * FROM Booking WHERE date = ? AND time = ?";
    const timeIn24h = convertTimeTo24Hour(time); // Convert the time to 24-hour format

    db.query(checkSql, [formattedDate, timeIn24h], (err, results) => {
        if (err) {
            console.error("Error checking availability:", err);
            return res.json({ Error: "Error checking availability" });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'Time slot is already booked.' });
        }

        // Fetch the serviceID based on the service name from the crud.services table
        const getServiceIdSql = "SELECT serviceID FROM crud.Services WHERE serviceType = ?";
        db.query(getServiceIdSql, [service], (err, serviceResults) => {
            if (err) {
                console.error("Error fetching service ID:", err);
                return res.json({ Error: "Error fetching service ID" });
            }
        
            if (serviceResults.length === 0) {
                return res.status(400).json({ Error: "Service not found" });
            }

            const serviceID = serviceResults[0].serviceID;

            // If not booked, insert the new customer first
            const insertCustomerSql = "INSERT INTO Customer (name, contactNo, email) VALUES (?, ?, ?)"; // Changed emailaddress to email
            const customerValues = [name, contactNo, email];

            db.query(insertCustomerSql, customerValues, (err, customerData) => {
                if (err) {
                    console.error("Error inserting customer data:", err);
                    return res.json({ Error: "Error inserting customer data" });
                }

                const customerID = customerData.insertId; // Get the newly inserted customer ID

                // Insert the booking using the customerID
                const insertBookingSql = "INSERT INTO Booking (customerID, serviceID, name, contactNo, date, time, paymentMethod, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                const bookingValues = [customerID, serviceID, name, contactNo, formattedDate, timeIn24h, paymentMethod, email];

                db.query(insertBookingSql, bookingValues, (err, bookingData) => {
                    if (err) {
                        console.error("Error inserting booking data:", err);
                        return res.json({ Error: "Error inserting booking data" });
                    }

                    // Send confirmation email
                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: email,
                        subject: 'Booking Confirmation',
                        text: `Dear ${name},\n\nYour booking for ${service} on ${formattedDate} at ${time} has been confirmed.\n\nThank you for choosing us!\n\nBest regards,\nYour Barbershop`,
                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.error('Error sending email:', error);
                            return res.json({ Error: "Error sending confirmation email" });
                        }
                        console.log('Email sent:', info.response);
                        return res.json({ message: "Booking created successfully, confirmation email sent", booking: bookingData });
                    });
                });
            });
        });
    });
});

// POST route to get booked times for a specific date
app.post('/booked-times', (req, res) => {
    const { date } = req.body; // Extract date from request body
    console.log("Received request for booked times:", date);

    // Update the SQL query to fetch booked times from the Booking table
    const sql = "SELECT time FROM Booking WHERE date = ?"; // Use Booking table
    db.query(sql, [date], (err, results) => {
        if (err) {
            console.error("Error fetching booked times:", err);
            return res.status(500).json({ Error: "Error fetching booked times" });
        }
        
        // Extract the booked times from the results
        const bookedTimes = results.map(row => row.time);
        return res.json(bookedTimes); // Send back the booked times
    });
});

// POST route for login
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

// Start the server
const PORT = process.env.PORT || 3030;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
