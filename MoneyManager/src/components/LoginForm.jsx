import React, { useState } from 'react';

function LoginForm() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle login logic here
        console.log('Logging in user:', formData);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[var(--light-blue)]">
            <div
                className="w-full max-w-2xl bg-white rounded-2xl shadow-none px-12 py-12"
                style={{
                    borderTop: '6px solid var(--orange)',
                    boxShadow: '0 8px 32px 0 rgba(10,35,66,0.10)' // You can remove this line if you want absolutely no shadow
                }}
            >
                <div className="flex flex-col items-center mb-6">
                    <div className="navy-bg rounded-full p-3 mb-2 shadow" style={{ backgroundColor: 'var(--navy)' }}>
                        <i className="fas fa-sign-in-alt text-2xl" style={{ color: 'var(--orange)' }}></i>
                    </div>
                    <h2 className="text-2xl font-bold navy-text mb-1" style={{ color: 'var(--navy)' }}>Welcome Back</h2>
                    <p className="text-gray-500 text-sm">Login to your Money Manager account</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <button
                        type="submit"
                        className="w-full py-2 rounded-lg orange-bg text-white font-semibold shadow hover:opacity-90 transition"
                        style={{
                            backgroundColor: 'var(--orange)'
                        }}
                    >
                        Login
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <span className="text-gray-500 text-sm">Don't have an account?</span>
                    <a href="/register" className="font-semibold ml-1" style={{ color: 'var(--orange)' }}>Register</a>
                </div>
            </div>
        </div>
    );
}

export default LoginForm;