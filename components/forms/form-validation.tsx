"use client";

import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X, AlertCircle } from "lucide-react";

interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

interface ValidatedInputProps {
  name: string;
  type?: string;
  placeholder?: string;
  label: string;
  icon?: React.ReactNode;
  required?: boolean;
  validationRules?: ValidationRule[];
  className?: string;
  onValidChange?: (isValid: boolean) => void;
}

export function ValidatedInput({
  name,
  type = "text",
  placeholder,
  label,
  icon,
  required = false,
  validationRules = [],
  className = "",
  onValidChange
}: ValidatedInputProps) {
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validateValue = (val: string) => {
    const newErrors: string[] = [];
    
    if (required && !val.trim()) {
      newErrors.push("Este campo é obrigatório");
    }
    
    validationRules.forEach(rule => {
      if (val && !rule.test(val)) {
        newErrors.push(rule.message);
      }
    });
    
    setErrors(newErrors);
    const valid = newErrors.length === 0 && (!required || val.trim().length > 0);
    setIsValid(valid);
    onValidChange?.(valid);
    
    return valid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (touched) {
      validateValue(newValue);
    }
  };

  const handleBlur = () => {
    setTouched(true);
    validateValue(value);
  };

  const getValidationIcon = () => {
    if (!touched || !value) return null;
    
    if (errors.length > 0) {
      return <X className="w-4 h-4 text-red-500" />;
    } else {
      return <Check className="w-4 h-4 text-green-500" />;
    }
  };

  const getInputClassName = () => {
    let baseClass = "pr-10 " + className;
    
    if (touched && value) {
      if (errors.length > 0) {
        baseClass += " border-red-500 focus:border-red-500";
      } else {
        baseClass += " border-green-500 focus:border-green-500";
      }
    }
    
    return baseClass;
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="flex items-center gap-2">
        {icon}
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          required={required}
          className={getInputClassName()}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {getValidationIcon()}
        </div>
      </div>
      
      {touched && errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-3 h-3" />
              <span>{error}</span>
            </div>
          ))}
        </div>
      )}
      
      {touched && isValid && value && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <Check className="w-3 h-3" />
          <span>Válido</span>
        </div>
      )}
    </div>
  );
}

// Validation rules for common inputs
export const emailValidation: ValidationRule[] = [
  {
    test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: "Formato de email inválido"
  }
];

export const passwordValidation: ValidationRule[] = [
  {
    test: (value) => value.length >= 6,
    message: "A senha deve ter pelo menos 6 caracteres"
  },
  {
    test: (value) => value.length <= 128,
    message: "A senha não pode ter mais de 128 caracteres"
  }
];

export const nameValidation: ValidationRule[] = [
  {
    test: (value) => value.trim().length >= 2,
    message: "Nome deve ter pelo menos 2 caracteres"
  },
  {
    test: (value) => /^[a-zA-ZÀ-ÿ\s]+$/.test(value),
    message: "Nome deve conter apenas letras e espaços"
  }
];

// Form validation hook
export function useFormValidation() {
  const [formValid, setFormValid] = useState(false);
  const [fieldValidities, setFieldValidities] = useState<Record<string, boolean>>({});

  const updateFieldValidity = (fieldName: string, isValid: boolean) => {
    setFieldValidities(prev => ({
      ...prev,
      [fieldName]: isValid
    }));
  };

  useEffect(() => {
    const allFieldsValid = Object.values(fieldValidities).every(Boolean);
    const hasFields = Object.keys(fieldValidities).length > 0;
    setFormValid(allFieldsValid && hasFields);
  }, [fieldValidities]);

  return {
    formValid,
    updateFieldValidity,
    fieldValidities
  };
} 