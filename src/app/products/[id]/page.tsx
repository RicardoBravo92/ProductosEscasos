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

interface Price {
  _id: string;
  price: number;
  currency: string;
  isAvailable: boolean;
  stockQuantity: number;
  lastUpdated: string;
  notes: string;
  storeId: Store;
}

interface ComparisonData {
  product: Product;
  prices: Price[];
  stats: {
    totalStores: number;
    availableStores: number;
    unavailableStores: number;
    minPrice: number | null;
    maxPrice: number | null;
    avgPrice: number | null;
  };
}

export default function ProductComparisonPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddPriceForm, setShowAddPriceForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: ''
  });
  const [priceForm, setPriceForm] = useState({
    storeId: '',
    price: '',
    currency: 'USD',
    isAvailable: true,
    notes: ''
  });
  const [stores, setStores] = useState<Store[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    fetchStores();
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/compare/${params.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setData(data);
        setEditForm({
          name: data.product.name,
          description: data.product.description || ''
        });
      } else {
        alert('Error al cargar los datos del producto');
        router.push('/products');
      }
    } catch (error) {
      console.error('Error fetching comparison data:', error);
      alert('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await fetch('/api/stores');
      const storesData = await response.json();
      if (response.ok) {
        setStores(storesData);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditing(true);

    try {
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        setIsEditing(false);
        fetchData(); // Recargar datos
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error al actualizar el producto');
    } finally {
      setEditing(false);
    }
  };

  const handleAddPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: params.id,
          storeId: priceForm.storeId,
          price: parseFloat(priceForm.price),
          currency: priceForm.currency,
          isAvailable: priceForm.isAvailable,
          notes: priceForm.notes
        }),
      });

      if (response.ok) {
        setShowAddPriceForm(false);
        setPriceForm({
          storeId: '',
          price: '',
          currency: 'USD',
          isAvailable: true,
          notes: ''
        });
        fetchData(); // Recargar datos
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error adding price:', error);
      alert('Error al agregar el precio');
    } finally {
      setSubmitting(false);
    }
  };

  function handlePriceClick(price: Price) {
    setPriceForm({
      storeId: price.storeId._id,
      price: price.price.toString(),
      currency: price.currency,
      isAvailable: price.isAvailable,
      notes: price.notes || ""
    });
    setShowAddPriceForm(true);
    // Si quieres modo edición, puedes guardar el id:
    // setEditingPriceId(price._id);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Cargando comparación...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="text-center py-12">
          <p className="text-gray-600">Producto no encontrado</p>
          <Link href="/products" className="text-blue-600 hover:text-blue-800">
            Volver a productos
          </Link>
        </div>
      </div>
    );
  }

  const { product, prices, stats } = data;
  const availablePrices = prices.filter(p => p.isAvailable).sort((a, b) => a.price - b.price);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          {!isEditing ? (
            <>
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                {
               !showAddPriceForm&&
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Editar
                </button>
                }
              </div>
              
              {product.description && (
                <p className="text-gray-700 mb-4">{product.description}</p>
              )}
            </>
          ) : (
            <form onSubmit={handleEditProduct} className="space-y-4">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-gray-900">Editar Producto</h2>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={editing}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {editing ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Pan dulce"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  id="description"
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe el producto..."
                />
              </div>
            </form>
          )}
          
          {
            !isEditing&&
          <button
            onClick={() => setShowAddPriceForm(!showAddPriceForm)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showAddPriceForm  ? 'Cancelar' : 'Agregar Precio'}
            
          </button>
          }
        </div>

        {/* Add Price Form */}
        {showAddPriceForm && !isEditing&&(
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Agregar Precio</h2>
            <form onSubmit={handleAddPrice} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tienda *
                  </label>
                  <select
                    value={priceForm.storeId}
                    onChange={(e) => setPriceForm(prev => ({ ...prev, storeId: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                  >
                    <option value="">Seleccionar tienda</option>
                    {stores.map((store) => (
                      <option key={store._id} value={store._id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={priceForm.price}
                    onChange={(e) => setPriceForm(prev => ({ ...prev, price: e.target.value }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                <label className="flex items-center cursor-pointer">
                  <span className="mr-2 text-sm font-medium text-gray-700">Disponible</span>
                  <span className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input
                      type="checkbox"
                      checked={priceForm.isAvailable}
                      onChange={(e) => setPriceForm(prev => ({ ...prev, isAvailable: e.target.checked }))}
                      className="absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer switch-checkbox"
                      style={{ left: priceForm.isAvailable ? '1.5rem' : '0' }}
                    />
                    <span
                      className={`block overflow-hidden h-6 rounded-full bg-gray-300 transition-colors duration-200 ease-in ${priceForm.isAvailable ? 'bg-green-400' : 'bg-gray-300'}`}
                    ></span>
                  </span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  value={priceForm.notes}
                  onChange={(e) => setPriceForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Información adicional..."
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Guardando...' : 'Guardar Precio'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddPriceForm(false)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Stats */}
        {
!isEditing&&
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Estadísticas</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalStores}</div>
              <div className="text-sm text-gray-600">Total de tiendas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.availableStores}</div>
              <div className="text-sm text-gray-600">Disponible</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.unavailableStores}</div>
              <div className="text-sm text-gray-600">No disponible</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.minPrice ? `${stats.minPrice.toFixed(2)}` : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Precio más bajo</div>
            </div>
          </div>
        </div>
        }

        {/* Prices List */}
        {
!isEditing&&
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Precios por Tienda</h2>
          </div>
          
          {prices.length === 0 ? (
            <div className="p-6 text-center text-gray-600">
              No hay precios registrados para este producto
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {availablePrices.map((price) => (
                <div
                  key={price._id}
                  className="p-6 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handlePriceClick(price)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {price.storeId.name}
                      </h3>
                      {price.storeId.address && (
                        <p className="text-sm text-gray-600 mt-1">{price.storeId.address}</p>
                      )}
                      {price.notes && (
                        <p className="text-sm text-gray-500 mt-1">{price.notes}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        {price.storeId.phone && (
                          <span>📞 {price.storeId.phone}</span>
                        )}
                        {price.storeId.website && (
                          <a
                            href={price.storeId.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            🌐 Visitar sitio
                          </a>
                        )}
                        {price.stockQuantity > 0 && (
                          <span>📦 Stock: {price.stockQuantity}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {price.price.toFixed(2)} {price.currency}
                      </div>
                      <div className="text-sm text-gray-500">
                        Actualizado: {new Date(price.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Unavailable prices */}
              {prices.filter(p => !p.isAvailable).map((price) => (
                <div
                  key={price._id}
                  className="p-6 hover:bg-gray-50 bg-gray-50 cursor-pointer"
                  onClick={() => handlePriceClick(price)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {price.storeId.name}
                      </h3>
                      {price.storeId.address && (
                        <p className="text-sm text-gray-600 mt-1">{price.storeId.address}</p>
                      )}
                      {price.notes && (
                        <p className="text-sm text-gray-500 mt-1">{price.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-red-600">
                        No disponible
                      </div>
                      <div className="text-sm text-gray-500">
                        Último precio: {price.price.toFixed(2)} {price.currency}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(price.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        }
      </main>
    </div>
  );
} 