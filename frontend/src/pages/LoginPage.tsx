import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { login, register } from '@/lib/auth';
import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

const ROLE_LANDING: Record<string, string> = {
  OWNER: '/dashboard',
  ADMIN: '/admin/users',
};

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

const registerSchema = z
  .object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface LoginPageProps {
  defaultMode?: 'login' | 'register';
}

export default function LoginPage({ defaultMode = 'login' }: LoginPageProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [serverError, setServerError] = useState<string | null>(null);

  const loginForm = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const redirectToLanding = () => {
    const role = useAuthStore.getState().user?.role ?? '';
    navigate(ROLE_LANDING[role] ?? '/dashboard', { replace: true });
  };

  const onLogin = async (data: LoginFormData) => {
    setServerError(null);
    try {
      await login(data);
      redirectToLanding();
    } catch {
      setServerError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
    }
  };

  const onRegister = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      await register({ email: data.email, password: data.password });
      redirectToLanding();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setServerError(msg ?? 'Đăng ký thất bại. Email có thể đã được sử dụng.');
    }
  };

  const switchMode = (next: 'login' | 'register') => {
    setMode(next);
    setServerError(null);
    loginForm.reset();
    registerForm.reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">EAM</CardTitle>
          <p className="text-center text-sm text-muted-foreground mt-1">
            {mode === 'login' ? 'Đăng nhập vào tài khoản' : 'Tạo tài khoản mới'}
          </p>
        </CardHeader>
        <CardContent>
          {mode === 'login' ? (
            <form onSubmit={loginForm.handleSubmit(onLogin)} noValidate className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="owner@example.com"
                  autoComplete="email"
                  className="min-h-[44px]"
                  {...loginForm.register('email')}
                  aria-invalid={!!loginForm.formState.errors.email}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-red-600" role="alert">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Mật khẩu</Label>
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  className="min-h-[44px]"
                  {...loginForm.register('password')}
                  aria-invalid={!!loginForm.formState.errors.password}
                />
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-red-600" role="alert">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {serverError && (
                <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2" role="alert">
                  {serverError}
                </p>
              )}

              <Button
                type="submit"
                className="w-full min-h-[44px]"
                disabled={loginForm.formState.isSubmitting}
              >
                {loginForm.formState.isSubmitting ? 'Đang đăng nhập…' : 'Đăng nhập'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  className="text-primary underline underline-offset-2"
                  onClick={() => switchMode('register')}
                >
                  Đăng ký ngay
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(onRegister)} noValidate className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="owner@example.com"
                  autoComplete="email"
                  className="min-h-[44px]"
                  {...registerForm.register('email')}
                  aria-invalid={!!registerForm.formState.errors.email}
                />
                {registerForm.formState.errors.email && (
                  <p className="text-sm text-red-600" role="alert">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password">Mật khẩu</Label>
                <Input
                  id="reg-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Tối thiểu 8 ký tự"
                  className="min-h-[44px]"
                  {...registerForm.register('password')}
                  aria-invalid={!!registerForm.formState.errors.password}
                />
                {registerForm.formState.errors.password && (
                  <p className="text-sm text-red-600" role="alert">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-confirm">Xác nhận mật khẩu</Label>
                <Input
                  id="reg-confirm"
                  type="password"
                  autoComplete="new-password"
                  className="min-h-[44px]"
                  {...registerForm.register('confirmPassword')}
                  aria-invalid={!!registerForm.formState.errors.confirmPassword}
                />
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-600" role="alert">
                    {registerForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {serverError && (
                <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2" role="alert">
                  {serverError}
                </p>
              )}

              <Button
                type="submit"
                className="w-full min-h-[44px]"
                disabled={registerForm.formState.isSubmitting}
              >
                {registerForm.formState.isSubmitting ? 'Đang đăng ký…' : 'Đăng ký'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  className="text-primary underline underline-offset-2"
                  onClick={() => switchMode('login')}
                >
                  Đăng nhập
                </button>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
