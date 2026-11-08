'use client';
import { useEffect, useState, type FormEvent } from 'react';
import { useRequireRole } from '@/hooks/use-auth';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import type { Category } from '@/types';
import {
  AccessDenied,
  EmptyState,
  ErrorBanner,
  GlassPanel,
  LiquidShell,
  LoadingState,
  PageHeader,
} from '@/components/admin/glass';

const EMPTY_FORM = { name: '', description: '' };

const TagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

/**
 * Convierte un nombre en un slug URL-safe (minúsculas, guiones).
 *
 * @example slugify('Moda & Hogar') // 'moda-hogar'
 */
function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function AdminCategoriesPage() {
  const { user, isAuthenticated, isLoading: roleLoading } = useRequireRole(['admin']);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCategory, setNewCategory] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    (async () => {
      setIsLoading(true);
      try {
        setCategories(await apiClient.get<Category[]>(API_ENDPOINTS.categories.list));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar categorías');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isAuthenticated, user]);

  const closeForm = () => {
    setIsCreating(false);
    setNewCategory(EMPTY_FORM);
  };

  /** Crea la categoría con un slug derivado del nombre y la añade a la lista. */
  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const created = await apiClient.post<Category>(API_ENDPOINTS.categories.create, {
        ...newCategory,
        slug: slugify(newCategory.name),
      });
      setCategories((prev) => [...prev, created]);
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear categoría');
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Elimina una categoría tras confirmación del usuario. */
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;
    setError(null);
    try {
      await apiClient.delete(API_ENDPOINTS.categories.delete(id));
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar categoría');
    }
  };

  if (roleLoading || isLoading) return <LoadingState label="Cargando categorías" />;
  if (!isAuthenticated) return <AccessDenied />;

  return (
    <LiquidShell size="narrow">
      <PageHeader
        eyebrow="Administración"
        title="Categorías"
        backHref="/admin"
        action={
          !isCreating && (
            <button type="button" onClick={() => setIsCreating(true)} className="lg-btn lg-btn--primary">
              <PlusIcon />
              Nueva categoría
            </button>
          )
        }
      />

      <ErrorBanner message={error} />

      {isCreating && (
        <GlassPanel className="lg-glass--accent mb-5" title="Nueva categoría" aside={<span className="lg-muted">Completa los datos</span>}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor="cat-name" className="lg-label">Nombre</label>
              <input
                id="cat-name"
                className="lg-input"
                value={newCategory.name}
                onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Electrónica, Moda, Hogar…"
                required
              />
            </div>
            <div>
              <label htmlFor="cat-desc" className="lg-label">
                Descripción <span className="normal-case tracking-normal">(opcional)</span>
              </label>
              <textarea
                id="cat-desc"
                className="lg-input resize-none"
                rows={3}
                value={newCategory.description}
                onChange={(e) => setNewCategory((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Breve descripción de la categoría…"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={isSubmitting} className="lg-btn lg-btn--primary">
                {isSubmitting ? 'Creando…' : 'Crear categoría'}
              </button>
              <button type="button" onClick={closeForm} className="lg-btn">
                Cancelar
              </button>
            </div>
          </form>
        </GlassPanel>
      )}

      <GlassPanel title="Todas las categorías" flush aside={<span className="lg-badge"><i />{categories.length}</span>}>
        {categories.length === 0 ? (
          <EmptyState icon="🗂️" title="Aún no hay categorías" hint="Crea la primera usando el botón de arriba" />
        ) : (
          categories.map((cat, index) => (
            <div key={cat._id || index} className="lg-row">
              <div className="lg-avatar"><TagIcon /></div>
              <div className="lg-row__main">
                <p className="lg-row__title">{cat.name}</p>
                {cat.description && <p className="lg-row__sub">{cat.description}</p>}
              </div>
              <button
                type="button"
                onClick={() => cat._id && handleDelete(cat._id)}
                className="lg-btn lg-btn--danger lg-btn--sm lg-reveal"
              >
                <TrashIcon />
                Eliminar
              </button>
            </div>
          ))
        )}
      </GlassPanel>
    </LiquidShell>
  );
}