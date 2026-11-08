'use client';
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import { useRequireRole } from '@/hooks/use-auth';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import type { User } from '@/types';
import {
  AccessDenied,
  EmptyState,
  ErrorBanner,
  GlassPanel,
  LiquidShell,
  LoadingState,
  PageHeader,
  SearchInput,
} from '@/components/admin/glass';
import { DonutChart, type ChartDatum } from '@/components/admin/charts';

const DEFAULT_ROLE = 'user';

const ROLE_CONFIG: Record<string, { label: string; color: string }> = {
  admin: { label: 'Admin', color: '#f5a524' },
  seller: { label: 'Vendedor', color: '#22c55e' },
  user: { label: 'Usuario', color: '#94a3b8' },
};

/** Normaliza el rol de un usuario a una clave conocida de `ROLE_CONFIG`. */
const roleKeyOf = (role?: string): string => {
  const key = role?.toLowerCase() ?? DEFAULT_ROLE;
  return key in ROLE_CONFIG ? key : DEFAULT_ROLE;
};

/** Iniciales (máx. 2) a partir del nombre o, si falta, del email. */
function getInitials(name?: string, email?: string): string {
  return (name || email || '?')
    .split(/\s+|@/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('');
}

/** Cuenta usuarios por rol normalizado. */
function countByRole(users: User[]): Record<string, number> {
  return users.reduce<Record<string, number>>((acc, u) => {
    const key = roleKeyOf(u.role);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

/** Insignia con el color del rol; reutilizable como filtro si recibe `onClick`. */
function RoleBadge({ role, children, pressed, onClick }: {
  role?: string;
  children?: ReactNode;
  pressed?: boolean;
  onClick?: () => void;
}) {
  const cfg = ROLE_CONFIG[roleKeyOf(role)];
  const style = { '--badge-color': cfg.color } as CSSProperties;
  const content = children ?? <><i />{cfg.label}</>;
  if (!onClick) return <span className="lg-badge" style={style}>{content}</span>;
  return (
    <button type="button" className="lg-badge lg-badge--filter" style={style} aria-pressed={pressed} onClick={onClick}>
      {content}
    </button>
  );
}

export default function AdminUsersPage() {
  const { user, isAuthenticated, isLoading: roleLoading } = useRequireRole(['admin']);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    (async () => {
      setIsLoading(true);
      try {
        const data = await apiClient.get<User[]>(API_ENDPOINTS.users.list);
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isAuthenticated, user]);

  const roleCounts = useMemo(() => countByRole(users), [users]);

  const chartData: ChartDatum[] = useMemo(
    () => Object.entries(roleCounts).map(([role, value]) => ({ id: role, label: ROLE_CONFIG[role].label, value, color: ROLE_CONFIG[role].color })),
    [roleCounts],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter(
      (u) =>
        (!roleFilter || roleKeyOf(u.role) === roleFilter) &&
        (!query || u.name?.toLowerCase().includes(query) || u.email?.toLowerCase().includes(query)),
    );
  }, [users, search, roleFilter]);

  if (roleLoading || isLoading) return <LoadingState label="Cargando usuarios" />;
  if (!isAuthenticated) return <AccessDenied />;

  return (
    <LiquidShell size="narrow">
      <PageHeader eyebrow="Administración" title="Usuarios" backHref="/admin" />

      <ErrorBanner message={error} />

      {users.length > 0 && (
        <>
          <GlassPanel className="mb-5" title="Usuarios por rol" aside={<span className="lg-muted">clic para filtrar</span>}>
            <DonutChart data={chartData} centerLabel="Usuarios" selectedId={roleFilter} onSelect={setRoleFilter} />
          </GlassPanel>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="lg-muted">{users.length} usuarios</span>
              {Object.entries(roleCounts).map(([role, count]) => (
                <RoleBadge key={role} role={role} pressed={roleFilter === role} onClick={() => setRoleFilter(roleFilter === role ? null : role)}>
                  {count} {ROLE_CONFIG[role].label}{count !== 1 ? 's' : ''}
                </RoleBadge>
              ))}
            </div>
            <div className="sm:ml-auto sm:w-72">
              <SearchInput value={search} onChange={setSearch} placeholder="Buscar nombre o email…" />
            </div>
          </div>
        </>
      )}

      <GlassPanel title="Todos los usuarios" flush aside={<span className="lg-badge"><i />{filtered.length}</span>}>
        {filtered.length === 0 ? (
          <EmptyState icon="👥" title={search || roleFilter ? 'Sin resultados' : 'No hay usuarios'} />
        ) : (
          filtered.map((u) => (
            <div key={u._id} className="lg-row">
              <div className="lg-avatar">{getInitials(u.name, u.email)}</div>
              <div className="lg-row__main">
                <p className="lg-row__title">{u.name || u.email}</p>
                {u.name && <p className="lg-row__sub">{u.email}</p>}
              </div>
              <RoleBadge role={u.role} />
            </div>
          ))
        )}
      </GlassPanel>
    </LiquidShell>
  );
}