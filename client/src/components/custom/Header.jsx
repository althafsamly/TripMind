
import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LogOut, User, Home, Compass, Info, Phone, LayoutDashboard, Menu, X, Sparkles } from 'lucide-react'
import api from '../../service/api'

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { user, logout, checkAuth } = useAuth()
    const navigate = useNavigate();

    // Refresh user data on mount to sync roles
    useEffect(() => {
        if (user) {
            checkAuth();
        }
    }, []);



    return (
        <header className="w-full h-full sticky top-0 z-50 bg-[#050505] border-b border-white/10 shadow-sm relative">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Left Side: Logo & Navigation */}
                    <div className="flex items-center gap-8">
                        {/* Logo Built Entirely in Code */}
                        <Link to="/" className="flex items-center gap-2.5 group cursor-pointer transition-transform duration-300 select-none">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white text-black rounded-lg flex items-center justify-center font-black text-[16px] tracking-tight shadow-md group-hover:scale-105 transition-transform">
                                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-urbanist font-black tracking-[0.06em] text-white text-[19px] sm:text-[23px] leading-tight">
                                    TRIP<span className="text-gray-400 font-light ml-1">MIND</span>
                                </span>
                                <span className="text-[7px] sm:text-[8px] font-bold tracking-[0.28em] text-gray-500 uppercase -mt-0.5">
                                    AI Travel Intelligence
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-6 pt-1">
                            <Link to="/" style={{ color: 'white' }} className="text-sm font-semibold tracking-wide relative hover:-translate-y-0.5 transform transition-all duration-300 after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[2px] after:bottom-[-4px] after:left-0 after:bg-white after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">
                                Home
                            </Link>


                            <Link to="/my-trips" style={{ color: 'white' }} className="text-sm font-semibold tracking-wide relative hover:-translate-y-0.5 transform transition-all duration-300 after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[2px] after:bottom-[-4px] after:left-0 after:bg-white after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">
                                My Trips
                            </Link>


                            <Link to="/about" style={{ color: 'white' }} className="text-sm font-semibold tracking-wide relative hover:-translate-y-0.5 transform transition-all duration-300 after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[2px] after:bottom-[-4px] after:left-0 after:bg-white after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">
                                About
                            </Link>

                            <Link to="/contact" style={{ color: 'white' }} className="text-sm font-semibold tracking-wide relative hover:-translate-y-0.5 transform transition-all duration-300 after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[2px] after:bottom-[-4px] after:left-0 after:bg-white after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left">
                                Contact
                            </Link>

                        </nav>
                    </div>

                    {/* Right Side - Desktop / Auth Buttons */}
                    <div className="hidden md:flex items-center gap-3">

                        {/* Auth Buttons */}
                        {user ? (
                            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/20">
                                <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/20 hover:bg-white/10 transition-colors cursor-pointer group">
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-white group-hover:text-blue-300 transition-colors">{user.username || user.email}</span>
                                            <User className="w-4 h-4 text-gray-300 group-hover:text-blue-300 transition-colors" />
                                        </div>
                                    </div>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        logout();
                                        navigate('/');
                                    }}
                                    className="text-sm h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <LogOut className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 ml-2 pl-2">
                                <Link to="/login">
                                    <Button variant="outline" size="sm" className="text-sm font-bold !text-white border-white bg-transparent hover:bg-white/10 rounded-full h-10 px-6 transition-all border shadow-none">
                                        Login
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button size="sm" className="text-sm text-white rounded-full h-10 px-6 border-none shadow-[0_0_25px_rgba(0,77,122,0.4)] font-bold bg-gradient-to-r from-[#004d7a] to-[#733c2e] hover:scale-105 transition-all">
                                        Signup
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Actions */}
                    <div className="md:hidden flex items-center gap-2">

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="w-10 h-10 flex items-center justify-center rounded-sm bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-90"
                        >
                            {isMenuOpen ? (
                                <X className="w-5 h-5 text-white animate-in zoom-in duration-300" />
                            ) : (
                                <Menu className="w-5 h-5 text-white animate-in zoom-in duration-300" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Simple Compact Mobile Navigation - Side Slide */}
                {isMenuOpen && (
                    <>
                        {/* Backdrop to close */}
                        <div
                            className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity"
                            onClick={() => setIsMenuOpen(false)}
                        ></div>

                        <div className="md:hidden fixed top-0 right-0 h-full w-[260px] bg-[#0a0a0a] border-l border-white/10 z-50 shadow-2xl animate-in slide-in-from-right duration-300 ease-in-out">
                            <div className="flex flex-col h-full">
                                {/* Close button area */}
                                <div className="flex justify-end p-4 border-b border-white/5">
                                    <button
                                        onClick={() => setIsMenuOpen(false)}
                                        className="w-10 h-10 flex items-center justify-center rounded-sm hover:bg-white/5"
                                    >
                                        <X className="w-6 h-6 text-white" />
                                    </button>
                                </div>

                                {/* Navigation Links */}
                                <nav className="flex flex-col pt-4 overflow-y-auto">
                                    <Link to="/" onClick={() => setIsMenuOpen(false)} className="px-6 py-4 text-[16px] font-black text-white hover:bg-white/10 transition-colors flex items-center gap-4">
                                        <Home className="w-5 h-5 text-white" />
                                        <span className="text-white">Home</span>
                                    </Link>
                                    <Link to="/my-trips" onClick={() => setIsMenuOpen(false)} className="px-6 py-4 text-[16px] font-black text-white hover:bg-white/10 transition-colors flex items-center gap-4">
                                        <Compass className="w-5 h-5 text-white" />
                                        <span className="text-white">My Trips</span>
                                    </Link>

                                    <div className="h-px bg-white/20 my-4 mx-6"></div>

                                    <Link to="/about" onClick={() => setIsMenuOpen(false)} className="px-6 py-4 text-[16px] font-black !text-white hover:bg-white/10 transition-colors">
                                        About Us
                                    </Link>
                                    <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="px-6 py-4 text-[16px] font-black !text-white hover:bg-white/10 transition-colors">
                                        Contact Support
                                    </Link>
                                </nav>

                                {/* Action Buttons at Bottom */}
                                <div className="mt-auto px-5 py-8 border-t border-white/10 flex flex-col gap-3 bg-white/[0.03]">
                                    {!user ? (
                                        <>
                                            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full">
                                                <Button variant="outline" className="w-full h-11 text-[13px] font-black uppercase tracking-widest text-white border-white/20 bg-transparent rounded-lg hover:bg-white/5">
                                                    Sign in
                                                </Button>
                                            </Link>
                                            <Link to="/register" onClick={() => setIsMenuOpen(false)} className="w-full">
                                                <Button className="w-full h-11 text-[13px] font-black uppercase tracking-widest bg-white text-black hover:bg-gray-200 rounded-lg shadow-none">
                                                    Sign up
                                                </Button>
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="w-full">
                                                <Button variant="outline" className="w-full h-11 text-[12px] font-bold text-white border-white/10 bg-transparent rounded-lg">
                                                    My Profile
                                                </Button>
                                            </Link>
                                            <button
                                                onClick={() => { logout(); setIsMenuOpen(false); navigate('/'); }}
                                                className="w-full py-4 text-center text-red-500 font-bold text-[13px] uppercase tracking-widest mt-2 hover:bg-red-500/10 rounded-lg transition-all"
                                            >
                                                Log out
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Decorative Element */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-blue-200 to-transparent"></div>
        </header>
    )
}

export default Header
