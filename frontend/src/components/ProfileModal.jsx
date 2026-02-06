import React from 'react';

const ProfileModal = ({ user, onClose }) => {
    if (!user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-32 relative">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 rounded-full p-2 transition-all"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                
                <div className="px-8 pb-8">
                    <div className="relative -mt-16 mb-6 flex justify-center">
                        <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg flex items-center justify-center overflow-hidden">
                             {user?.avatar ? (
                                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                             ) : (
                                <div className="w-full h-full bg-blue-600 flex items-center justify-center text-4xl font-bold text-white">
                                    {user.username?.[0]?.toUpperCase()}
                                </div>
                             )}
                        </div>
                    </div>
                    
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800">{user.username}</h2>
                        <p className="text-gray-500">{user.email}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">User ID</p>
                                <p className="text-sm font-semibold text-gray-700 font-mono truncate max-w-[200px]">{user._id || user.id}</p>
                            </div>
                        </div>
                        
                         <div className="p-4 bg-gray-50 rounded-2xl flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Joined</p>
                                <p className="text-sm font-semibold text-gray-700">
                                    {new Date(user.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
