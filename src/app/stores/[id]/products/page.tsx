'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [products, setProducts] = useState<ProductPrice[]>([]);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  const storeId = params.id as string;

  useEffect(() => {
    if (storeId) {
      fetchStoreAndProducts();
    }
  }, [storeId]);

  const fetchStoreAndProducts = async () => {
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
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching store and products:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

      // Filter products based on search term and availability
    const filteredProducts = products.filter((productPrice) => {
      const product = productPrice.productId;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesAvailability = availabilityFilter === 'all' || 
                                 (availabilityFilter === 'available' && productPrice.isAvailable) ||
                                 (availabilityFilter === 'unavailable' && !productPrice.isAvailable);
      
      return matchesSearch && matchesAvailability;
    });

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Productos en {store.name}</h1>
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
                {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
            <p className="text-gray-600">
              {products.length === 0 
                ? 'Esta tienda no tiene productos registrados aún.'
                : 'No hay productos que coincidan con los filtros aplicados.'
              }
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((productPrice) => {
              const product = productPrice.productId;
              return (
                              <div key={productPrice._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Product Info */}
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      <Link 
                        href={`/products/${product._id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {product.name}
                      </Link>
                    </h3>
                    
                    {product.description && (
                      <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                        {product.description}
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
                          "{productPrice.notes}"
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-500 mt-2">
                        Actualizado: {new Date(productPrice.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
} 