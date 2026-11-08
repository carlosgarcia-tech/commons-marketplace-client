'use client';
import { useEffect, useState, type CSSProperties, type ComponentType } from 'react';
import Link from 'next/link';
import { useRequireRole } from '@/hooks/use-auth';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import { Badge } from '@/components/ui';
import type { AdminStats, StoreSummary, UserSummary } from '@/types/api';
import {
  AccessDenied,
  EmptyState,
  ErrorBanner,
  GlassPanel,
  LiquidShell,
  LoadingState,
  PageHeader,
} from '@/components/admin/glass';
import { AnimatedNumber, DonutChart, SLATE_PALETTE, type ChartDatum } from '@/components/admin/charts';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  CheckIcon,
  HourglassIcon,
  InboxIcon,
  LayersIcon,
  PackageIcon,
  StarIcon,
  StoreIcon,
  UsersIcon,
  XIcon,
} from '@/components/admin/icons';

type StoreDecision = 'Approved' | 'Rejected';

type IconComponent = ComponentType<{ size?: number }>;

interface StatConfig {
  key: keyof AdminStats;
  label: string;
  icon: IconComponent;
  /** Color del icono y de su resplandor. */
  tint: string;
  /** Si es `true`, el valor se resalta en ámbar cuando es mayor que 0. */
  alert?: boolean;
}

const STATS: ReadonlyArray<StatConfig> = [
  { key: 'totalUsers', label: 'Usuarios', icon: UsersIcon, tint: '#93c5fd' },
  { key: 'totalStores', label: 'Tiendas', icon: StoreIcon, tint: '#c4b5fd' },
  { key: 'totalProducts', label: 'Productos', icon: PackageIcon, tint: '#6ee7b7' },
  { key: 'totalReviews', label: 'Reseñas', icon: StarIcon, tint: '#fcd34d' },
  { key: 'pendingStores', label: 'Tiendas pendientes', icon: HourglassIcon, tint: '#f5a524', alert: true },
  { key: 'pendingSellerRequests', label: 'Solicitudes', icon: InboxIcon, tint: '#fb7185', alert: true },
];

const QUICK_ACTIONS: ReadonlyArray<{ href: string; label: string; desc: string; icon: IconComponent; tint: string }> = [
  { href: '/admin/categories', label: 'Gestionar Categorías', desc: 'Crear, editar y eliminar categorías', icon: LayersIcon, tint: '#c4b5fd' },
  { href: '/admin/products', label: 'Gestionar Productos', desc: 'Ver, editar y eliminar productos', icon: PackageIcon, tint: '#6ee7b7' },
  { href: '/admin/users', label: 'Gestionar Usuarios', desc: 'Ver y administrar cuentas de usuario', icon: UsersIcon, tint: '#93c5fd' },
];

/** Devuelve el estilo que fija el color (`--tint`) de un chip o tarjeta. */
const tintStyle = (tint: string): CSSProperties => ({ '--tint': tint }) as CSSProperties;

const COLOR_APPROVED = '#22c55e';
const COLOR_PENDING = '#f5a524';
const PRODUCTS_PAGE_LIMIT_URL = '/api/v1/products?page=1&limit=1000';

/**
 * Obtiene las estadísticas del panel. Si el endpoint dedicado falla, las
 * reconstruye contando usuarios, tiendas y productos por separado.
 *
 * @returns Estadísticas globales de la plataforma.
 * @throws Si también falla el cálculo de respaldo.
 */
async function fetchAdminStats(): Promise<AdminStats> {
  try {
    return await apiClient.get<AdminStats>(API_ENDPOINTS.admin.stats);
  } catch {
    const [users, stores, products] = await Promise.all([
      apiClient.get<UserSummary[]>(API_ENDPOINTS.users.list, {}),
      apiClient.get<StoreSummary[]>(API_ENDPOINTS.stores.list),
      apiClient.get<StoreSummary[] | { data?: StoreSummary[]; products?: StoreSummary[] }>(PRODUCTS_PAGE_LIMIT_URL),
    ]);
    const productList = Array.isArray(products) ? products : products.data || products.products || [];
    return {
      totalUsers: users.length,
      totalStores: stores.length,
      totalProducts: productList.length,
      totalReviews: 0,
      pendingStores: stores.filter((s) => (s.status || '') === 'Pending').length,
      pendingSellerRequests: 0,
    };
  }
}

/**
 * Datos de la dona «Composición»: cuántos usuarios, tiendas, productos y
 * reseñas hay en la plataforma.
 */
function buildCompositionData(stats: AdminStats): ChartDatum[] {
  return [
    { id: 'users', label: 'Usuarios', value: stats.totalUsers },
    { id: 'stores', label: 'Tiendas', value: stats.totalStores },
    { id: 'products', label: 'Productos', value: stats.totalProducts },
    { id: 'reviews', label: 'Reseñas', value: stats.totalReviews },
  ].map((datum, i) => ({ ...datum, color: SLATE_PALETTE[i] }));
}

/** Datos de la dona «Estado de tiendas»: aprobadas frente a pendientes. */
function buildStoreStatusData(stats: AdminStats): ChartDatum[] {
  const approved = Math.max(stats.totalStores - stats.pendingStores, 0);
  return [
    { id: 'approved', label: 'Activas', value: approved, color: COLOR_APPROVED },
    { id: 'pending', label: 'Pendientes', value: stats.pendingStores, color: COLOR_PENDING },
  ];
}

export default function AdminPage() {
  const { user, isAuthenticated, isLoading: roleLoading } = useRequireRole(['admin']);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingStores, setPendingStores] = useState<StoreSummary[]>([]);
  const [compositionId, setCompositionId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [statsData, pendingData] = await Promise.all([
          fetchAdminStats(),
          apiClient.get<StoreSummary[]>(API_ENDPOINTS.stores.pending).catch(() => [] as StoreSummary[]),
        ]);
        setStats(statsData);
        setPendingStores(pendingData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isAuthenticated, user]);

  /** Aprueba o rechaza una tienda y la saca de la lista de pendientes. */
  const handleStoreStatus = async (storeId: string, status: StoreDecision) => {
    setError(null);
    try {
      await apiClient.patch(API_ENDPOINTS.stores.updateStatus(storeId), { status });
      setPendingStores((prev) => prev.filter((s) => s._id !== storeId));
      setStats((prev) => (prev ? { ...prev, pendingStores: Math.max(prev.pendingStores - 1, 0) } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la tienda');
    }
  };

  if (roleLoading || isLoading) return <LoadingState label="Cargando panel" />;
  if (!isAuthenticated) return <AccessDenied />;

  return (
    <LiquidShell>
      <PageHeader
        eyebrow="Panel de control"
        title="Dashboard Admin"
        action={
          <div className="lg-glass lg-user">
            <span className="lg-dot" />
            {user?.name || user?.email}
          </div>
        }
      />

      <ErrorBanner message={error} />

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-5">
          {STATS.map(({ key, label, icon: Icon, tint, alert }) => {
            const value = Number(stats[key] ?? 0);
            return (
              <div key={key} className="lg-glass lg-glass--lift lg-kpi" style={tintStyle(tint)}>
                <div className="lg-chip">
                  <Icon size={22} />
                </div>
                <p className={`lg-kpi__value ${alert && value > 0 ? 'lg-kpi__value--alert' : ''}`}>
                  <AnimatedNumber value={value} />
                </p>
                <p className="lg-kpi__label">{label}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">
        <GlassPanel
          className="lg:col-span-3"
          title="Tiendas pendientes"
          flush
          aside={pendingStores.length > 0 && <Badge variant="warning">{pendingStores.length}</Badge>}
        >
          {pendingStores.length === 0 ? (
            <EmptyState
              icon={
                <span className="lg-chip lg-chip--lg" style={tintStyle('#22c55e')}>
                  <CheckCircleIcon size={32} />
                </span>
              }
              title="Todo al día"
            />
          ) : (
            pendingStores.map((store) => (
              <div key={store._id} className="lg-row">
                <div className="lg-avatar">{store.storeName?.[0]?.toUpperCase() ?? <StoreIcon size={18} />}</div>
                <div className="lg-row__main">
                  <p className="lg-row__title">{store.storeName}</p>
                  {store.description && <p className="lg-row__sub">{store.description}</p>}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button type="button" onClick={() => handleStoreStatus(store._id, 'Approved')} className="lg-btn lg-btn--ok lg-btn--sm">
                    <CheckIcon size={14} strokeWidth={2.3} /> Aprobar
                  </button>
                  <button type="button" onClick={() => handleStoreStatus(store._id, 'Rejected')} className="lg-btn lg-btn--danger lg-btn--sm">
                    <XIcon size={14} strokeWidth={2.3} /> Rechazar
                  </button>
                </div>
              </div>
            ))
          )}
        </GlassPanel>

        <GlassPanel className="lg:col-span-2" title="Acciones rápidas">
          {QUICK_ACTIONS.map(({ href, label, desc, icon: Icon, tint }) => (
            <Link key={href} href={href} className="lg-action">
              <span className="lg-chip lg-chip--sm" style={tintStyle(tint)}>
                <Icon size={19} />
              </span>
              <span className="min-w-0">
                <p className="lg-row__title">{label}</p>
                <p className="lg-row__sub">{desc}</p>
              </span>
              <ArrowRightIcon className="lg-action__go" size={18} />
            </Link>
          ))}
        </GlassPanel>
      </div>

      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <GlassPanel className="lg:col-span-3" title="Composición" aside={<span className="lg-muted">clic para fijar</span>}>
            <DonutChart
              data={buildCompositionData(stats)}
              centerLabel="Registros"
              selectedId={compositionId}
              onSelect={setCompositionId}
            />
          </GlassPanel>
          <GlassPanel className="lg:col-span-2" title="Estado de tiendas">
            <DonutChart data={buildStoreStatusData(stats)} centerLabel="Tiendas" />
          </GlassPanel>
        </div>
      )}
    </LiquidShell>
  );
}
