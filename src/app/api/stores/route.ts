import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Store from '@/lib/models/Store';

// GET - Obtener todas las tiendas
export async function GET() {
  try {
    await connectDB();
    const stores = await Store.find({}).sort({ createdAt: -1 });
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