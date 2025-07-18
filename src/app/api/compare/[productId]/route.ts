import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductPrice from '@/lib/models/ProductPrice';
import Product from '@/lib/models/Product';

// GET - Comparar precios de un producto en todas las tiendas
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    await connectDB();
    
    // Await params before using its properties
    const { productId } = await params;
    
    // Verificar que el producto existe
    const product = await Product.findById(productId);
    if (!product) {
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
    const order = searchParams.get('order') === 'desc' ? -1 : 1;
    const isAvailable = searchParams.get('isAvailable');

    // Construir query
    const query: Record<string, unknown> = { productId };
    if (isAvailable === 'true') query.isAvailable = true;
    if (isAvailable === 'false') query.isAvailable = false;

    // Construir sort
    let sort: Record<string, 1 | -1> = {};
    if (sortBy === 'storeName') {
      sort = { 'storeId.name': order };
    } else if (['price', 'lastUpdated'].includes(sortBy)) {
      sort = { [sortBy]: order };
    } else {
      sort = { price: 1 };
    }

    // Obtener precios paginados y ordenados
    const prices = await ProductPrice.find(query)
      .populate('storeId', 'name address phone website')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Calcular estadísticas (sin paginar)
    const allPrices = await ProductPrice.find({ productId }).populate('storeId', 'name address phone website');
    const availablePrices = allPrices.filter(p => p.isAvailable);
    const unavailablePrices = allPrices.filter(p => !p.isAvailable);

    const stats = {
      totalStores: allPrices.length,
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