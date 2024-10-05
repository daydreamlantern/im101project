import React, { useContext } from 'react';
import { BookingContext } from './BookingContext';
import { useNavigate } from 'react-router-dom';

const CustomerDetails = () => {
    const { formData, setFormData } = useContext(BookingContext);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = () => {
        navigate('/time-date-payment');
    };

    return (
        <div className="container">
            <h2>Enter Your Details</h2>
            <div className="formGroup">
                <label>Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <div className="formGroup">
                <label>Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                />
            </div>
            <button onClick={handleNext}>Next</button>
        </div>
    );
};

export default CustomerDetails;