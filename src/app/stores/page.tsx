'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';

interface Store {
  _id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  website: string;
  createdAt: string;
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<'createdAt' | 'name'>('createdAt');
  const [order, setOrder] = useState<'desc' | 'asc'>('desc');
  const limit = 12;

  const fetchStores = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('skip', reset ? '0' : skip.toString());
      params.append('limit', limit.toString());
      params.append('sortBy', sortBy);
      params.append('order', order);
      const response = await fetch(`/api/stores?${params.toString()}`);
      const data = await response.json();
      if (response.ok) {
        if (reset) {
          setStores(data);
        } else {
          setStores((prev) => [...prev, ...data]);
        }
        setHasMore(data.length === limit);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  }, [skip, limit, sortBy, order]);

  // Resetear tiendas al cambiar búsqueda u orden
  useEffect(() => {
    setSkip(0);
    fetchStores(true);
  }, [sortBy, order, fetchStores]);

  // Cargar más tiendas
  const handleLoadMore = () => {
    setSkip((prev) => prev + limit);
  };

  // Cargar más cuando skip cambie (pero no en el primer render)
  useEffect(() => {
    if (skip === 0) return;
    fetchStores();
  }, [skip, fetchStores]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Suspense>
        <MainContent
          stores={stores}
          loading={loading}
          hasMore={hasMore}
          sortBy={sortBy}
          order={order}
          setSortBy={setSortBy}
          setOrder={setOrder}
          handleLoadMore={handleLoadMore}
        />
      </Suspense>
    </div>
  );
}

interface MainContentProps {
  stores: Store[];
  loading: boolean;
  hasMore: boolean;
  sortBy: 'createdAt' | 'name';
  order: 'asc' | 'desc';
  setSortBy: (sortBy: 'createdAt' | 'name') => void;
  setOrder: (order: 'asc' | 'desc') => void;
  handleLoadMore: () => void;
}

function MainContent({ stores, loading, hasMore, sortBy, order, setSortBy, setOrder, handleLoadMore }: MainContentProps) {

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Tiendas</h1>
        <SearchBar basePath="/stores" placeholder="Buscar tiendas..." />
        <div className="mt-4 flex gap-2 items-center">
          <label htmlFor="sort" className="text-sm text-gray-700">Ordenar por:</label>
          <select
            id="sort"
            className="border rounded px-2 py-1 text-sm"
            value={sortBy + '-' + order}
            onChange={e => {
              const [field, ord] = e.target.value.split('-');
              setSortBy(field as 'createdAt' | 'name');
              setOrder(ord as 'asc' | 'desc');
            }}
          >
            <option value="createdAt-desc">Últimas agregadas</option>
            <option value="createdAt-asc">Más antiguas</option>
            <option value="name-asc">A-Z</option>
            <option value="name-desc">Z-A</option>
          </select>
          <Link
            href="/add-store"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Agregar Tienda
          </Link>
        </div>
      </div>
      {loading && stores.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Cargando tiendas...</p>
        </div>
      ) : stores.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tiendas disponibles</h3>
          <p className="text-gray-600 mb-4">Sé el primero en agregar una tienda</p>
          <Link
            href="/add-store"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Agregar Tienda
          </Link>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store: Store) => (
              <div key={store._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{store.name}</h3>
                  {store.description && (
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">{store.description}</p>
                  )}
                  <div className="flex justify-between items-center">
                    <Link
                      href={`/stores/${store._id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Ver detalles →
                    </Link>
                    <span className="text-xs text-gray-500">
                      {new Date(store.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Cargando...' : 'Agregar más'}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
} 