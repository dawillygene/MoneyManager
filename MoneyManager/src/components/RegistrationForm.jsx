import React, { useState } from 'react';

function RegistrationForm() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle registration logic here
        console.log('Registering user:', formData);
    };

    return (
        <div className="flex items-center justify-center bg-[var(--light-blue)] py-16 px-2 min-h-screen">
            <div
                className="w-full max-w-xl bg-white rounded-2xl shadow-2xl px-8 py-10"
                style={{
                    borderTop: '6px solid var(--orange)',
                    boxShadow: '0 8px 32px 0 rgba(10,35,66,0.10)'
                }}
            >
                <div className="flex flex-col items-center mb-6">
                    <div className="navy-bg rounded-full p-3 mb-2 shadow" style={{ backgroundColor: 'var(--navy)' }}>
                        <i className="fas fa-user-plus text-2xl" style={{ color: 'var(--orange)' }}></i>
                    </div>
                    <h2 className="text-2xl font-bold navy-text mb-1" style={{ color: 'var(--navy)' }}>Create Account</h2>
                    <p className="text-gray-500 text-sm">Sign up to get started with Money Manager</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium navy-text mb-1" htmlFor="username" style={{ color: 'var(--navy)' }}>Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="border rounded-lg px-3 py-2 w-full focus:outline-none"
                            style={{
                                borderColor: 'var(--light-blue)',
                                backgroundColor: 'var(--light-grey)',
                                color: 'var(--navy)'
                            }}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium navy-text mb-1" htmlFor="email" style={{ color: 'var(--navy)' }}>Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="border rounded-lg px-3 py-2 w-full focus:outline-none"
                            style={{
                                borderColor: 'var(--light-blue)',
                                backgroundColor: 'var(--light-grey)',
                                color: 'var(--navy)'
                            }}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium navy-text mb-1" htmlFor="password" style={{ color: 'var(--navy)' }}>Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="border rounded-lg px-3 py-2 w-full focus:outline-none"
                            style={{
                                borderColor: 'var(--light-blue)',
                                backgroundColor: 'var(--light-grey)',
                                color: 'var(--navy)'
                            }}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium navy-text mb-1" htmlFor="confirmPassword" style={{ color: 'var(--navy)' }}>Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="border rounded-lg px-3 py-2 w-full focus:outline-none"
                            style={{
                                borderColor: 'var(--light-blue)',
                                backgroundColor: 'var(--light-grey)',
                                color: 'var(--navy)'
                            }}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 rounded-lg orange-bg text-white font-semibold shadow hover:opacity-90 transition"
                        style={{
                            backgroundColor: 'var(--orange)'
                        }}
                    >
                        Register
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <span className="text-gray-500 text-sm">Already have an account?</span>
                    <a href="/login" className="font-semibold ml-1" style={{ color: 'var(--orange)' }}>Login</a>
                </div>
            </div>
        </div>
    );
}

export default RegistrationForm;