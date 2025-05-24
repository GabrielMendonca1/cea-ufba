"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { upsertUserProfile, UserType } from "@/utils/supabase/user-profile";

// Utility function for better error handling
function getErrorMessage(error: any): string {
  if (error?.message) {
    // Map common Supabase auth errors to user-friendly messages
    switch (error.message) {
      case 'Invalid login credentials':
        return 'Email ou senha incorretos. Verifique suas credenciais.';
      case 'Email not confirmed':
        return 'Por favor, confirme seu email antes de fazer login.';
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

// Email validation function
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password validation function
function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (password.length < 6) {
    return { isValid: false, message: 'A senha deve ter pelo menos 6 caracteres.' };
  }
  if (password.length > 128) {
    return { isValid: false, message: 'A senha não pode ter mais de 128 caracteres.' };
  }
  return { isValid: true };
}

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

  try {
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

    // Profile creation is now handled automatically by the database trigger
    console.log('✅ Signup completed - trigger should handle profile creation');
    console.log('=== SIGNUP ACTION END ===');
    
    return encodedRedirect(
      "success",
      "/sign-up",
      "Cadastro realizado com sucesso! Verifique seu email para confirmar a conta.",
    );

  } catch (error) {
    console.error('❌ Unexpected error in signUpAction:', {
      name: (error as Error)?.name,
      message: (error as Error)?.message,
      stack: (error as Error)?.stack,
      fullError: error
    });
    return encodedRedirect(
      "error",
      "/sign-up",
      "Erro interno do servidor. Tente novamente mais tarde.",
    );
  }
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

    // Check if user needs onboarding
    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('has_completed_onboarding')
        .eq('id', data.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking user profile:', profileError);
        // Continue to protected route if there's an error
      }

      if (profile && !profile.has_completed_onboarding) {
        return redirect("/onboarding");
      }

    } catch (profileError) {
      console.error('Unexpected error checking user profile:', profileError);
      // Continue to protected route
    }

    return redirect("/protected");

  } catch (error) {
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
