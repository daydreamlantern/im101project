// ServicesBarber.js
import React, { useContext } from 'react';
import { BookingContext } from './BookingContext';
import { useNavigate } from 'react-router-dom';

const ServicesBarber = () => {
    const { formData, setFormData } = useContext(BookingContext);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = () => {
        navigate('/customer-details');
    };

    return (
        <div className="container">
            <h2>Choose Service and Barber</h2>
            <div className="formGroup">
                <label>Service</label>
                <select name="service" value={formData.service} onChange={handleInputChange}>
                    <option value="">Select a service</option>
                    <option value="haircut">Haircut</option>
                    <option value="shampoo">Shampoo</option>
                    <option value="massage">Massage</option>
                </select>
            </div>
            <div className="formGroup">
                <label>Barber</label>
                <select name="barber" value={formData.barber} onChange={handleInputChange}>
                    <option value="">Choose a barber</option>
                    <option value="barber1">Barber 1</option>
                    <option value="barber2">Barber 2</option>
                </select>
            </div>
            <button onClick={handleNext}>Next</button>
        </div>
    );
};

export default ServicesBarber;
