import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Store from '@/lib/models/Store';

// GET - Obtener todas las tiendas
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    // Paginado y ordenamiento
    const skip = parseInt(searchParams.get('skip') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') === 'asc' ? 1 : -1;
    const validSortFields = ['createdAt', 'name'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    // Filtro de búsqueda opcional
    const query: Record<string, unknown> = {};
    if (searchParams.get('search')) {
      query.$or = [
        { name: { $regex: searchParams.get('search'), $options: 'i' } },
        { description: { $regex: searchParams.get('search'), $options: 'i' } }
      ];
    }

    const stores = await Store.find(query)
      .sort({ [sortField]: order })
      .skip(skip)
      .limit(limit);
    return NextResponse.json(stores);
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json(
      { error: 'Error al obtener las tiendas' },
      { status: 500 }
    );
  }
}

// POST - Crear una nueva tienda
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    
    const store = new Store(body);
    await store.save();
    
    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    console.error('Error creating store:', error);
    return NextResponse.json(
      { error: 'Error al crear la tienda' },
      { status: 500 }
    );
  }
} 