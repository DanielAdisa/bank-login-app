"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, User, Building, Shield, Users, CheckCircle, AlertTriangle } from "lucide-react";
import Swal from "sweetalert2";
import { validatePassword, calculatePasswordStrength, hashPassword, RateLimiter } from "../utils/security";

interface Transaction {
  id: number;
  date: string;
  amount: number;
  description: string;
}

interface SessionData {
  credentials: {
    email: string;
    password: string;
    remember: boolean;
  };
  transactions: Transaction[];
  userType: string;
  expiresAt: number;
}

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [passwordStrength, setPasswordStrength] = useState<{ score: number; label: 'Weak' | 'Fair' | 'Good' | 'Strong'; color: string }>({ score: 0, label: 'Weak', color: 'bg-red-500' });
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const rateLimiter = new RateLimiter();

  const userTypes = [
    { id: "customer", label: "Customer", icon: Users, placeholder: "customer@example.com" },
    { id: "employee", label: "Employee", icon: Shield, placeholder: "employee@example.com" },
    { id: "admin", label: "Admin", icon: Building, placeholder: "admin@example.com" },
  ];

  useEffect(() => {
    const strength = calculatePasswordStrength(credentials.password);
    setPasswordStrength(strength);
  }, [credentials.password]);

  // Add a useEffect for session persistence
  useEffect(() => {
    const savedSession = localStorage.getItem('bankingSession');
    if (savedSession) {
      const session: SessionData = JSON.parse(savedSession);
      
      // Check if session has expired
      if (Date.now() > session.expiresAt) {
        localStorage.removeItem('bankingSession');
        return;
      }

      setIsLoggedIn(true);
      setCredentials(session.credentials);
      setTransactions(session.transactions);
      setActiveTab(session.userType);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!rateLimiter.checkLimit(credentials.email)) {
      setError(`Too many login attempts. Please try again in 15 minutes. 
        Remaining attempts: ${rateLimiter.getRemainingAttempts(credentials.email)}`);
      return;
    }

    const passwordValidation = validatePassword(credentials.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message);
      return;
    }

    setIsLoading(true);

    try {
      const hashedPassword = hashPassword(credentials.password);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulated transaction data
      const transactionData: Transaction[] = [
        { id: 1, date: "2025-02-01", amount: 100, description: "Deposit" },
        { id: 2, date: "2025-02-05", amount: -50, description: "Withdrawal" },
        { id: 3, date: "2025-02-10", amount: 200, description: "Deposit" },
      ];

      // Save session data with expiration
      const sessionData: SessionData = {
        credentials,
        transactions: transactionData,
        userType: activeTab,
        expiresAt: credentials.remember 
          ? Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
          : Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };
      localStorage.setItem('bankingSession', JSON.stringify(sessionData));

      setTransactions(transactionData);
      setIsLoggedIn(true);

      Swal.fire({
        title: "Welcome!",
        text: "Login successful",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        background: "rgba(255, 255, 255, 0.9)",
        backdrop: `rgba(0,0,123,0.4)`,
      });
    } catch (err: any) {
      Swal.fire({
        title: "Error!",
        text: err.message,
        icon: "error",
        background: "rgba(255, 255, 255, 0.9)",
        backdrop: `rgba(123,0,0,0.4)`,
      });
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout",
      background: "rgba(255, 255, 255, 0.9)",
      backdrop: `rgba(0,0,123,0.4)`,
    }).then((result) => {
      if (result.isConfirmed) {
        // Clear session data
        localStorage.removeItem('bankingSession');
        
        setIsLoggedIn(false);
        setCredentials({ email: "", password: "", remember: false });
        setTransactions([]);
      }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  useEffect(() => {
    const checkSession = () => {
      const savedSession = localStorage.getItem('bankingSession');
      if (savedSession) {
        const session: SessionData = JSON.parse(savedSession);
        if (Date.now() > session.expiresAt) {
          localStorage.removeItem('bankingSession');
          setIsLoggedIn(false);
          setCredentials({ email: "", password: "", remember: false });
          setTransactions([]);
          
          Swal.fire({
            title: "Session Expired",
            text: "Please log in again",
            icon: "warning",
            background: "rgba(255, 255, 255, 0.9)",
            backdrop: `rgba(0,0,123,0.4)`,
          });
        }
      }
    };
  
    const interval = setInterval(checkSession, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen gradient-background rounded-xl md:py-6 flex flex-col justify-center">
      <div className="relative p-4 rounded-xl md:max-w-xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r rounded-xl from-violet-500 to-fuchsia-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl opacity-75 animate-float"></div>
        <div className="relative px-4 py-10 glass-morphism shadow-xl sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold text-white mb-8 text-center">Banking Portal</h1>
            </motion.div>

            <div className="space-y-8">
              <AnimatePresence mode="wait">
                {!isLoggedIn ? (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/20 border border-red-500 text-white px-4 py-3 rounded-lg"
                      >
                        <div className="flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2" />
                          <span>{error}</span>
                        </div>
                      </motion.div>
                    )}

                    <div className="flex space-x-4 justify-center">
                      {userTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <motion.div
                            key={type.id}
                            onClick={() => setActiveTab(type.id)}
                            className={`p-4 flex flex-col items-center rounded-xl cursor-pointer ${
                              activeTab === type.id
                                ? "bg-white/20 border border-white/50"
                                : "hover:bg-white/10"
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Icon size={32} className="text-white" />
                            <span className="mt-2 text-sm text-white">{type.label}</span>
                          </motion.div>
                        );
                      })}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-white">Email</label>
                        <div className="mt-1">
                          <input
                            type="email"
                            value={credentials.email}
                            onChange={(e) =>
                              setCredentials({ ...credentials, email: e.target.value })
                            }
                            className="input-animated w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                            placeholder={userTypes.find((t) => t.id === activeTab)?.placeholder}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white">Password</label>
                        <div className="mt-1 relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={credentials.password}
                            onChange={(e) =>
                              setCredentials({ ...credentials, password: e.target.value })
                            }
                            className="input-animated w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 pr-10"
                            placeholder="Enter your password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/50 hover:text-white"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                        
                        <div className="mt-2">
                          <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full ${passwordStrength.color}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${passwordStrength.score}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                          <p className="text-sm mt-1 text-white/70">
                            Password Strength: {passwordStrength.label}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            id="remember"
                            type="checkbox"
                            checked={credentials.remember}
                            onChange={(e) =>
                              setCredentials({ ...credentials, remember: e.target.checked })
                            }
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-white/20 rounded bg-white/10"
                          />
                          <label htmlFor="remember" className="ml-2 block text-sm text-white">
                            Remember me
                          </label>
                        </div>

                        <div className="text-sm">
                          <a href="#" className="font-medium text-purple-300 hover:text-purple-200">
                            Forgot password?
                          </a>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white rounded-full border-t-transparent"
                          />
                        ) : (
                          "Sign In"
                        )}
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center space-x-4">
                      <CheckCircle className="h-8 w-8 text-green-400" />
                      <h2 className="text-2xl font-semibold text-white">
                        Welcome back, {credentials.email}
                      </h2>
                    </div>

                    <div className="bg-white/10 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-white mb-4">Recent Transactions</h3>
                      <div className="space-y-4">
                        {transactions.map((transaction) => (
                          <motion.div
                            key={transaction.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-between items-center p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                          >
                            <div>
                              <p className="text-white font-medium">{transaction.description}</p>
                              <p className="text-sm text-white/70">{formatDate(transaction.date)}</p>
                            </div>
                            <p className={`text-lg font-semibold ${
                              transaction.amount > 0 ? "text-green-400" : "text-red-400"
                            }`}>
                              {transaction.amount > 0 ? "+" : ""}${transaction.amount.toFixed(2)}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;