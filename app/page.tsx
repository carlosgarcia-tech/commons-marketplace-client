import Link from 'next/link';
import type { Metadata } from 'next';
import { getProducts } from '@/lib/api/server-products';
import { getStores } from '@/lib/api/server-stores';
import { ProductCard } from './products/product-card';
import { Button } from '@/components/ui';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Commons Marketplace | Tu Marketplace Local',
  description: 'Descubre productos únicos de vendedores locales. Compra y vende en tu comunidad.',
  openGraph: {
    title: 'Commons Marketplace | Tu Marketplace Local',
    description: 'Descubre productos únicos de vendedores locales. Compra y vende en tu comunidad.',
  },
  twitter: {
    card: 'summary',
    title: 'Commons Marketplace | Tu Marketplace Local',
    description: 'Descubre productos únicos de vendedores locales.',
  },
};

export default async function HomePage() {
  const [featured, stores] = await Promise.all([
    getProducts({ limit: 4 }),
    getStores('Approved'),
  ]);
  const visibleStores = stores.slice(0, 6);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {/* Hero — centered, max-w-4xl (design_system.md §6) */}
      <section className="py-24 sm:py-32 text-center max-w-4xl mx-auto stagger-child">
        <p className="text-xs font-medium text-[var(--text-secondary)] tracking-[0.15em] uppercase mb-6">
          vendedores locales, productos reales
        </p>
        <h1 className="headline-gradient text-5xl md:text-7xl font-extrabold">
          Tu comunidad,
          <br />
          abierta las 24 horas
        </h1>
        <p className="text-base md:text-lg font-light text-[var(--text-secondary)] max-w-xl mx-auto mt-7 leading-relaxed">
          Descubre lo único que se fabrica en tu ciudad: artesanal, directo, sin intermediarios.
        </p>
        <div className="flex justify-center gap-4 mt-10">
          <Link href="/products" className="group">
            <Button size="lg">
              Explorar productos
              <span
                aria-hidden
                className="transition-transform duration-200 group-hover:translate-x-1"
              >
                →
              </span>
            </Button>
          </Link>
          <Link href="/stores">
            <Button size="lg" variant="outline">Ver tiendas</Button>
          </Link>
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="pb-20">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="h2 text-2xl md:text-3xl">Recién llegados</h2>
              <p className="text-sm font-light text-[var(--text-secondary)] mt-1">
                Lo más nuevo de los vendedores de tu comunidad
              </p>
            </div>
            <Link
              href="/products"
              className="text-xs font-medium text-[var(--primary)] hover:text-[var(--text-highlight)] hover:bg-white/[0.06] px-3 py-2 rounded-xl transition-colors"
            >
              Ver todo
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-child">
            {featured.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Stores strip */}
      <section className="pb-20">
        <div className="glass panel w-full px-6 py-5 flex flex-wrap items-center gap-4 stagger-child">
          {visibleStores.length === 0 ? (
            <p className="text-sm font-light text-[var(--text-secondary)] pr-2 italic">
              Sé la primera tienda en abrir…
            </p>
          ) : (
            visibleStores.map((store) => (
              <Link
                key={store._id || store.id}
                href={`/stores/${store.slug || store._id || store.id}`}
                className="glass-chip press rounded-full pl-2 pr-4 py-1.5 flex items-center gap-2 hover:border-white/20 transition-colors"
              >
                {store.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={store.logo} alt="" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <span
                    className="w-6 h-6 rounded-full grid place-items-center text-[11px] font-medium text-[#0b0d11] bg-[var(--primary)]"
                    aria-hidden
                  >
                    {(store.storeName || '?').charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="text-xs font-medium text-[var(--text-secondary)]">{store.storeName}</span>
              </Link>
            ))
          )}
          <Link
            href="/stores"
            className="group ml-auto text-xs font-medium text-[var(--primary)] hover:text-[var(--text-highlight)] hover:bg-white/[0.06] px-3 py-2 rounded-xl transition-colors flex items-center gap-1"
          >
            Todas las tiendas
            <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>

      {/* Seller CTA */}
      <section className="pb-24">
        <div className="glass panel px-8 py-14 text-center max-w-4xl mx-auto stagger-child">
          <h2 className="headline-gradient text-3xl md:text-4xl font-extrabold">
            ¿Haces algo que otros querrían?
          </h2>
          <p className="text-sm font-light text-[var(--text-secondary)] mt-4 max-w-md mx-auto leading-relaxed">
            Abre tu tienda en minutos, publica lo que haces y habla directo con quienes compran — sin intermediarios.
          </p>
          <Link href="/register" className="group inline-block mt-9">
            <Button size="lg">
              Crear cuenta de vendedor
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
