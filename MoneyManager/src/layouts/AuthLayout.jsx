import React from 'react';
import { Outlet } from 'react-router-dom';

function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100">
      <Outlet />
    </div>
  );
}

export default AuthLayout;