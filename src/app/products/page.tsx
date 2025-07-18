'use client';

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

interface Product {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Suspense>
        <MainContent />
      </Suspense>
    </div>
  );
}

function MainContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<'createdAt' | 'name'>('createdAt');
  const [order, setOrder] = useState<'desc' | 'asc'>('desc');
  const limit = 12;

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const fetchProducts = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('skip', reset ? '0' : skip.toString());
      params.append('limit', limit.toString());
      params.append('sortBy', sortBy);
      params.append('order', order);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        if (reset) {
          setProducts(data);
        } else {
          setProducts((prev) => [...prev, ...data]);
        }
        setHasMore(data.length === limit);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, skip, sortBy, order]);

  // Resetear productos al cambiar búsqueda u orden
  useEffect(() => {
    setSkip(0);
    fetchProducts(true);
  }, [searchQuery, sortBy, order, fetchProducts]);

  // Cargar más productos
  const handleLoadMore = () => {
    setSkip((prev) => prev + limit);
  };

  // Cargar más cuando skip cambie (pero no en el primer render)
  useEffect(() => {
    if (skip === 0) return;
    fetchProducts();
  }, [skip, fetchProducts]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Productos</h1>
        <SearchBar />
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
            <option value="createdAt-desc">Últimos agregados</option>
            <option value="createdAt-asc">Más antiguos</option>
            <option value="name-asc">A-Z</option>
            <option value="name-desc">Z-A</option>
          </select>
        </div>
      </div>
      {/* Lista de productos */}
      {loading && products.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Cargando productos...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery ? `No hay productos que coincidan con "${searchQuery}"` : 'No hay productos disponibles'}
          </p>
          <Link
            href="/add-product"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Agregar Producto
          </Link>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                  {product.description && (
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">{product.description}</p>
                  )}
                  <div className="flex justify-between items-center">
                    <Link
                      href={`/products/${product._id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Ver precios →
                    </Link>
                    <span className="text-xs text-gray-500">
                      {new Date(product.createdAt).toLocaleDateString()}
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