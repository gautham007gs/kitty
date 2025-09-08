'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const AdminHeader = () => {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b-4 border-indigo-600">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold text-gray-800">Admin Dashboard</h2>
      </div>
      <div className="flex items-center">
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)} 
            className="relative z-10 block w-8 h-8 overflow-hidden rounded-full shadow focus:outline-none">
            <img className="object-cover w-full h-full" src="https://i.postimg.cc/52S3BZrM/images-10.jpg" alt="Your avatar" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 z-20 w-48 py-2 mt-2 bg-white rounded-md shadow-xl">
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-600 hover:text-white">Profile</a>
              <button onClick={handleSignOut} className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-indigo-600 hover:text-white">
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
