import React from 'react';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-[#141414] text-gray-400 py-12 px-4 md:px-12 mt-12 border-t border-gray-800">
            <div className="max-w-5xl mx-auto">
                <div className="flex gap-6 mb-8 text-white">
                    <Facebook className="w-6 h-6 cursor-pointer hover:text-gray-200" />
                    <Instagram className="w-6 h-6 cursor-pointer hover:text-gray-200" />
                    <Twitter className="w-6 h-6 cursor-pointer hover:text-gray-200" />
                    <Youtube className="w-6 h-6 cursor-pointer hover:text-gray-200" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-8">
                    <div className="flex flex-col gap-3">
                        <span className="hover:underline cursor-pointer">Audio Description</span>
                        <span className="hover:underline cursor-pointer">Investor Relations</span>
                        <span className="hover:underline cursor-pointer">Legal Notices</span>
                    </div>
                    <div className="flex flex-col gap-3">
                        <span className="hover:underline cursor-pointer">Help Center</span>
                        <span className="hover:underline cursor-pointer">Jobs</span>
                        <span className="hover:underline cursor-pointer">Cookie Preferences</span>
                    </div>
                    <div className="flex flex-col gap-3">
                        <span className="hover:underline cursor-pointer">Gift Cards</span>
                        <span className="hover:underline cursor-pointer">Terms of Use</span>
                        <span className="hover:underline cursor-pointer">Corporate Information</span>
                    </div>
                    <div className="flex flex-col gap-3">
                        <span className="hover:underline cursor-pointer">Media Center</span>
                        <span className="hover:underline cursor-pointer">Privacy</span>
                        <span className="hover:underline cursor-pointer">Contact Us</span>
                    </div>
                </div>

                <button className="border border-gray-400 px-4 py-1.5 text-sm hover:border-white hover:text-white transition">
                    Service Code
                </button>

                <div className="mt-4 text-xs">
                    © {new Date().getFullYear()} NETFLIX Inc.
                </div>
            </div>
        </footer>
    );
};
