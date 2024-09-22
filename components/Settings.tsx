import React, { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { FaSave, FaBell, FaLock, FaUserCircle, FaPalette } from 'react-icons/fa';

const SettingsPage = () => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState('english');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = (event: any) => {
    event.preventDefault();
    // Implement save functionality here
    console.log('Settings saved');
  };

  return (
    <div className="p-4 bg-navy h-full overflow-auto text-milk">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>

      <form onSubmit={handleSave}>
        <div className="space-y-6">
          {/* Account Section */}
          <section>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FaUserCircle className="mr-2" />
              Account
            </h3>
            <div className="bg-modal rounded-lg p-4 space-y-4">
              <div>
                <label className="block mb-2">Email</label>
                <input
                  type="email"
                  value={user?.primaryEmailAddress?.emailAddress || ''}
                  disabled
                  className="w-full p-2 bg-navy border border-outline rounded"
                />
              </div>
              <div>
                <label className="block mb-2">Username</label>
                <input
                  type="text"
                  value={user?.username || ''}
                  disabled
                  className="w-full p-2 bg-navy border border-outline rounded"
                />
              </div>
            </div>
          </section>

          {/* Password Section */}
          <section>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FaLock className="mr-2" />
              Change Password
            </h3>
            <div className="bg-modal rounded-lg p-4 space-y-4">
              <div>
                <label className="block mb-2">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 bg-navy border border-outline rounded"
                />
              </div>
              <div>
                <label className="block mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2 bg-navy border border-outline rounded"
                />
              </div>
            </div>
          </section>

          {/* Preferences Section */}
          <section>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FaPalette className="mr-2" />
              Preferences
            </h3>
            <div className="bg-modal rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span>Dark Mode</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={() => setDarkMode(!darkMode)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div>
                <label className="block mb-2">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-2 bg-navy border border-outline rounded"
                >
                  <option value="english">English</option>
                  <option value="spanish">Spanish</option>
                  <option value="french">French</option>
                </select>
              </div>
            </div>
          </section>

          {/* Notifications Section */}
          <section>
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <FaBell className="mr-2" />
              Notifications
            </h3>
            <div className="bg-modal rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span>Enable Notifications</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={() => setNotifications(!notifications)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </section>
        </div>

        <button
          type="submit"
          className="mt-6 flex items-center justify-center w-full bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-bold py-2 px-4 rounded hover:from-pink-600 hover:to-indigo-600 transition duration-300"
        >
          <FaSave className="mr-2" />
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default SettingsPage;