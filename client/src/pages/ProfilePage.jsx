import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Save, KeyRound, LogOut, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const ProfilePage = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const { showToast } = useToast();

  // Profile fields
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('Name and email are required', 'error');
      return;
    }

    setSavingProfile(true);
    await updateProfile(name.trim(), email.trim());
    setSavingProfile(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      showToast('Please fill all password fields', 'error');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }

    setSavingPassword(true);
    const res = await changePassword(currentPassword, newPassword, confirmNewPassword);
    setSavingPassword(false);
    if (res.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 800 }}>Account & Profile</h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
          Manage your personal details and account security settings
        </p>
      </div>

      {/* Edit Profile Details */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.5rem', background: 'var(--primary-50)', color: 'var(--primary-600)', borderRadius: 'var(--radius-md)' }}>
            <User size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Profile Information</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
              Update your display name and email address
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={savingProfile}
            style={{ marginTop: '0.5rem' }}
          >
            <Save size={16} />
            <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.5rem', background: 'var(--accent-50)', color: 'var(--accent-600)', borderRadius: 'var(--radius-md)' }}>
            <KeyRound size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Security & Password</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
              Ensure your account is using a strong, unique password
            </p>
          </div>
        </div>

        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Repeat new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-secondary btn-sm"
            disabled={savingPassword}
            style={{ marginTop: '0.5rem' }}
          >
            <Lock size={16} />
            <span>{savingPassword ? 'Updating Password...' : 'Change Password'}</span>
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div
        className="card"
        style={{
          padding: '1.5rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderColor: 'var(--slate-200)',
        }}
      >
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-800)' }}>
            Sign Out of Smart Plate
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
            End your current session on this device
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="btn btn-danger btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
