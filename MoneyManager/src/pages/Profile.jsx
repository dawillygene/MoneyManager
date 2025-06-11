import React, { useState, useEffect } from 'react';
import { userService } from '../api';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [privacySettings, setPrivacySettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [preferencesForm, setPreferencesForm] = useState({
    currency: 'USD',
    timezone: 'America/New_York',
    theme: 'light',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    notifications: {
      email: true,
      push: false,
      budgetAlerts: true,
      goalReminders: true
    }
  });

  const tabs = [
    { id: 'profile', label: 'Profile Information', icon: 'fas fa-user' },
    { id: 'security', label: 'Security & Password', icon: 'fas fa-shield-alt' },
    { id: 'preferences', label: 'Preferences', icon: 'fas fa-cog' },
    { id: 'sessions', label: 'Active Sessions', icon: 'fas fa-laptop' },
    { id: 'privacy', label: 'Privacy Settings', icon: 'fas fa-user-shield' },
    { id: 'activity', label: 'Activity Log', icon: 'fas fa-history' },
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [profileData, preferencesData, sessionsData, privacyData] = await Promise.all([
        userService.getProfile(),
        userService.getPreferences(),
        userService.getSessions(),
        userService.getPrivacySettings()
      ]);

      setProfile(profileData);
      setPreferences(preferencesData);
      setSessions(sessionsData.sessions || []);
      setPrivacySettings(privacyData);

      // Populate forms
      setProfileForm({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        address: profileData.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        }
      });

      setPreferencesForm(preferencesData);

    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load profile data' });
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityData = async () => {
    try {
      const [activityData, loginData] = await Promise.all([
        userService.getActivityLog({ limit: 20 }),
        userService.getLoginHistory({ limit: 20 })
      ]);
      setActivities(activityData.activities || []);
      setLoginHistory(loginData.logins || []);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to load activity data' });
    }
  };

  useEffect(() => {
    if (activeTab === 'activity') {
      fetchActivityData();
    }
  }, [activeTab]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await userService.updateProfile(profileForm);
      setProfile(result.user);
      showMessage('success', 'Profile updated successfully');
    } catch (error) {
      showMessage('error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('error', 'Passwords do not match');
      return;
    }

    const validation = userService.validatePasswordStrength(passwordForm.newPassword);
    if (!validation.valid) {
      showMessage('error', 'Password does not meet security requirements');
      return;
    }

    setSaving(true);
    try {
      await userService.changePassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showMessage('success', 'Password changed successfully');
    } catch (error) {
      showMessage('error', 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handlePreferencesUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await userService.updatePreferences(preferencesForm);
      setPreferences(result.preferences);
      showMessage('success', 'Preferences updated successfully');
    } catch (error) {
      showMessage('error', 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      await userService.revokeSession(sessionId);
      setSessions(sessions.filter(session => session.id !== sessionId));
      showMessage('success', 'Session revoked successfully');
    } catch (error) {
      showMessage('error', 'Failed to revoke session');
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!window.confirm('Are you sure you want to revoke all other sessions?')) return;
    
    try {
      await userService.revokeAllSessions();
      setSessions(sessions.filter(session => session.current));
      showMessage('success', 'All other sessions revoked successfully');
    } catch (error) {
      showMessage('error', 'Failed to revoke sessions');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setSaving(true);
      const result = await userService.uploadAvatar(file);
      setProfile({ ...profile, avatar: result.avatar.url });
      showMessage('success', 'Avatar updated successfully');
    } catch (error) {
      showMessage('error', 'Failed to upload avatar');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    try {
      const exportData = await userService.exportUserData({
        format: 'json',
        includeTransactions: true,
        includeBudgets: true,
        includeGoals: true,
        includeReports: true
      });

      const url = window.URL.createObjectURL(exportData);
      const a = document.createElement('a');
      a.href = url;
      a.download = `money-manager-export-${new Date().toISOString().split('T')[0]}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      showMessage('success', 'Data export downloaded successfully');
    } catch (error) {
      showMessage('error', 'Failed to export data');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" 
               style={{ borderColor: 'var(--orange)' }}></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                style={activeTab === tab.id ? { backgroundColor: 'var(--orange)' } : {}}
              >
                <i className={`${tab.icon} mr-3`}></i>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow p-6">
            {/* Profile Information Tab */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                
                {/* Avatar Section */}
                <div className="mb-8">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      {profile?.avatar ? (
                        <img 
                          src={profile.avatar} 
                          alt="Profile" 
                          className="w-20 h-20 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl"
                             style={{ backgroundColor: 'var(--light-blue)' }}>
                          <i className="fas fa-user"></i>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block">
                        <span className="sr-only">Choose profile photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:text-white"
                          style={{ 'file:backgroundColor': 'var(--orange)' }}
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  {/* Address Section */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={profileForm.address.street}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            address: { ...profileForm.address, street: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          value={profileForm.address.city}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            address: { ...profileForm.address, city: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State/Province
                        </label>
                        <input
                          type="text"
                          value={profileForm.address.state}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            address: { ...profileForm.address, state: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ZIP/Postal Code
                        </label>
                        <input
                          type="text"
                          value={profileForm.address.zipCode}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            address: { ...profileForm.address, zipCode: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country
                        </label>
                        <input
                          type="text"
                          value={profileForm.address.country}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            address: { ...profileForm.address, country: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 text-white rounded-md hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: 'var(--orange)' }}
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Security & Password</h2>
                
                <form onSubmit={handlePasswordChange} className="space-y-6 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                    {passwordForm.newPassword && (
                      <PasswordStrengthIndicator password={passwordForm.newPassword} />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 text-white rounded-md hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: 'var(--orange)' }}
                    >
                      {saving ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </form>

                {/* Two-Factor Authentication */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Authenticator App</p>
                      <p className="text-sm text-gray-600">
                        {profile?.twoFactorEnabled ? 'Two-factor authentication is enabled' : 'Add an extra layer of security to your account'}
                      </p>
                    </div>
                    <button
                      className={`px-4 py-2 rounded-md text-sm font-medium ${
                        profile?.twoFactorEnabled
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'text-white hover:opacity-90'
                      }`}
                      style={!profile?.twoFactorEnabled ? { backgroundColor: 'var(--orange)' } : {}}
                    >
                      {profile?.twoFactorEnabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Preferences</h2>
                
                <form onSubmit={handlePreferencesUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Currency
                      </label>
                      <select
                        value={preferencesForm.currency}
                        onChange={(e) => setPreferencesForm({ ...preferencesForm, currency: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                        <option value="CAD">CAD - Canadian Dollar</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={preferencesForm.timezone}
                        onChange={(e) => setPreferencesForm({ ...preferencesForm, timezone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                        <option value="Europe/London">London Time</option>
                        <option value="Europe/Paris">Paris Time</option>
                        <option value="Asia/Tokyo">Tokyo Time</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Theme
                      </label>
                      <select
                        value={preferencesForm.theme}
                        onChange={(e) => setPreferencesForm({ ...preferencesForm, theme: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto (System)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date Format
                      </label>
                      <select
                        value={preferencesForm.dateFormat}
                        onChange={(e) => setPreferencesForm({ ...preferencesForm, dateFormat: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>
                  </div>

                  {/* Notifications */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
                    <div className="space-y-4">
                      {Object.entries(preferencesForm.notifications || {}).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </label>
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => setPreferencesForm({
                              ...preferencesForm,
                              notifications: {
                                ...preferencesForm.notifications,
                                [key]: e.target.checked
                              }
                            })}
                            className="h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-orange-500"
                            style={{ accentColor: 'var(--orange)' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 text-white rounded-md hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: 'var(--orange)' }}
                    >
                      {saving ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Active Sessions</h2>
                  <button
                    onClick={handleRevokeAllSessions}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                  >
                    Revoke All Other Sessions
                  </button>
                </div>
                
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <i className="fas fa-laptop text-gray-400"></i>
                            <span className="font-medium">{session.deviceInfo}</span>
                            {session.current && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Current Session
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><i className="fas fa-map-marker-alt w-4"></i> {session.location}</p>
                            <p><i className="fas fa-globe w-4"></i> {session.ipAddress}</p>
                            <p><i className="fas fa-clock w-4"></i> Last active: {new Date(session.lastActivity).toLocaleString()}</p>
                          </div>
                        </div>
                        {!session.current && (
                          <button
                            onClick={() => handleRevokeSession(session.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Privacy Settings</h2>
                
                <div className="space-y-6">
                  {/* Data Processing */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Data Processing</h3>
                    <div className="space-y-4">
                      {privacySettings?.dataProcessing && Object.entries(privacySettings.dataProcessing).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium capitalize">{key} Data</p>
                            <p className="text-sm text-gray-600">
                              {key === 'analytics' && 'Help improve our service with usage analytics'}
                              {key === 'marketing' && 'Receive personalized marketing content'}
                              {key === 'thirdParty' && 'Share data with trusted third-party services'}
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={value}
                            className="h-4 w-4 rounded border-gray-300"
                            style={{ accentColor: 'var(--orange)' }}
                            readOnly
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Data Export */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Data Export</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-4">
                        Download a copy of all your data including transactions, budgets, goals, and settings.
                      </p>
                      <button
                        onClick={handleExportData}
                        className="px-4 py-2 text-white rounded-md hover:opacity-90"
                        style={{ backgroundColor: 'var(--orange)' }}
                      >
                        <i className="fas fa-download mr-2"></i>
                        Export My Data
                      </button>
                    </div>
                  </div>

                  {/* Account Deletion */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Account</h3>
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-red-700 mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                        <i className="fas fa-trash mr-2"></i>
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Activity Log</h2>
                
                <div className="space-y-6">
                  {/* Recent Activities */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h3>
                    <div className="space-y-3">
                      {activities.map((activity) => (
                        <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                               style={{ backgroundColor: 'var(--light-blue)' }}>
                            <i className="fas fa-clock"></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                            <div className="text-xs text-gray-500">
                              {new Date(activity.timestamp).toLocaleString()} • {activity.ipAddress}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Login History */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Login History</h3>
                    <div className="space-y-3">
                      {loginHistory.map((login) => (
                        <div key={login.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                            login.success ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            <i className={`fas ${login.success ? 'fa-check' : 'fa-times'}`}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {login.success ? 'Successful login' : 'Failed login attempt'}
                              {!login.success && login.failureReason && ` - ${login.failureReason}`}
                            </p>
                            <div className="text-xs text-gray-500">
                              {new Date(login.timestamp).toLocaleString()} • {login.device} • {login.ipAddress}
                              {login.location && ` • ${login.location}`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Password Strength Indicator Component
const PasswordStrengthIndicator = ({ password }) => {
  const validation = userService.validatePasswordStrength(password);
  
  const requirements = [
    { key: 'length', label: 'At least 8 characters', met: validation.length },
    { key: 'hasUpperCase', label: 'Uppercase letter', met: validation.hasUpperCase },
    { key: 'hasLowerCase', label: 'Lowercase letter', met: validation.hasLowerCase },
    { key: 'hasNumbers', label: 'Number', met: validation.hasNumbers },
    { key: 'hasSpecialChar', label: 'Special character', met: validation.hasSpecialChar },
  ];

  return (
    <div className="mt-2">
      <div className="text-xs text-gray-600 mb-2">Password requirements:</div>
      <div className="space-y-1">
        {requirements.map((req) => (
          <div key={req.key} className="flex items-center text-xs">
            <i className={`fas ${req.met ? 'fa-check text-green-500' : 'fa-times text-red-500'} mr-2`}></i>
            <span className={req.met ? 'text-green-700' : 'text-red-700'}>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;