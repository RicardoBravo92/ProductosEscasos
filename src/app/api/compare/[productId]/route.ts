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
    
    // Obtener todos los precios para este producto
    const prices = await ProductPrice.find({ productId })
      .populate('storeId', 'name address phone website')
      .sort({ price: 1 }); // Ordenar por precio ascendente
    
    // Calcular estadísticas
    const availablePrices = prices.filter(p => p.isAvailable);
    const unavailablePrices = prices.filter(p => !p.isAvailable);
    
    const stats = {
      totalStores: prices.length,
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