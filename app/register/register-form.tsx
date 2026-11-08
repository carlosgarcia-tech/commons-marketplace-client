'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button, Input } from '@/components/ui';
import type { UserRole } from '@/types';

export function RegisterForm() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer' as UserRole,
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (error) clearError();
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.name) {
      errors.name = 'El nombre es requerido';
    } else if (formData.name.length < 2) {
      errors.name = 'El nombre debe tener al menos 2 caracteres';
    }
    if (!formData.email) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = 'La contraseña debe incluir al menos una letra mayúscula';
    } else if (!/[a-z]/.test(formData.password)) {
      errors.password = 'La contraseña debe incluir al menos una letra minúscula';
    } else if (!/[0-9]/.test(formData.password)) {
      errors.password = 'La contraseña debe incluir al menos un número';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const result = await register(formData.name, formData.email, formData.password, formData.role);

      if (result.needsEmailConfirmation) {
        router.push('/register/confirm-email');
      } else {
        router.push('/');
      }
    } catch {
      // Error is handled by the store
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div role="alert" className="p-3 text-xs font-mono uppercase tracking-wider text-danger bg-danger-bg border-2 border-danger/30">
          {error}
        </div>
      )}

      <Input
        label="Nombre"
        name="name"
        type="text"
        placeholder="Tu nombre"
        value={formData.name}
        onChange={handleChange}
        error={validationErrors.name}
        autoComplete="name"
      />

      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="tu@email.com"
        value={formData.email}
        onChange={handleChange}
        error={validationErrors.email}
        autoComplete="email"
      />

      <div className="space-y-1.5">
        <label className="block text-xs font-display font-semibold uppercase tracking-wider text-gray-600">
          Tipo de cuenta
        </label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="block w-full border-2 border-gray-300 bg-surface px-3 py-2.5 font-body text-sm transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-ghost)] focus:outline-none"
        >
          <option value="buyer">Comprador</option>
        </select>
      </div>

      <Input
        label="Contraseña"
        name="password"
        type="password"
        placeholder="••••••••"
        value={formData.password}
        onChange={handleChange}
        error={validationErrors.password}
        autoComplete="new-password"
      />

      <Input
        label="Confirmar Contraseña"
        name="confirmPassword"
        type="password"
        placeholder="••••••••"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={validationErrors.confirmPassword}
        autoComplete="new-password"
      />

      <Button type="submit" className="w-full font-mono uppercase text-xs" isLoading={isLoading}>
        Crear Cuenta
      </Button>
    </form>
  );
}
