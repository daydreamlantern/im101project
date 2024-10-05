import React, { useContext, useState, useEffect } from 'react';
import { BookingContext } from './BookingContext';
import CustomCalendar from './CustomCalendar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './CreateBook.css'; // Reuse the same CSS from CreateBook

const TimeDatePayment = () => {
    const { formData, setFormData } = useContext(BookingContext);
    const [availableTimes, setAvailableTimes] = useState([
        '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
        '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
        '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'
    ]);
    const [bookedTimes, setBookedTimes] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    // Fetch booked times for the selected date
    useEffect(() => {
        const fetchBookedTimes = async () => {
            if (formData.date) {
                try {
                    const response = await axios.post('http://localhost:3030/booked-times', { date: formData.date });
                    console.log('Booked times:', response.data);
                    setBookedTimes(response.data); // Store booked times in state
                } catch (error) {
                    console.error('Error fetching booked times:', error);
                }
            }
        };
        
        fetchBookedTimes(); // Call the function to fetch booked times
    }, [formData.date]);

    const handleTimeSelect = (time) => {
        if (!bookedTimes.includes(time)) {
            setFormData({ ...formData, time });
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        // Submit the booking data to the backend
        axios.post('http://localhost:3030/submit-booking', formData)
            .then((response) => {
                setLoading(false);
                navigate('/booking-done'); // Navigate to booking confirmation page
            })
            .catch((err) => {
                setLoading(false);
                console.error('Error submitting booking:', err);
            });
    };

    return (
        <div className="container">
            <h2>Select Time, Date, and Payment Method</h2>
            
            {/* Date selection */}
            <div className="formGroup">
                <label>Date</label>
                <CustomCalendar selectedDate={formData.date} onDateChange={(date) => setFormData({ ...formData, date })} />
            </div>

            {/* Time selection */}
            <div className="formGroup">
                <label>Time</label>
                <div className="time-grid">
                    {availableTimes.map((time) => (
                        <div
                            key={time}
                            className={`time-slot ${formData.time === time ? 'selected' : ''} ${bookedTimes.includes(time) ? 'disabled' : ''}`}
                            onClick={() => !bookedTimes.includes(time) && handleTimeSelect(time)}
                        >
                            {time}
                            {bookedTimes.includes(time) && <span className="booked-indicator"> (Booked)</span>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment Method */}
            <div className="formGroup">
                <label>Payment Method</label>
                <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    required
                >
                    <option value="" disabled>Select Payment Method</option>
                    <option value="pay_in_store">Pay in Store</option>
                </select>
            </div>

            {/* Submit button */}
            {loading ? (
                <div className="loading-container">
                    <div className="spinner-border text-primary" role="status">
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            ) : (
                <button onClick={handleSubmit} className="button" disabled={!formData.time}>
                    Submit Booking
                </button>
            )}
        </div>
    );
};

export default TimeDatePayment;
