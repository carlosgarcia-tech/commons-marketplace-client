'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { storeApi } from '@/lib/api';
import { useFormField } from '@/hooks/use-form-field';
import { Button, Input, Textarea, Card, CardContent } from '@/components/ui';
import { ImageUpload } from '@/components/ui/image-upload';
import { FIELD_LIMITS, requiredText, optionalText } from '@/lib/validation';
import { sanitizeFormData } from '@/lib/sanitize';

export default function NewStorePage() {
  const router = useRouter();
  const [logo, setLogo] = useState<File | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);

  const { values, errors, isSubmitting, error, handleChange, handleSubmit } = useFormField({
    initialValues: { storeName: '', description: '' },
    validate: (vals) => {
      const errs: Record<string, string> = {};
      const nameError = requiredText(vals.storeName, FIELD_LIMITS.STORE_NAME, 'El nombre de la tienda');
      if (nameError) errs.storeName = nameError;
      const descError = optionalText(vals.description, FIELD_LIMITS.STORE_DESCRIPTION, 'La descripción');
      if (descError) errs.description = descError;
      return errs;
    },
    onSubmit: async (vals) => {
      const data = new FormData();
      data.append('storeName', vals.storeName);
      data.append('description', vals.description);
      if (logo) {
        data.append('logo', logo);
      }
      await storeApi.create(sanitizeFormData(data));
      router.push('/dashboard');
    },
  });

  const handleLogoChange = (file: File | null) => {
    if (file && file.size > 5 * 1024 * 1024) {
      setLogoError('El logo no debe superar 5MB');
      return;
    }
    setLogoError(null);
    setLogo(file);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Crear Tienda</h1>

      {error && (
        <div className="mb-4 p-3 text-red-600 bg-red-50 rounded-lg">{error}</div>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <ImageUpload
              label="Logo de la tienda"
              value={logo ? URL.createObjectURL(logo) : undefined}
              onChange={handleLogoChange}
              accept="image/*"
            />
            {logoError && (
              <p className="text-xs font-medium text-red-600">{logoError}</p>
            )}

            <Input
              label="Nombre de la tienda"
              name="storeName"
              value={values.storeName}
              onChange={handleChange}
              placeholder="Mi Tienda"
              required
              maxLength={FIELD_LIMITS.STORE_NAME}
              error={errors.storeName}
            />

            <Textarea
              label="Descripción"
              name="description"
              value={values.description}
              onChange={handleChange}
              placeholder="Descripción de tu tienda..."
              rows={4}
              maxLength={FIELD_LIMITS.STORE_DESCRIPTION}
              error={errors.description}
            />

            <div className="flex gap-4">
              <Button type="submit" isLoading={isSubmitting}>
                Crear Tienda
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
