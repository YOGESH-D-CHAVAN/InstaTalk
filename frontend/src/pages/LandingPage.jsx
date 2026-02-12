
import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Zap, 
  Shield, 
  Users, 
  Smartphone,
  Globe,
  CheckCircle,
  ArrowRight,
  Star,
  Menu,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, user: "Alex", text: "Hey team! Ready for the meeting?", time: "10:00 AM", isUser: false },
    { id: 2, user: "You", text: "Yes, I've prepared the presentation", time: "10:01 AM", isUser: true },
    { id: 3, user: "Sarah", text: "I'll join in 5 minutes", time: "10:02 AM", isUser: false },
    { id: 4, user: "You", text: "Perfect! See you then", time: "10:03 AM", isUser: true },
  ]);
  
  const [features] = useState([
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Real-time messaging with <100ms latency"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "End-to-End Encryption",
      description: "Your conversations are secure and private"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "One to One Chats",
      description: "Connect with teams, friends, and communities"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Cross-Platform",
      description: "Available on web, iOS, and Android"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Reach",
      description: "Chat with anyone, anywhere in the world"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Rich Media",
      description: "Share images, files, and voice messages"
    }
  ]);
  
  const [testimonials] = useState([
    {
      name: "Yogesh Chavan",
      role: "Product Manager",
      company: "TechFlow Inc.",
      content: "InstaChat transformed our team communication. The real-time features are incredible!",
      rating: 5
    },
    {
      name: "Ganesh Wakchaure",
      role: "Community Manager",
      company: "StartupGrid",
      content: "Our community engagement increased by 70% after switching to InstaChat.",
      rating: 5
    },
    {
      name: "Harshal Gosavi",
      role: "CTO",
      company: "Nexus Labs",
      content: "The reliability and speed are unmatched. Best chat platform we've used.",
      rating: 4
    }
  ]);
  
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newMessage = {
          id: messages.length + 1,
          user: ["Alex", "Sarah", "Jordan"][Math.floor(Math.random() * 3)],
          text: ["Anyone free for a quick call?", "Check out this article!", "Meeting notes uploaded"][Math.floor(Math.random() * 3)],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isUser: false
        };
        setMessages(prev => [...prev.slice(-3), newMessage]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">InstaChat</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-indigo-600 font-medium">Features</a>
              <a href="#testimonials" className="text-gray-700 hover:text-indigo-600 font-medium">Testimonials</a>
              {/* <a href="#pricing" className="text-gray-700 hover:text-indigo-600 font-medium">Pricing</a> */}
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
             <Link to={"/login"}>
              <button className="hidden md:inline-flex items-center px-4 py-2 text-gray-700 font-medium rounded-lg hover:bg-gray-100">
                Sign In
              </button>
             </Link>
             <Link to={"/register"}>
              <button className="inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
             </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-indigo-600 p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 pt-2 pb-6 space-y-2">
              <a 
                href="#features" 
                className="block px-3 py-3 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#testimonials" 
                className="block px-3 py-3 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Testimonials
              </a>
              <a 
                href="#pricing" 
                className="block px-3 py-3 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <div className="border-t border-gray-100 my-2 pt-2 space-y-2">
                <Link 
                  to="/login" 
                  className="block w-full text-left px-3 py-3 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  to="/register"
                  className="block w-full text-center px-5 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                   Get Started Free
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Real-Time Chat
                <span className="block text-indigo-600">That Connects</span>
                <span className="block text-gray-900">Your World</span>
              </h1>
              <p className="mt-6 text-xl text-gray-600 max-w-2xl">
                Experience seamless communication with lightning-fast messaging, secure encryption, and intuitive features designed for modern teams and communities.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link to={"/register"}>
                <button className="inline-flex items-center justify-center px-8 py-3.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors text-lg">
                  Start Free Trial
                  <Zap className="ml-2 h-5 w-5" />
                </button>
                </Link>
                {/* <button className="inline-flex items-center justify-center px-8 py-3.5 bg-white text-gray-900 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-lg">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  View Demo
                </button> */}
              </div>
              <div className="mt-8 flex items-center text-gray-600">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span>No credit card required</span>
                <span className="mx-3">•</span>
                
              </div>
            </div>
            
            <div className="lg:w-1/2 mt-12 lg:mt-0">
              <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-auto border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="font-semibold text-gray-900">Team Chat</span>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
                  {messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs rounded-2xl px-4 py-3 ${msg.isUser ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-900 rounded-bl-none'}`}>
                        <div className="font-medium text-sm mb-1">
                          {msg.isUser ? 'You' : msg.user}
                        </div>
                        <div className="text-sm">{msg.text}</div>
                        <div className={`text-xs mt-2 ${msg.isUser ? 'text-indigo-200' : 'text-gray-500'}`}>
                          {msg.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="flex-1 px-4 py-3 bg-gray-100 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button className="px-5 py-3 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700">
                    <MessageSquare className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Modern Communication
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed to enhance your real-time communication experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="bg-gray-50 rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="inline-flex p-3 bg-indigo-100 text-indigo-600 rounded-xl mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section id="testimonials" className="py-20 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Loved by Teams Worldwide
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied users who transformed their communication
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="text-gray-700 italic mb-6">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-lg mr-4">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600">{testimonial.role} • {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              Ready to Transform Your Communication?
            </h2>
            <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
              Join thousands of teams who trust InstaChat for their real-time communication needs.
            </p>
            
            <div className="max-w-md mx-auto">
              {isSubscribed ? (
                <div className="bg-green-500/20 border border-green-400 rounded-xl p-4">
                  <p className="font-semibold"> Thank you! We'll be in touch soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-6 py-3.5 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                    required
                  />
                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-white text-indigo-600 font-bold rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    Get Started Free
                  </button>
                </form>
              )}
              <p className="text-sm opacity-80 mt-4">
                Start your 14-day free trial. No credit card required.
              </p>
            </div>
          </div>
        </div>
      </section>


      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <MessageSquare className="h-8 w-8 text-white" />
              <span className="ml-2 text-2xl font-bold">InstaChat</span>
            </div>

            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} InstaChat. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;