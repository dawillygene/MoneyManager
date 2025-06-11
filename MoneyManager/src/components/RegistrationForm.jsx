import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api';

// Cookie utility functions
const setCookie = (name, value, maxAge = null) => {
    let cookieString = `${name}=${value}; path=/; SameSite=Lax`;
    if (maxAge) {
        cookieString += `; max-age=${maxAge}`;
    }
    document.cookie = cookieString;
};

function RegistrationForm() {
    const navigate = useNavigate();
    const formRef = useRef(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Client-side validation
        if (formData.password !== formData.confirmPassword) {
            setMessage('Passwords do not match.');
            setMessageType('error');
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setMessage('Password must be at least 6 characters long.');
            setMessageType('error');
            setIsLoading(false);
            return;
        }

        try {
            const result = await authService.register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword
            });

            if (result.success) {
                // Save user info to cookies instead of localStorage
                setCookie('user', JSON.stringify({
                    name: result.user.name,
                    email: result.user.email
                }), 604800); // 7 days

                setMessage('Registration successful! Redirecting to dashboard...');
                setMessageType('success');
                
                // Use React Router navigation instead of window.location
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1500);
            } else {
                setMessage(result.message);
                setMessageType('error');
            }
        } catch (error) {
            setMessage('An unexpected error occurred. Please try again.');
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (formRef.current) {
            formRef.current.focus();
        }
    }, []);

    return (
        <motion.div
            ref={formRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8"
            tabIndex="-1"
            role="main"
            aria-labelledby="register-title"
        >
            <div className="flex flex-col items-center mb-8">
                <div className="navy-bg rounded-full p-4 mb-3 shadow" style={{ backgroundColor: 'var(--navy)' }}>
                    <i className="fas fa-user-plus text-3xl" style={{ color: 'var(--orange)' }}></i>
                </div>
                <h2 id="register-title" className="text-3xl font-bold navy-text mb-2" style={{ color: 'var(--navy)' }}>
                    Create Account
                </h2>
                <p className="text-gray-500 text-base text-center">
                    Join Money Manager to take control of your finances
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-base font-medium navy-text mb-2" htmlFor="name" style={{ color: 'var(--navy)' }}>
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="border rounded-lg px-4 py-3 w-full text-base focus:outline-none focus:ring-2 focus:ring-[var(--orange)]"
                            style={{
                                borderColor: 'var(--light-blue)',
                                backgroundColor: 'var(--light-grey)',
                                color: 'var(--navy)'
                            }}
                            placeholder="Enter your full name"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-base font-medium navy-text mb-2" htmlFor="email" style={{ color: 'var(--navy)' }}>
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="border rounded-lg px-4 py-3 w-full text-base focus:outline-none focus:ring-2 focus:ring-[var(--orange)]"
                            style={{
                                borderColor: 'var(--light-blue)',
                                backgroundColor: 'var(--light-grey)',
                                color: 'var(--navy)'
                            }}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-base font-medium navy-text mb-2" htmlFor="password" style={{ color: 'var(--navy)' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="border rounded-lg px-4 py-3 w-full text-base focus:outline-none focus:ring-2 focus:ring-[var(--orange)]"
                            style={{
                                borderColor: 'var(--light-blue)',
                                backgroundColor: 'var(--light-grey)',
                                color: 'var(--navy)'
                            }}
                            placeholder="Enter password"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-base font-medium navy-text mb-2" htmlFor="confirmPassword" style={{ color: 'var(--navy)' }}>
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="border rounded-lg px-4 py-3 w-full text-base focus:outline-none focus:ring-2 focus:ring-[var(--orange)]"
                            style={{
                                borderColor: 'var(--light-blue)',
                                backgroundColor: 'var(--light-grey)',
                                color: 'var(--navy)'
                            }}
                            placeholder="Confirm password"
                            required
                        />
                    </div>
                </div>

                {message && (
                    <div
                        className={`rounded-lg px-4 py-3 text-base mb-2 text-center ${
                            messageType === 'success'
                                ? 'bg-green-100 text-green-700 border border-green-300'
                                : 'bg-red-100 text-red-700 border border-red-300'
                        }`}
                    >
                        {message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 text-base ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                    }`}
                    style={{ backgroundColor: 'var(--orange)' }}
                >
                    <i className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-user-plus'} mr-2`}></i>
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
            </form>

            <div className="mt-8 text-center">
                <span className="text-gray-500 text-base">Already have an account?</span>
                <a href="/login" className="font-semibold ml-2 hover:underline text-base" style={{ color: 'var(--orange)' }}>
                    Login
                </a>
            </div>
        </motion.div>
    );
}

export default RegistrationForm;