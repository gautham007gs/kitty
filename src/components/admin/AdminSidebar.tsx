'use client';
import Link from 'next/link';

const AdminSidebar = () => {
  return (
    <div className="flex flex-col w-64 h-screen px-4 py-8 bg-white border-r">
      <h2 className="text-3xl font-semibold text-center text-indigo-800">Maya</h2>
      <div className="flex flex-col justify-between mt-6">
        <aside>
          <ul>
            <li>
              <Link href="/admin" className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-md">
                  <span className="mx-4 font-medium">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/profile" className="flex items-center px-4 py-2 mt-5 text-gray-600 rounded-md hover:bg-gray-200">
                  <span className="mx-4 font-medium">AI Profile</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/ads" className="flex items-center px-4 py-2 mt-5 text-gray-600 rounded-md hover:bg-gray-200">
                  <span className="mx-4 font-medium">Ad Settings</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/media" className="flex items-center px-4 py-2 mt-5 text-gray-600 rounded-md hover:bg-gray-200">
                  <span className="mx-4 font-medium">Media Assets</span>
              </Link>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
};

export default AdminSidebar;
