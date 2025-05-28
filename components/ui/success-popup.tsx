"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Mail, X } from "lucide-react";

interface SuccessPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: "success" | "info" | "warning";
}

export function SuccessPopup({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = "success" 
}: SuccessPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Prevent body scroll when popup is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case "warning":
        return <Mail className="w-8 h-8 text-amber-600" />;
      default:
        return <CheckCircle className="w-8 h-8 text-blue-600" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case "success":
        return {
          border: "border-green-200 dark:border-green-800",
          bg: "bg-green-50 dark:bg-green-950",
          text: "text-green-800 dark:text-green-200"
        };
      case "warning":
        return {
          border: "border-amber-200 dark:border-amber-800",
          bg: "bg-amber-50 dark:bg-amber-950",
          text: "text-amber-800 dark:text-amber-200"
        };
      default:
        return {
          border: "border-blue-200 dark:border-blue-800",
          bg: "bg-blue-50 dark:bg-blue-950",
          text: "text-blue-800 dark:text-blue-200"
        };
    }
  };

  const colors = getColors();

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <Card 
        className={`w-full max-w-md border-2 shadow-2xl transform transition-all duration-300 ${
          isVisible ? 'scale-100' : 'scale-95'
        } ${colors.border}`}
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="relative pb-4">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          <div className="flex items-center gap-3">
            {getIcon()}
            <CardTitle className="text-xl font-bold">
              {title}
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className={`p-4 rounded-lg ${colors.bg} ${colors.border} border`}>
            <p className={`text-sm leading-relaxed ${colors.text}`}>
              {message}
            </p>
          </div>

          {type === "success" && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex gap-2">
                <Mail className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  <p className="font-medium mb-1">📋 Próximos passos:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Abra sua caixa de entrada de email</li>
                    <li>Procure por email do CEA UFBA (verifique spam também)</li>
                    <li>Clique no link "Confirmar Email"</li>
                    <li>Retorne aqui e faça login normalmente</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button 
              onClick={handleClose}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Entendi!
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 