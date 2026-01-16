import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white mt-12">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-lg font-bold mb-4">About Us</h3>
                        <p className="text-gray-400">xxxxxx.</p>
                    </div>
                    
                    {/* <div>
                        <h3 className="text-lg font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#home" className="hover:text-white transition">Home</a></li>
                            <li><a href="#about" className="hover:text-white transition">About</a></li>
                            <li><a href="#services" className="hover:text-white transition">Services</a></li>
                        </ul>
                    </div> */}
                    
                    <div>
                        <h3 className="text-lg font-bold mb-4">Contact</h3>
                        <p className="text-gray-400 mb-2">Email: f1212839@gmail.com</p>
                        <p className="text-gray-400">Phone: (123) 456-7890</p>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-bold mb-4">Follow Us</h3>
                        <ul className="space-y-2 text-gray-400">
                            <li><a href="#linkedin" className="hover:text-white transition">LinkedIn</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-6 py-4 text-center text-gray-400">
                    <p>&copy; 2026 Fangqin Li, Chunjingwen Cui, Weiren Feng. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;