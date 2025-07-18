import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Obtener precios con filtros opcionales
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let query = supabase.from('product_prices').select('*, product:products(*), store:stores(*)');

    // Filtros opcionales
    const productId = searchParams.get('productId');
    if (productId) query = query.eq('productId', productId);
    const storeId = searchParams.get('storeId');
    if (storeId) query = query.eq('storeId', storeId);
    if (searchParams.get('available') === 'true') query = query.eq('isAvailable', true);

    // Paginado y ordenamiento
    const skip = parseInt(searchParams.get('skip') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const sortBy = searchParams.get('sortBy') || 'lastUpdated';
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';
    const validSortFields = ['lastUpdated', 'price'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'lastUpdated';
    query = query.order(sortField, { ascending: order === 'asc' });
    query = query.range(skip, skip + limit - 1);

    const { data: prices, error } = await query;
    if (error) throw error;
    return NextResponse.json(prices);
  } catch (error) {
    console.error('Error fetching prices:', error);
    return NextResponse.json(
      { error: 'Error al obtener los precios' },
      { status: 500 }
    );
  }
}

// POST - Crear o actualizar un precio
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Verificar que el producto y la tienda existen
    const { data: product } = await supabase.from('products').select('id').eq('id', body.productId).single();
    const { data: store } = await supabase.from('stores').select('id').eq('id', body.storeId).single();
    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    if (!store) {
      return NextResponse.json(
        { error: 'Tienda no encontrada' },
        { status: 404 }
      );
    }
    // Buscar si ya existe un precio para este producto en esta tienda
    const { data: existing, error: findError } = await supabase.from('product_prices').select('id').eq('productId', body.productId).eq('storeId', body.storeId).single();
    let result;
    if (existing && !findError) {
      // Actualizar precio existente
      const { data, error } = await supabase.from('product_prices').update({
        ...body,
        lastUpdated: new Date()
      }).eq('id', existing.id).select().single();
      if (error) throw error;
      result = data;
    } else {
      // Crear nuevo precio
      const { data, error } = await supabase.from('product_prices').insert([
        { ...body, lastUpdated: new Date() }
      ]).select().single();
      if (error) throw error;
      result = data;
    }
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating price:', error);
    return NextResponse.json(
      { error: 'Error al crear/actualizar el precio' },
      { status: 500 }
    );
  }
} 