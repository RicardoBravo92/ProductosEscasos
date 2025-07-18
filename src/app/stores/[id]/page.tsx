'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';

interface Store {
  _id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  website: string;
  createdAt: string;
  updatedAt: string;
}

export default function StoreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Store>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const storeId = params.id as string;

  const fetchStore = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stores/${params.id}`);
      const data = await response.json();
      if (response.ok) {
        setStore(data);
      } else {
        alert('Error al cargar la tienda');
        router.push('/stores');
      }
    } catch (error) {
      console.error('Error fetching store:', error);
      alert('Error al cargar la tienda');
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchStore();
  }, [fetchStore]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(`/api/stores/${storeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const updatedStore = await response.json();
        setStore(updatedStore);
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al actualizar la tienda');
      }
    } catch (error) {
      console.error('Error updating store:', error);
      setError('Error al actualizar la tienda');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!store) return;
    
    if (!confirm(`¿Estás seguro de que quieres eliminar la tienda "${store.name}"?\n\nEsta acción también eliminará todos los precios de productos asociados a esta tienda.\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    try {
      setDeleting(true);
      const response = await fetch(`/api/stores/${storeId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/stores');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al eliminar la tienda');
      }
    } catch (error) {
      console.error('Error deleting store:', error);
      setError('Error al eliminar la tienda');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Cargando tienda...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/stores"
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
          >
            ← Volver a Tiendas
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="text-3xl font-bold text-gray-900 border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                  placeholder="Nombre de la tienda"
                />
              ) : (
                <h1 className="text-3xl font-bold text-gray-900">{store.name}</h1>
              )}
            </div>
            
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm({
                        name: store.name,
                        description: store.description,
                        address: store.address,
                        phone: store.phone,
                        website: store.website
                      });
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deleting ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Descripción */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
              {isEditing ? (
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  rows={3}
                  placeholder="Descripción de la tienda"
                />
              ) : (
                <p className="text-gray-700">
                  {store.description || 'Sin descripción disponible'}
                </p>
              )}
            </div>

            {/* Información de contacto */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Dirección */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Dirección
                </h3>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.address || ''}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Dirección de la tienda"
                  />
                ) : (
                  <p className="text-gray-700">
                    {store.address || 'Dirección no disponible'}
                  </p>
                )}
              </div>

              {/* Teléfono */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Teléfono
                </h3>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Número de teléfono"
                  />
                ) : (
                  <p className="text-gray-700">
                    {store.phone || 'Teléfono no disponible'}
                  </p>
                )}
              </div>
            </div>

            {/* Sitio web */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
                Sitio Web
              </h3>
              {isEditing ? (
                <input
                  type="url"
                  value={editForm.website || ''}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="https://ejemplo.com"
                />
              ) : store.website ? (
                <a 
                  href={store.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {store.website}
                </a>
              ) : (
                <p className="text-gray-700">Sitio web no disponible</p>
              )}
            </div>

            {/* Fechas */}
            <div className="pt-6 border-t border-gray-200">
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Creada:</span> {new Date(store.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Actualizada:</span> {new Date(store.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Ver Productos */}
            <div className="pt-6 border-t border-gray-200">
              <Link
                href={`/stores/${storeId}/products`}
                className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Ver Productos de esta Tienda
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 