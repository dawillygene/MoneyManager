import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import api from './api'; 

function LoginForm() {
    const formRef = useRef(null);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState(''); // 'success' or 'error'

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/login', {
                email: formData.email,
                password: formData.password
            });

            const { name, email } = response.data;

            // Save user info to localStorage for Sidebar
            localStorage.setItem('user', JSON.stringify({ name, email }));

            setMessage('Login successful! Redirecting...');
            setMessageType('success');
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1200);
        } catch (error) {
            setMessage(error.response?.data || 'Login failed');
            setMessageType('error');
        }
    };

    useEffect(() => {
        if (formRef.current) {
            formRef.current.focus();
        }
    }, []);

    return (
        <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            ref={formRef}
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl px-12 py-10"
            style={{
                borderTop: '4px solid var(--orange)',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}
            tabIndex="-1"
            role="main"
            aria-labelledby="login-title"
        >
            <div className="flex flex-col items-center mb-8">
                <div className="navy-bg rounded-full p-4 mb-3 shadow" style={{ backgroundColor: 'var(--navy)' }}>
                    <i className="fas fa-sign-in-alt text-3xl" style={{ color: 'var(--orange)' }}></i>
                </div>
                <h2 id="login-title" className="text-3xl font-bold navy-text mb-2" style={{ color: 'var(--navy)' }}>
                    Welcome Back
                </h2>
                <p className="text-gray-500 text-base text-center">
                    Login to your Money Manager account
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
                        placeholder="Enter your password"
                        required
                    />
                </div>
                
                <div className="text-right">
                    <a href="/forgot-password" className="text-base hover:underline" style={{ color: 'var(--orange)' }}>
                        Forgot password?
                    </a>
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
                    className="w-full py-3 rounded-lg orange-bg text-white font-semibold shadow hover:opacity-90 transition text-xl"
                    style={{ backgroundColor: 'var(--orange)' }}
                >
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Login
                </button>
            </form>

            <div className="mt-8 text-center">
                <span className="text-gray-500 text-base">Don't have an account?</span>
                <a href="/register" className="font-semibold ml-2 hover:underline text-base" style={{ color: 'var(--orange)' }}>
                    Register
                </a>
            </div>
        </motion.div>
    );
}

export default LoginForm;