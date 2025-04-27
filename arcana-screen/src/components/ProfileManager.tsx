import { useState, ChangeEvent } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import toast from 'react-hot-toast';
import { Profile } from '../store/useProfileStore';

interface ProfileManagerProps {
  onLoadProfile: (layoutConfig: any) => void;
  currentLayoutConfig: any;
}

const ProfileManager: React.FC<ProfileManagerProps> = ({ onLoadProfile, currentLayoutConfig }) => {
  const { profiles, createProfile, deleteProfile, loadProfile } = useProfileStore();
  const [profileName, setProfileName] = useState<string>('');

  const handleCreate = () => {
    if (!profileName.trim()) {
      toast.error('Profile name required');
      return;
    }
    createProfile({ name: profileName, layoutConfig: currentLayoutConfig });
    toast.success('Profile created!');
    setProfileName('');
  };

  const handleLoad = (id: string) => {
    const profile = loadProfile(id);
    if (profile) {
      onLoadProfile(profile.layoutConfig);
      toast.success('Profile loaded');
    }
  };

  const handleDelete = (id: string) => {
    deleteProfile(id);
    toast('Profile deleted', { icon: '🗑️' });
  };

  return (
    <div className="p-4 bg-gray-50 rounded shadow-md w-full max-w-md mx-auto">
      <h3 className="font-bold text-lg mb-2">Profile Manager</h3>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          className="border rounded px-2 py-1 flex-1"
          placeholder="New profile name"
          value={profileName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setProfileName(e.target.value)}
        />
        <button
          onClick={handleCreate}
          className="bg-green-600 text-white rounded px-3 py-1 font-semibold hover:bg-green-700"
        >
          + New Profile
        </button>
      </div>
      <ul className="divide-y divide-gray-200">
        {profiles.length === 0 && (
          <li className="text-gray-400 italic py-2">No profiles saved</li>
        )}
        {profiles.map((profile: Profile) => (
          <li key={profile.id} className="flex items-center justify-between py-2">
            <span className="font-medium">{profile.name}</span>
            <div className="flex gap-2">
              <button
                onClick={() => handleLoad(profile.id)}
                className="bg-blue-500 text-white rounded px-2 py-1 text-xs hover:bg-blue-600"
              >
                Load
              </button>
              <button
                onClick={() => handleDelete(profile.id)}
                className="bg-red-500 text-white rounded px-2 py-1 text-xs hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProfileManager;
