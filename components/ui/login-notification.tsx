"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { CheckCircle, LogOut } from "lucide-react";

export default function LoginNotification() {
  const { user } = useAuth();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'login' | 'logout'>('login');
  const [prevUser, setPrevUser] = useState(user);

  useEffect(() => {
    // Check if user state changed
    if (prevUser !== user) {
      if (!prevUser && user) {
        // User just logged in
        setNotificationType('login');
        setShowNotification(true);
      } else if (prevUser && !user) {
        // User just logged out
        setNotificationType('logout');
        setShowNotification(true);
      }
      
      setPrevUser(user);
    }
  }, [user, prevUser]);

  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000); // Hide after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  if (!showNotification) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right-2 duration-300">
      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg border ${
        notificationType === 'login' 
          ? 'bg-green-50 border-green-200 text-green-800' 
          : 'bg-blue-50 border-blue-200 text-blue-800'
      }`}>
        {notificationType === 'login' ? (
          <>
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Login realizado com sucesso!</span>
          </>
        ) : (
          <>
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout realizado com sucesso!</span>
          </>
        )}
      </div>
    </div>
  );
} 