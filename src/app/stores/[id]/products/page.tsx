'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';

interface Product {
  _id: string;
  name: string;
  description: string;
}

interface Store {
  _id: string;
  name: string;
  address: string;
  phone: string;
  website: string;
}

interface ProductPrice {
  _id: string;
  productId: Product;
  storeId: Store;
  price: number;
  currency: string;
  isAvailable: boolean;
  stockQuantity: number;
  lastUpdated: string;
  notes: string;
}

export default function StoreProductsPage() {
  const params = useParams();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  // Estado para paginado
  const [skip, setSkip] = useState(0);
  const [limit] = useState(12);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [paginatedProducts, setPaginatedProducts] = useState<ProductPrice[]>([]);

  const [copied, setCopied] = useState(false);
  const shareTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      if (shareTimeout.current) clearTimeout(shareTimeout.current);
      shareTimeout.current = setTimeout(() => setCopied(false), 2000);
    });
  };

  const storeId = params.id as string;

  const fetchStoreAndProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch store details
      const storeResponse = await fetch(`/api/stores/${storeId}`);
      if (!storeResponse.ok) {
        throw new Error('Tienda no encontrada');
      }
      const storeData = await storeResponse.json();
      setStore(storeData);

      // Fetch products for this store
      const productsResponse = await fetch(`/api/prices?storeId=${storeId}`);
      if (!productsResponse.ok) {
        throw new Error('Error al cargar los productos');
      }
      const productsData = await productsResponse.json();
      setPaginatedProducts(productsData);
    } catch (error) {
      console.error('Error fetching store and products:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  // Fetch paginado de productos
  const fetchPaginatedProducts = useCallback(async (reset = false) => {
    if (!storeId) return;
    if (reset) setLoading(true);
    else setLoadingMore(true);
    try {
      const params = new URLSearchParams();
      params.append('storeId', storeId);
      params.append('skip', reset ? '0' : skip.toString());
      params.append('limit', limit.toString());
      const response = await fetch(`/api/prices?${params.toString()}`);
      const data = await response.json();
      if (response.ok) {
        if (reset) {
          setPaginatedProducts(data);
        } else {
          setPaginatedProducts((prev) => [...prev, ...data]);
        }
        setHasMore(data.length === limit);
      }
    } catch (error) {
      console.error('Error fetching paginated products:', error);
    } finally {
      if (reset) setLoading(false);
      else setLoadingMore(false);
    }
  }, [storeId, skip, limit]);

  // Resetear productos al cambiar búsqueda o filtro
  useEffect(() => {
    setSkip(0);
    fetchPaginatedProducts(true);
  }, [storeId, searchTerm, availabilityFilter, fetchPaginatedProducts]);

  // Cargar más productos
  const handleLoadMore = () => {
    setSkip((prev) => prev + limit);
  };

  // Cargar más cuando skip cambie (pero no en el primer render)
  useEffect(() => {
    if (skip === 0) return;
    fetchPaginatedProducts();
  }, [skip, fetchPaginatedProducts]);

  useEffect(() => {
    if (storeId) {
      fetchStoreAndProducts();
    }
  }, [storeId, fetchStoreAndProducts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Cargando productos...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-red-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error || 'Tienda no encontrada'}</p>
            <Link
              href="/stores"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver a Tiendas
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href="/stores" className="text-blue-600 hover:text-blue-800">
                  Tiendas
                </Link>
              </li>
              <li>
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li>
                <Link href={`/stores/${storeId}`} className="text-blue-600 hover:text-blue-800">
                  {store.name}
                </Link>
              </li>
              <li>
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </li>
              <li className="text-gray-500">Productos</li>
            </ol>
          </nav>
        </div>

        {/* Store Info Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                Productos en {store.name}
                <button
                  onClick={handleShare}
                  title="Compartir enlace"
                  className="ml-2 p-2 rounded-full bg-gray-100 hover:bg-blue-100 border border-gray-200 transition-colors flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 15l-6-6m0 0l6-6m-6 6h12" />
                  </svg>
                  <span className="hidden sm:inline text-blue-600 text-xs">Compartir</span>
                </button>
                {copied && <span className="ml-2 text-green-600 text-sm">¡Enlace copiado!</span>}
              </h1>
              <div className="space-y-1 text-gray-600">
                {store.address && (
                  <p className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {store.address}
                  </p>
                )}
                {store.phone && (
                  <p className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {store.phone}
                  </p>
                )}
              </div>
            </div>
            <Link
              href={`/stores/${storeId}`}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Ver Tienda
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar productos
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nombre o descripción..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Availability Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Disponibilidad
              </label>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              >
                <option value="all">Todos</option>
                <option value="available">Disponibles</option>
                <option value="unavailable">No disponibles</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                {paginatedProducts.length} producto{paginatedProducts.length !== 1 ? 's' : ''} encontrado{paginatedProducts.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {paginatedProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
            <p className="text-gray-600">
              Prueba con otro término de búsqueda o filtro.
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedProducts
                .filter((productPrice) => {
                  const product = productPrice.productId;
                  const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    product.description?.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesAvailability = availabilityFilter === 'all' ||
                    (availabilityFilter === 'available' && productPrice.isAvailable) ||
                    (availabilityFilter === 'unavailable' && !productPrice.isAvailable);
                  return matchesSearch && matchesAvailability;
                })
                .map((productPrice) => (
                  <div key={productPrice._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      {/* Product Info */}
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          <Link 
                            href={`/products/${productPrice.productId._id}`}
                            className="hover:text-blue-600 transition-colors"
                          >
                            {productPrice.productId.name}
                          </Link>
                        </h3>
                        
                        {productPrice.productId.description && (
                          <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                            {productPrice.productId.description}
                          </p>
                        )}
                      </div>

                        {/* Price and Availability */}
                        <div className="border-t border-gray-200 pt-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-2xl font-bold text-gray-900">
                              ${productPrice.price.toFixed(2)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              productPrice.isAvailable 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {productPrice.isAvailable ? 'Disponible' : 'No disponible'}
                            </span>
                          </div>
                          
                          {productPrice.stockQuantity > 0 && (
                            <p className="text-sm text-gray-600 mb-2">
                              Stock: {productPrice.stockQuantity} unidades
                            </p>
                          )}
                          
                          {productPrice.notes && (
                            <p className="text-sm text-gray-600 italic">
                              &quot;{productPrice.notes}&quot;
                            </p>
                          )}
                          
                          <p className="text-xs text-gray-500 mt-2">
                            Actualizado: {new Date(productPrice.lastUpdated).toLocaleDateString()}
                          </p>
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
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Cargando...' : 'Agregar más'}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
} 