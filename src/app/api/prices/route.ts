import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductPrice from '@/lib/models/ProductPrice';
import Product from '@/lib/models/Product';
import Store from '@/lib/models/Store';

// GET - Obtener precios con filtros opcionales
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    
    const query: Record<string, unknown> = {};
    
    // Filtros opcionales
    if (searchParams.get('productId')) {
      query.productId = searchParams.get('productId');
    }
    
    if (searchParams.get('storeId')) {
      query.storeId = searchParams.get('storeId');
    }
    
    if (searchParams.get('available') === 'true') {
      query.isAvailable = true;
    }
    
    // Paginado y ordenamiento
    const skip = parseInt(searchParams.get('skip') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const sortBy = searchParams.get('sortBy') || 'lastUpdated';
    const order = searchParams.get('order') === 'asc' ? 1 : -1;
    let sort: Record<string, 1 | -1> = {};
    if (sortBy === 'productName') {
      sort = { 'productId.name': order };
    } else if (['lastUpdated', 'price'].includes(sortBy)) {
      sort = { [sortBy]: order };
    } else {
      sort = { lastUpdated: -1 };
    }

    const prices = await ProductPrice.find(query)
      .populate('productId', 'name description')
      .populate('storeId', 'name address phone website')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
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
    await connectDB();
    const body = await request.json();
    
    // Verificar que el producto y la tienda existen
    const product = await Product.findById(body.productId);
    const store = await Store.findById(body.storeId);
    
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
    let price = await ProductPrice.findOne({
      productId: body.productId,
      storeId: body.storeId
    });
    
    if (price) {
      // Actualizar precio existente
      price.price = body.price;
      price.currency = body.currency || 'USD';
      price.isAvailable = body.isAvailable !== undefined ? body.isAvailable : true;
      price.stockQuantity = body.stockQuantity || 0;
      price.notes = body.notes;
      price.lastUpdated = new Date();
    } else {
      // Crear nuevo precio
      price = new ProductPrice({
        ...body,
        lastUpdated: new Date()
      });
    }
    
    await price.save();
    
    // Poblar los datos del producto y tienda para la respuesta
    await price.populate('productId', 'name description');
    await price.populate('storeId', 'name address phone website');
    
    return NextResponse.json(price, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating price:', error);
    return NextResponse.json(
      { error: 'Error al crear/actualizar el precio' },
      { status: 500 }
    );
  }
} 