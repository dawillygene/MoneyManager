import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

function RegistrationForm() {
    const formRef = useRef(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        agreeToTerms: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/api/auth/register', {
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                agreeToTerms: formData.agreeToTerms
            });

            console.log('Registration successful:', response.data);
            alert('Registration successful');
        } catch (error) {
            console.error('Registration failed:', error);
            alert('Registration failed');
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
                    Join Money Manager and start managing your finances
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-base font-medium navy-text mb-2" htmlFor="fullName" style={{ color: 'var(--navy)' }}>
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="border rounded-lg px-4 py-3 w-full text-base focus:outline-none focus:ring-2 focus:ring-[var(--orange)]"
                            style={{
                                borderColor: 'var(--light-blue)',
                                backgroundColor: 'var(--light-grey)',
                                color: 'var(--navy)'
                            }}
                            placeholder="John Doe"
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
                            placeholder="john@example.com"
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

                <div className="flex items-start">
                    <input
                        type="checkbox"
                        id="agreeToTerms"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleChange}
                        className="mt-1 mr-3"
                        required
                    />
                    <label htmlFor="agreeToTerms" className="text-base text-gray-600">
                        I agree to the{' '}
                        <a href="/terms" className="hover:underline" style={{ color: 'var(--orange)' }}>
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="/privacy" className="hover:underline" style={{ color: 'var(--orange)' }}>
                            Privacy Policy
                        </a>
                    </label>
                </div>

                <button
                    type="submit"
                    className="w-full py-3 rounded-lg orange-bg text-white font-semibold shadow hover:opacity-90 transition text-xl"
                    style={{ backgroundColor: 'var(--orange)' }}
                >
                    <i className="fas fa-user-plus mr-2"></i>
                    Create Account
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