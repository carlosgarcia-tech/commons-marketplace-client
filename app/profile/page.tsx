/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { userApi } from '@/lib/api';
import { Button, Input } from '@/components/ui';
import { FIELD_LIMITS, optionalText } from '@/lib/validation';
import { sanitizeFormData } from '@/lib/sanitize';

const PHONE_REGEX = /^[0-9+()\-\s]*$/;

export default function ProfilePage() {
  const { user, isAuthenticated, setUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    phoneNumber: '',
    address: '',
  });

  useEffect(() => {
    if (!user) return;
    // Deferred to a timeout: synchronous setState inside effect bodies
    // is disallowed by react-hooks/set-state-in-effect.
    const timer = setTimeout(() => {
      setFormData({
        name: user.name || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFieldErrors((prev) => ({ ...prev, avatar: 'La foto no debe superar 5MB' }));
      return;
    }
    setFieldErrors((prev) => ({ ...prev, avatar: '' }));
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const errors: Record<string, string> = {};
    const nameError = optionalText(formData.name, FIELD_LIMITS.NAME, 'El nombre');
    if (nameError) errors.name = nameError;
    const lastNameError = optionalText(formData.lastName, FIELD_LIMITS.LAST_NAME, 'El apellido');
    if (lastNameError) errors.lastName = lastNameError;

    if (formData.phoneNumber.trim() !== '' && !PHONE_REGEX.test(formData.phoneNumber)) {
      errors.phoneNumber = 'El teléfono solo puede contener números, espacios, +, ( ) y -';
    } else {
      const phoneError = optionalText(formData.phoneNumber, FIELD_LIMITS.PHONE, 'El teléfono');
      if (phoneError) errors.phoneNumber = phoneError;
    }

    const addressError = optionalText(formData.address, FIELD_LIMITS.ADDRESS, 'La dirección');
    if (addressError) errors.address = addressError;

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError('Por favor corrige los campos marcados en rojo.');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('lastName', formData.lastName);
      data.append('phoneNumber', formData.phoneNumber);
      data.append('address', formData.address);
      if (avatar) data.append('avatar', avatar);

      const updatedUser = await userApi.update(user!._id, sanitizeFormData(data));
      setUser({
        ...user!,
        ...updatedUser,
        avatarUrl: updatedUser.profilePicUrl || updatedUser.avatarUrl,
      });
      setSuccess('Perfil actualizado correctamente');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px] font-mono text-sm text-gray-400 uppercase tracking-wider">
        Debes iniciar sesión para ver tu perfil.
      </div>
    );
  }

  const currentAvatarSrc = avatarPreview || user?.avatarUrl || user?.profilePicUrl || null;
  const initials = user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?';
  const roleLabel = user?.role?.toLowerCase() === 'admin' ? 'Administrador' : user?.role?.toLowerCase() === 'seller' ? 'Vendedor' : 'Usuario';

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10 relative">
        <div className="absolute -left-4 top-0 w-1 h-full bg-primary" />
        <p className="text-xs font-mono text-primary uppercase tracking-wider mb-1">Cuenta</p>
        <h1 className="h1 text-3xl md:text-4xl text-foreground">Mi Perfil</h1>
      </div>

      {/* Toasts */}
      {error && (
        <div className="mb-6 p-3 border-2 border-danger bg-danger-bg font-mono text-xs uppercase tracking-wider text-danger animate-fadeIn">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-3 border-2 border-success bg-success-bg font-mono text-xs uppercase tracking-wider text-success animate-fadeIn">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identity Card */}
        <div className="industrial-card rounded-none bg-surface">
          <div className="px-5 py-4 border-b-2 border-gray-200">
            <h2 className="font-display font-semibold text-foreground text-sm uppercase tracking-wider">Identidad</h2>
          </div>
          <div className="p-5">
            {/* Avatar + Meta */}
            <div className="flex items-start gap-5 mb-6">
              <div className="flex-shrink-0 flex flex-col items-center gap-2">
                <div className="relative w-20 h-20 border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden cursor-pointer group">
                  {currentAvatarSrc ? (
                    <img src={currentAvatarSrc} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-3xl font-display font-black text-primary">{initials}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleAvatarChange} />
                </div>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Foto</span>
                {fieldErrors.avatar && (
                  <span className="text-[10px] font-mono text-red-600 uppercase tracking-wider">{fieldErrors.avatar}</span>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-3">
                {/* Role Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-gray-200 bg-gray-50">
                  <span className="w-2 h-2 bg-primary" />
                  <span className="text-xs font-mono font-medium uppercase tracking-wider text-gray-600">{roleLabel}</span>
                </div>
                {/* Email */}
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <span className="text-sm font-mono text-gray-500 truncate">{user?.email}</span>
                </div>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Nombre" name="name" value={formData.name} onChange={handleChange} placeholder="Tu nombre" maxLength={FIELD_LIMITS.NAME} error={fieldErrors.name} />
              <Input label="Apellido" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Tu apellido" maxLength={FIELD_LIMITS.LAST_NAME} error={fieldErrors.lastName} />
            </div>
          </div>
        </div>

        {/* Contact Card */}
        <div className="industrial-card rounded-none bg-surface">
          <div className="px-5 py-4 border-b-2 border-gray-200">
            <h2 className="font-display font-semibold text-foreground text-sm uppercase tracking-wider">Contacto</h2>
          </div>
          <div className="p-5 space-y-4">
            <Input label="Teléfono" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="+52 55 0000 0000" type="tel" maxLength={FIELD_LIMITS.PHONE} error={fieldErrors.phoneNumber} />
            <Input label="Dirección" name="address" value={formData.address} onChange={handleChange} placeholder="Calle, número, ciudad…" maxLength={FIELD_LIMITS.ADDRESS} error={fieldErrors.address} />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <Button type="submit" isLoading={isSubmitting} className="font-mono uppercase text-xs">
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  );
}
