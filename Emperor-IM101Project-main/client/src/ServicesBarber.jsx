import React, { useContext, useState } from 'react';
import { BookingContext } from './BookingContext';
import { useNavigate, Link } from 'react-router-dom';
import logo from './assets/emlogo.png'; // Make sure to adjust the path to your logo
import './ServicesBarber.css'; // Import the CSS file

const ServicesBarber = () => {
    const { formData, setFormData } = useContext(BookingContext);
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Menu state

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value, // This will correctly set the selected service and barber
        }));
    };
    

    const handleNext = () => {
        navigate('/customer-details');
    };

    const handleBack = () => {
        navigate('/'); // Navigate to the homepage
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>
            {/* Logo */}
            <Link to="/" style={{ position: 'absolute', top: '45px', left: '73px' }}>
                <img src={logo} alt="Logo" style={{ width: '55px', height: 'auto' }} />
            </Link>

            {/* Hamburger Icon */}
            <div className="hamburger" onClick={toggleMenu}>
                <div className={isMenuOpen ? "bar bar1 open" : "bar bar1"}></div>
                <div className={isMenuOpen ? "bar bar2 open" : "bar bar2"}></div>
                <div className={isMenuOpen ? "bar bar3 open" : "bar bar3"}></div>
            </div>

            {/* Menu */}
            {isMenuOpen && (
                <div className="menu">
                    <Link to="/">Home</Link>
                    <Link to="/about">About Us</Link>
                    <Link to="/services">Services</Link>
                </div>
            )}

            {/* Main Content */}
            <div className="container">
                <h2>Choose Service and Barber</h2>
                <div className="formGroup">
                    <label>Service</label>
                    <select name="service" value={formData.service} onChange={handleInputChange} className="dropdown">
                        <option value="select">Select a service</option>
                        <option value="haircut">Haircut</option>
                        <option value="shampoo">Shampoo</option>
                        <option value="massage">Massage</option>
                    </select>
                </div>
                <div className="formGroup">
                    <label>Barber</label>
                    <select name="barber" value={formData.barber} onChange={handleInputChange} className="dropdown">
                        <option value="select">Choose a barber</option>
                        <option value="barber1">Barber 1</option>
                        <option value="barber2">Barber 2</option>
                    </select>
                </div>
                <div className="buttonGroup">
                    <button onClick={handleBack}>Back</button>
                    <button onClick={handleNext}>Next</button>
                </div>
            </div>
        </>
    );
};

export default ServicesBarber;
