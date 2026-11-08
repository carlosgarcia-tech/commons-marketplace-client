'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useReviews } from '@/hooks/use-reviews';
import { reviewApi } from '@/lib/api';
import { Button, Textarea, Card, CardContent } from '@/components/ui';
import { FIELD_LIMITS, optionalText, isIntInRange } from '@/lib/validation';

interface ReviewsListProps {
  productId: string;
}

export function ReviewsSection({ productId }: ReviewsListProps) {
  const { reviews, isLoading, error } = useReviews(productId);
  const { isAuthenticated, user } = useAuth();

  if (isLoading) {
    return <p>Cargando reseñas...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-6">
      {reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < review.score ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">Usuario</span>
                </div>
                {review.commentary && (
                  <p className="text-gray-600 text-sm">{review.commentary}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No hay reseñas todavía.</p>
      )}

      {isAuthenticated && user?.role === 'buyer' && (
        <CreateReviewForm productId={productId} />
      )}
    </div>
  );
}

function CreateReviewForm({ productId }: { productId: string }) {
  const { user } = useAuth();
  const [score, setScore] = useState(5);
  const [commentary, setCommentary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldError(null);

    if (!isIntInRange(score, 1, 5)) {
      setFieldError('La puntuación debe ser un número entre 1 y 5');
      return;
    }
    const commentaryError = optionalText(commentary, FIELD_LIMITS.REVIEW_COMMENTARY, 'La reseña');
    if (commentaryError) {
      setFieldError(commentaryError);
      return;
    }
    if (!user?._id) {
      setError('Debes iniciar sesión para enviar una reseña.');
      return;
    }

    setIsSubmitting(true);

    try {
      await reviewApi.create({ userId: user._id, type: 'product', productId, score, commentary });
      setSuccess(true);
      setScore(5);
      setCommentary('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear reseña');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent>
          <p className="text-green-700">¡Gracias por tu reseña!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <h3 className="font-semibold mb-4">Escribir Reseña</h3>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {fieldError && <p className="text-red-500 mb-4">{fieldError}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Puntuación
            </label>
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setScore(i + 1)}
                  className="focus:outline-none"
                >
                  <svg
                    className={`w-8 h-8 ${i < score ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label="Tu reseña (opcional)"
            value={commentary}
            onChange={(e) => setCommentary(e.target.value)}
            placeholder="Cuéntanos tu experiencia..."
            rows={3}
            maxLength={FIELD_LIMITS.REVIEW_COMMENTARY}
          />

          <Button type="submit" isLoading={isSubmitting}>
            Enviar Reseña
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}