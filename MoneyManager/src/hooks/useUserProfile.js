import { useState, useEffect } from 'react';
import { userService } from '../api';

export const useUserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user profile and preferences
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const [profileData, preferencesData] = await Promise.all([
        userService.getProfile(),
        userService.getPreferences()
      ]);
      setProfile(profileData);
      setPreferences(preferencesData);
    } catch (err) {
      setError(err.message || 'Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const result = await userService.updateProfile(profileData);
      setProfile(result.user);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      throw err;
    }
  };

  // Update preferences
  const updatePreferences = async (preferencesData) => {
    try {
      const result = await userService.updatePreferences(preferencesData);
      setPreferences(result.preferences);
      return result;
    } catch (err) {
      setError(err.message || 'Failed to update preferences');
      throw err;
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    try {
      return await userService.changePassword(passwordData);
    } catch (err) {
      setError(err.message || 'Failed to change password');
      throw err;
    }
  };

  // Upload avatar
  const uploadAvatar = async (file) => {
    try {
      const result = await userService.uploadAvatar(file);
      setProfile(prev => ({ ...prev, avatar: result.avatar.url }));
      return result;
    } catch (err) {
      setError(err.message || 'Failed to upload avatar');
      throw err;
    }
  };

  // Delete avatar
  const deleteAvatar = async () => {
    try {
      await userService.deleteAvatar();
      setProfile(prev => ({ ...prev, avatar: null }));
    } catch (err) {
      setError(err.message || 'Failed to delete avatar');
      throw err;
    }
  };

  // Enable/disable 2FA
  const enable2FA = async (verificationData) => {
    try {
      const result = await userService.enable2FA(verificationData);
      setProfile(prev => ({ ...prev, twoFactorEnabled: true }));
      return result;
    } catch (err) {
      setError(err.message || 'Failed to enable 2FA');
      throw err;
    }
  };

  const disable2FA = async (verificationData) => {
    try {
      await userService.disable2FA(verificationData);
      setProfile(prev => ({ ...prev, twoFactorEnabled: false }));
    } catch (err) {
      setError(err.message || 'Failed to disable 2FA');
      throw err;
    }
  };

  // Clear error
  const clearError = () => setError(null);

  return {
    profile,
    preferences,
    loading,
    error,
    updateProfile,
    updatePreferences,
    changePassword,
    uploadAvatar,
    deleteAvatar,
    enable2FA,
    disable2FA,
    refetch: fetchProfile,
    clearError
  };
};

export const useUserSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getSessions();
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const revokeSession = async (sessionId) => {
    try {
      await userService.revokeSession(sessionId);
      setSessions(prev => prev.filter(session => session.id !== sessionId));
    } catch (err) {
      setError(err.message || 'Failed to revoke session');
      throw err;
    }
  };

  const revokeAllSessions = async () => {
    try {
      await userService.revokeAllSessions();
      setSessions(prev => prev.filter(session => session.current));
    } catch (err) {
      setError(err.message || 'Failed to revoke all sessions');
      throw err;
    }
  };

  return {
    sessions,
    loading,
    error,
    revokeSession,
    revokeAllSessions,
    refetch: fetchSessions
  };
};

export const useUserActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchActivity = async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const [activityData, loginData] = await Promise.all([
        userService.getActivityLog({ limit: 20, ...params }),
        userService.getLoginHistory({ limit: 20, ...params })
      ]);
      setActivities(activityData.activities || []);
      setLoginHistory(loginData.logins || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch activity data');
    } finally {
      setLoading(false);
    }
  };

  return {
    activities,
    loginHistory,
    loading,
    error,
    fetchActivity
  };
};

export const useUserPrivacy = () => {
  const [privacySettings, setPrivacySettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrivacySettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getPrivacySettings();
      setPrivacySettings(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch privacy settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrivacySettings();
  }, []);

  const updatePrivacySettings = async (settings) => {
    try {
      await userService.updatePrivacySettings(settings);
      setPrivacySettings(prev => ({ ...prev, ...settings }));
    } catch (err) {
      setError(err.message || 'Failed to update privacy settings');
      throw err;
    }
  };

  const exportUserData = async (options = {}) => {
    try {
      const exportData = await userService.exportUserData({
        format: 'json',
        includeTransactions: true,
        includeBudgets: true,
        includeGoals: true,
        includeReports: true,
        ...options
      });

      // Create download
      const url = window.URL.createObjectURL(exportData);
      const a = document.createElement('a');
      a.href = url;
      a.download = `money-manager-export-${new Date().toISOString().split('T')[0]}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      return true;
    } catch (err) {
      setError(err.message || 'Failed to export data');
      throw err;
    }
  };

  return {
    privacySettings,
    loading,
    error,
    updatePrivacySettings,
    exportUserData,
    refetch: fetchPrivacySettings
  };
};