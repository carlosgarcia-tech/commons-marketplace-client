'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productApi, categoryApi } from '@/lib/api';
import type { Category } from '@/types';
import { useFormField } from '@/hooks/use-form-field';
import { Button, Input, Textarea, Card, CardContent } from '@/components/ui';
import { ImageUpload } from '@/components/ui/image-upload';
import { FIELD_LIMITS, requiredText, isPositiveNumber, isNonNegativeInt } from '@/lib/validation';
import { sanitizeFormData, validateNumericField } from '@/lib/sanitize';

export default function NewProductPage() {
  const params = useParams();
  const router = useRouter();
  const storeSlug = params.slug as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagesError, setImagesError] = useState<string | null>(null);

  const { values, errors, isSubmitting, error, handleChange, handleSubmit } = useFormField({
    initialValues: {
      name: '',
      description: '',
      price: '',
      stock: '',
      categoryId: '',
    },
    validate: (vals) => {
      const errs: Record<string, string> = {};
      const nameError = requiredText(vals.name, FIELD_LIMITS.PRODUCT_NAME, 'El nombre');
      if (nameError) errs.name = nameError;
      const descError = requiredText(vals.description, FIELD_LIMITS.PRODUCT_DESCRIPTION, 'La descripción');
      if (descError) errs.description = descError;
      if (!isPositiveNumber(vals.price)) errs.price = 'El precio debe ser un número mayor o igual a 0';
      if (!isNonNegativeInt(vals.stock)) errs.stock = 'El stock debe ser un número entero mayor o igual a 0';
      if (!vals.categoryId) errs.categoryId = 'Debes seleccionar una categoría';
      if (images.length === 0) errs.images = 'Debes subir al menos una imagen principal';
      return errs;
    },
    onSubmit: async (vals) => {
      const data = new FormData();
      data.append('name', vals.name);
      data.append('description', vals.description);
      const price = validateNumericField(vals.price, {});
      const stock = validateNumericField(vals.stock, { integer: true });
      data.append('price', String(price));
      data.append('stock', String(stock));
      data.append('categoryId', vals.categoryId);
      data.append('storeSlug', storeSlug);
      if (images.length > 0) {
        data.append('mainImage', images[0]);
        images.slice(1).forEach((img) => {
          data.append('additionalImages', img);
        });
      }
      await productApi.create(sanitizeFormData(data));
      router.push(`/dashboard/my-store/${storeSlug}/products`);
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryApi.getAll();
        setCategories(data);
      } catch {
        // ignore
      }
    };
    fetchCategories();
  }, []);

  const handleImageChange = (file: File | null) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setImagesError('Cada imagen no debe superar 5MB');
        return;
      }
      setImagesError(null);
      setImages((prev) => {
        if (prev.length >= 5) return prev;
        return [...prev, file];
      });
    } else {
      setImages([]);
    }
  };

  const handleImageChangeMultiple = (newFiles: File[]) => {
    const oversized = newFiles.some((file) => file.size > 5 * 1024 * 1024);
    if (oversized) {
      setImagesError('Cada imagen no debe superar 5MB');
      return;
    }
    setImagesError(null);
    setImages((prev) => {
      const combined = [...prev, ...newFiles];
      return combined.slice(0, 5);
    });
  };

  const handleImageRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Nuevo Producto</h1>

      {error && (
        <div className="mb-4 p-3 text-red-600 bg-red-50 rounded-lg">{error}</div>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <ImageUpload
              label="Imágenes del producto"
              onChange={handleImageChange}
              onChangeMultiple={handleImageChangeMultiple}
              onFileRemove={handleImageRemove}
              accept="image/*"
              multiple
              maxImages={5}
            />
            {imagesError && (
              <p className="text-xs font-medium text-red-600">{imagesError}</p>
            )}

            <Input
              label="Nombre del producto"
              name="name"
              value={values.name}
              onChange={handleChange}
              placeholder="Nombre del producto"
              required
              maxLength={FIELD_LIMITS.PRODUCT_NAME}
              error={errors.name}
            />

            <Textarea
              label="Descripción"
              name="description"
              value={values.description}
              onChange={handleChange}
              placeholder="Descripción del producto..."
              rows={3}
              maxLength={FIELD_LIMITS.PRODUCT_DESCRIPTION}
              error={errors.description}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Precio"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={values.price}
                onChange={handleChange}
                required
                error={errors.price}
              />
              <Input
                label="Stock"
                name="stock"
                type="number"
                min="0"
                value={values.stock}
                onChange={handleChange}
                required
                error={errors.stock}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Categoría
              </label>
              <select
                name="categoryId"
                value={values.categoryId}
                onChange={handleChange}
                className={`block w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary ${
                  errors.categoryId ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-xs font-medium text-red-600">{errors.categoryId}</p>
              )}
            </div>

            <div className="flex gap-4">
              <Button type="submit" isLoading={isSubmitting}>
                Crear Producto
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/dashboard/my-store/${storeSlug}/products`)}
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
