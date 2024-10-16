import React, { useContext, useState } from 'react';
import { BookingContext } from './BookingContext';
import { useNavigate, Link } from 'react-router-dom';
import logo from './assets/emlogo.png'; // Adjust the path to your logo
import './CustomerDetails.css';

const CustomerDetails = () => {
    const { formData, setFormData } = useContext(BookingContext);
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false); // State to control menu visibility

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        console.log(`Input changed: ${name} = ${value}`); // Debugging line
        console.log('Updated formData:', { ...formData, [name]: value }); // Log updated formData
    };

    const handleNext = () => {
        navigate('/time-date-payment');
    };

    const handleBack = () => {
        navigate('/services-barber');
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
            <div className="customerDetails-container">
                <h2>Enter Your Details</h2>
                <div className="customerDetails-formGroup">
                    <label htmlFor="name" className='customerDetails-label'>Name</label>
                    <input 
                        type="text"
                        placeholder="name"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="customerDetails-formGroup">
                    <label htmlFor="email" className='customerDetails-label'>Email</label>
                    <input 
                        type="email"
                        placeholder='email'
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="customerDetails-buttonGroup">
                    <button onClick={handleBack}>Back</button>
                    <button onClick={handleNext}>Next</button>
                </div>
            </div>
        </>
    );
};

export default CustomerDetails;
