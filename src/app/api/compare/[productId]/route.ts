import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Comparar precios de un producto en todas las tiendas
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    // Verificar que el producto existe
    const { data: product, error: errorProduct } = await supabase.from('products').select('*').eq('id', productId).single();
    if (errorProduct || !product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    // Leer parámetros de paginado y ordenamiento
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const sortBy = searchParams.get('sortBy') || 'price';
    const order = searchParams.get('order') === 'desc' ? 'desc' : 'asc';
    const isAvailable = searchParams.get('isAvailable');

    // Construir query
    let query = supabase.from('product_prices').select('*, store:stores(*)').eq('productId', productId);
    if (isAvailable === 'true') query = query.eq('isAvailable', true);
    if (isAvailable === 'false') query = query.eq('isAvailable', false);
    // Ordenamiento
    const validSortFields = ['price', 'lastUpdated'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'price';
    query = query.order(sortField, { ascending: order === 'asc' });
    query = query.range(skip, skip + limit - 1);
    // Obtener precios paginados y ordenados
    const { data: prices, error } = await query;
    if (error) throw error;
    // Calcular estadísticas (sin paginar)
    const { data: allPrices } = await supabase.from('product_prices').select('*').eq('productId', productId);
    const availablePrices = (allPrices || []).filter(p => p.isAvailable);
    const unavailablePrices = (allPrices || []).filter(p => !p.isAvailable);
    const stats = {
      totalStores: (allPrices || []).length,
      availableStores: availablePrices.length,
      unavailableStores: unavailablePrices.length,
      minPrice: availablePrices.length > 0 ? Math.min(...availablePrices.map(p => p.price)) : null,
      maxPrice: availablePrices.length > 0 ? Math.max(...availablePrices.map(p => p.price)) : null,
      avgPrice: availablePrices.length > 0 
        ? availablePrices.reduce((sum, p) => sum + p.price, 0) / availablePrices.length 
        : null
    };
    return NextResponse.json({
      product,
      prices,
      stats
    });
  } catch (error) {
    console.error('Error comparing prices:', error);
    return NextResponse.json(
      { error: 'Error al comparar precios' },
      { status: 500 }
    );
  }
} 