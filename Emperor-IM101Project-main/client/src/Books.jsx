import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import 'bootstrap/dist/css/bootstrap.min.css';
import './Books.css'; // Add custom styles here

const Books = () => {
    const [customers, setCustomers] = useState([]);
    const navigate = useNavigate(); // Initialize useNavigate

    // Fetch customer data from backend
    useEffect(() => {
        axios.get('http://localhost:3030/') // Adjust the endpoint to fetch customers
            .then((res) => setCustomers(res.data)) // Ensure this matches your actual API response
            .catch(console.log);
    }, []);

    const handleDelete = (id) => {
        axios.delete(`http://localhost:3030/customers/delete/${id}`)
            .then(() => setCustomers(customers.filter((customer) => customer.id !== id)))
            .catch(console.log);
    };

    const handleLogout = () => {
        // Add any logout logic here (like clearing tokens)
        navigate('/'); // Redirect to homepage
    };

    return (
        <div className="container-fluid">
            <div className="row">
                {/* Sidebar */}
                <nav className="col-md-2 bg-dark sidebar">
                    <div className="text-white text-center py-3">
                        <h4>Emperor's Lounge</h4>
                    </div>
                    <hr className="text-white" />
                    <div className="text-center">
                        <button className="nav-link text-white btn btn-link" onClick={() => navigate('/admin')}>
                            <i className="fas fa-home"></i> Dashboard
                        </button>
                        <button className="nav-link text-white btn btn-link" onClick={() => navigate('/custbook')}>
                            <i className="fas fa-box"></i> Customer's Booking
                        </button>
                        <button className="nav-link text-white btn btn-link" onClick={() => navigate('/payments')}>
                            <i className="fas fa-credit-card"></i> Payment
                        </button>
                        <button className="nav-link text-white btn btn-link" onClick={handleLogout}>
                            <i className="fas fa-sign-out-alt"></i> Log out
                        </button>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="col-md-10 mt-5">
                    {/* Records Table */}
                    <div className="card">
                        <div className="card-body">
                            <table className="table table-striped">
                                <thead className="thead-dark">
                                    <tr>
                                        <th>Customer ID</th>
                                        <th>Name</th>
                                        <th>Contact No</th>
                                        <th>Email Address</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.length > 0 ? (
                                        customers.map((customer) => (
                                            <tr key={customer.customerID}>
                                            <td>{customer.customerID}</td>
                                            <td>{customer.name}</td>
                                            <td>{customer.contactNo}</td>
                                            <td>{customer.email}</td>
                                                <td>
                                                    <button className="btn btn-danger" onClick={() => handleDelete(customer.id)}>Delete</button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="5">No Records</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Books;
