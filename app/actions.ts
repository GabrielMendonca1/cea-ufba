"use server";

/**
 * Server Actions for Authentication
 * 
 * This file contains all server-side authentication actions for the application.
 * These functions handle user registration, login, password reset, and logout.
 * 
 * Core functionality:
 * - User registration with profile creation
 * - User authentication (sign in/out)
 * - Password reset and recovery
 * - Input validation and error handling
 * - Supabase integration for auth and database operations
 * - Professor validation with UFBA systems
 * 
 * All actions return encoded redirects for proper client-side handling.
 */

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { UserType } from "@/utils/supabase/user-profile";
import { 
  validateProfessorWithUFBA, 
  logProfessorRegistration,
  isValidUFBAEmail 
} from "@/utils/supabase/professor-validation";

/**
 * Error Message Utility
 * Maps Supabase auth errors to user-friendly Portuguese messages
 */
function getErrorMessage(error: { message?: string }): string {
  if (error?.message) {
    // Map common Supabase auth errors to user-friendly messages
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Email ou senha incorretos. Verifique suas credenciais.';
      case 'Email not confirmed':
        return 'Sua conta ainda não foi confirmada. Verifique sua caixa de entrada de email (incluindo spam) e clique no link de confirmação que enviamos. Se não encontrou o email, tente se cadastrar novamente.';
      case 'User already registered':
        return 'Este email já está cadastrado. Tente fazer login ou recuperar sua senha.';
      case 'Password should be at least 6 characters':
        return 'A senha deve ter pelo menos 6 caracteres.';
      case 'Unable to validate email address: invalid format':
        return 'Formato de email inválido. Verifique o endereço digitado.';
      case 'Signup is disabled':
        return 'Cadastro temporariamente desabilitado. Tente novamente mais tarde.';
      default:
        return error.message;
    }
  }
  return 'Ocorreu um erro inesperado. Tente novamente.';
}

/**
 * Email Validation Function
 * Validates email format using regex pattern
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Password Validation Function
 * Validates password strength and length requirements
 */
function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (password.length < 6) {
    return { isValid: false, message: 'A senha deve ter pelo menos 6 caracteres.' };
  }
  if (password.length > 128) {
    return { isValid: false, message: 'A senha não pode ter mais de 128 caracteres.' };
  }
  return { isValid: true };
}

/**
 * Sign Up Action
 * Handles user registration with validation and profile creation
 * 
 * @param formData - Form data containing email, password, full_name, and user_type
 * @returns Encoded redirect with success or error message
 */
export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString();
  const userType = formData.get("user_type")?.toString() as UserType;
  const origin = (await headers()).get("origin");

  console.log('=== SIGNUP ACTION START ===');
  console.log('Received form data:', {
    email: email ? `${email.substring(0, 3)}***@${email.split('@')[1]}` : 'missing',
    password: password ? '[REDACTED]' : 'missing',
    fullName,
    userType,
    origin
  });

  if (!email || !password) {
    console.log('❌ Validation failed: Missing email or password');
    return encodedRedirect(
      "error",
      "/sign-up",
      "Email e senha são obrigatórios.",
    );
  }

  if (!fullName) {
    console.log('❌ Validation failed: Missing full name');
    return encodedRedirect(
      "error",
      "/sign-up",
      "Nome completo é obrigatório.",
    );
  }

  if (!userType || !['student', 'professor'].includes(userType)) {
    console.log('❌ Validation failed: Invalid user type:', userType);
    return encodedRedirect(
      "error",
      "/sign-up",
      "Tipo de usuário é obrigatório.",
    );
  }

  console.log('✅ All validations passed');

  const supabase = await createClient();

  console.log('🔄 Attempting Supabase signup with metadata:', {
    email: email ? `${email.substring(0, 3)}***@${email.split('@')[1]}` : 'missing',
    metadata: {
      full_name: fullName,
      user_type: userType,
    }
  });

  // First, sign up the user with metadata
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        user_type: userType,
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error('❌ Auth signup error details:', {
      message: error.message,
      status: error.status,
      code: error.code,
      fullError: error
    });
    return encodedRedirect("error", "/sign-up", getErrorMessage(error));
  }

  if (!data.user) {
    console.error('❌ No user data returned from signup');
    return encodedRedirect(
      "error",
      "/sign-up",
      "Erro ao criar usuário. Tente novamente.",
    );
  }

  console.log('✅ User created successfully:', {
    userId: data.user.id,
    email: data.user.email,
    emailConfirmed: data.user.email_confirmed_at,
    metadata: data.user.user_metadata
  });

  // Special validation for professors
  if (userType === 'professor') {
    console.log('🔍 Initiating professor validation process...');
    
    try {
      const professorValidationData = {
        email: email,
        fullName: fullName,
        userId: data.user.id,
        metadata: data.user.user_metadata
      };

      // Validate professor with UFBA systems
      const validationResult = await validateProfessorWithUFBA(professorValidationData);
      
      // Log the registration attempt
      await logProfessorRegistration(professorValidationData, validationResult);
      
      if (!validationResult.isValid) {
        console.error('❌ Professor validation failed:', validationResult.message);
        return encodedRedirect(
          "error",
          "/sign-up",
          `Validação de professor falhou: ${validationResult.message}`,
        );
      }

      console.log('✅ Professor validation successful:', validationResult.validationId);
      
      // Check if email is from UFBA domain
      if (!isValidUFBAEmail(email)) {
        console.log('⚠️ Warning: Professor using non-UFBA email domain');
      }
      
    } catch (error) {
      console.error('❌ Error during professor validation:', error);
      return encodedRedirect(
        "error",
        "/sign-up",
        "Erro na validação de professor. Tente novamente mais tarde.",
      );
    }
  }

  // Profile creation is now handled automatically by the database trigger
  // For professors, we need to set account_status to pending
  if (userType === 'professor') {
    try {
      console.log('🔄 Setting professor account status to pending...');
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ account_status: 'pending' })
        .eq('id', data.user.id);

      if (updateError) {
        console.error('❌ Error setting professor account status:', updateError);
        // Don't fail the signup process, just log the error
      } else {
        console.log('✅ Professor account status set to pending');
      }
    } catch (error) {
      console.error('❌ Unexpected error setting professor account status:', error);
    }
  }
  
  console.log('✅ Signup completed - trigger should handle profile creation');
  console.log('=== SIGNUP ACTION END ===');

  // Success case - this should execute after successful signup
  return encodedRedirect(
    "success",
    "/sign-up",
    userType === 'professor' 
      ? "Conta de professor criada com sucesso! Confirme seu email primeiro e aguarde a validação da sua conta pela equipe da UFBA. Este processo pode levar de 1 a 3 dias úteis. Você receberá um email quando sua conta for aprovada."
      : "Conta criada com sucesso! Verifique sua caixa de entrada de email (incluindo spam/lixo eletrônico) e clique no link de confirmação para ativar sua conta. Você só poderá fazer login após confirmar seu email.",
  );
};

export const signInAction = async (formData: FormData) => {
  try {
    const email = formData.get("email")?.toString()?.trim();
    const password = formData.get("password")?.toString();

    // Input validation
    if (!email || !password) {
      return encodedRedirect(
        "error",
        "/sign-in",
        "Email e senha são obrigatórios.",
      );
    }

    if (!isValidEmail(email)) {
      return encodedRedirect(
        "error",
        "/sign-in",
        "Formato de email inválido.",
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('SignIn error:', error);
      return encodedRedirect("error", "/sign-in", getErrorMessage(error));
    }

    if (!data.user) {
      return encodedRedirect(
        "error",
        "/sign-in",
        "Erro ao fazer login. Tente novamente.",
      );
    }

    console.log('✅ User signed in successfully:', {
      userId: data.user.id,
      email: data.user.email
    });

    // Check user profile and account status
    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('has_completed_onboarding, user_type, account_status')
        .eq('id', data.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking user profile:', profileError);
        // Continue to protected route if there's an error
      }

      if (profile) {
        // Check account status for professors
        if (profile.user_type === 'professor') {
          if (profile.account_status === 'pending') {
            console.log('❌ Professor account is pending approval');
            return encodedRedirect(
              "error",
              "/sign-in",
              "Sua conta de professor ainda está aguardando aprovação da equipe da UFBA. Você receberá um email quando sua conta for aprovada (1-3 dias úteis).",
            );
          }
          
          if (profile.account_status === 'rejected') {
            console.log('❌ Professor account was rejected');
            return encodedRedirect(
              "error",
              "/sign-in",
              "Sua conta de professor foi rejeitada. Entre em contato com a equipe da UFBA para mais informações.",
            );
          }
        }

        // Check if user needs onboarding
        if (!profile.has_completed_onboarding) {
          console.log('🔄 Redirecting to onboarding');
          return redirect("/onboarding");
        }
      }

    } catch (profileError) {
      console.error('Unexpected error checking user profile:', profileError);
      // Continue to protected route
    }

    console.log('🔄 Redirecting to dashboard');
    return redirect("/dashboard");

  } catch (error) {
    // Only catch actual errors, not redirect exceptions
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      // Re-throw redirect errors so Next.js can handle them
      throw error;
    }
    
    console.error('Unexpected error in signInAction:', error);
    return encodedRedirect(
      "error",
      "/sign-in",
      "Erro interno do servidor. Tente novamente mais tarde.",
    );
  }
};

export const forgotPasswordAction = async (formData: FormData) => {
  try {
    const email = formData.get("email")?.toString()?.trim();
    const callbackUrl = formData.get("callbackUrl")?.toString();

    if (!email) {
      return encodedRedirect("error", "/forgot-password", "Email é obrigatório.");
    }

    if (!isValidEmail(email)) {
      return encodedRedirect("error", "/forgot-password", "Formato de email inválido.");
    }

    const supabase = await createClient();
    const origin = (await headers()).get("origin");

    if (!origin) {
      throw new Error('Origin header not found');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
    });

    if (error) {
      console.error('ForgotPassword error:', error);
      return encodedRedirect(
        "error",
        "/forgot-password",
        getErrorMessage(error),
      );
    }

    if (callbackUrl) {
      return redirect(callbackUrl);
    }

    return encodedRedirect(
      "success",
      "/forgot-password",
      "Verifique seu email para o link de redefinição de senha.",
    );

  } catch (error) {
    // Only catch actual errors, not redirect exceptions
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      // Re-throw redirect errors so Next.js can handle them
      throw error;
    }
    
    console.error('Unexpected error in forgotPasswordAction:', error);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Erro interno do servidor. Tente novamente mais tarde.",
    );
  }
};

export const resetPasswordAction = async (formData: FormData) => {
  try {
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirmPassword")?.toString();

    if (!password || !confirmPassword) {
      return encodedRedirect(
        "error",
        "/protected/reset-password",
        "Senha e confirmação são obrigatórias.",
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return encodedRedirect(
        "error",
        "/protected/reset-password",
        passwordValidation.message!,
      );
    }

    if (password !== confirmPassword) {
      return encodedRedirect(
        "error",
        "/protected/reset-password",
        "As senhas não coincidem.",
      );
    }

    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      console.error('ResetPassword error:', error);
      return encodedRedirect(
        "error",
        "/protected/reset-password",
        getErrorMessage(error),
      );
    }

    return encodedRedirect(
      "success", 
      "/protected/reset-password", 
      "Senha atualizada com sucesso!"
    );

  } catch (error) {
    // Only catch actual errors, not redirect exceptions
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      // Re-throw redirect errors so Next.js can handle them
      throw error;
    }
    
    console.error('Unexpected error in resetPasswordAction:', error);
    return encodedRedirect(
      "error",
      "/protected/reset-password",
      "Erro interno do servidor. Tente novamente mais tarde.",
    );
  }
};

export const signOutAction = async () => {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('SignOut error:', error);
      // Even if there's an error, redirect to sign-in
    }
    
    return redirect("/sign-in");

  } catch (error) {
    console.error('Unexpected error in signOutAction:', error);
    return redirect("/sign-in");
  }
};

export const resendConfirmationAction = async (formData: FormData) => {
  try {
    const email = formData.get("email")?.toString()?.trim();

    if (!email) {
      return encodedRedirect("error", "/sign-in", "Email é obrigatório.");
    }

    if (!isValidEmail(email)) {
      return encodedRedirect("error", "/sign-in", "Formato de email inválido.");
    }

    const supabase = await createClient();
    const origin = (await headers()).get("origin");

    if (!origin) {
      throw new Error('Origin header not found');
    }

    // Try to resend confirmation email
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${origin}/auth/callback`
      }
    });

    if (error) {
      console.error('Resend confirmation error:', error);
      
      // If user is already confirmed, redirect to sign in
      if (error.message.includes('already confirmed')) {
        return encodedRedirect(
          "success",
          "/sign-in",
          "Sua conta já está confirmada. Tente fazer login.",
        );
      }
      
      return encodedRedirect(
        "error",
        "/sign-in",
        getErrorMessage(error),
      );
    }

    return encodedRedirect(
      "success",
      "/sign-in",
      "Email de confirmação reenviado! Verifique sua caixa de entrada.",
    );

  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error;
    }
    
    console.error('Unexpected error in resendConfirmationAction:', error);
    return encodedRedirect(
      "error",
      "/sign-in",
      "Erro interno do servidor. Tente novamente mais tarde.",
    );
  }
};
