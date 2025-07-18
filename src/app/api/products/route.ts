import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

// GET - Obtener todos los productos con filtros opcionales
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let query = supabase.from('products').select('*');

    // Filtros opcionales
    const search = searchParams.get('search');
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    // Paginado y ordenamiento
    const skip = parseInt(searchParams.get('skip') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';
    const validSortFields = ['createdAt', 'name'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    query = query.order(sortField, { ascending: order === 'asc' });
    query = query.range(skip, skip + limit - 1);

    const { data: products, error } = await query;
    if (error) throw error;
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Error al obtener los productos' },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo producto
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body: Record<string, unknown> = {};
    let imageBuffer: Buffer | null = null;

    if (contentType.includes('multipart/form-data')) {
      // Usar formData API experimental de Next.js
      const formData = await request.formData();
      body.name = formData.get('name')?.toString() || '';
      body.description = formData.get('description')?.toString() || '';
      const imageFile = formData.get('image');
      if (imageFile && typeof imageFile === 'object' && 'arrayBuffer' in imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
      }
    } else {
      body = await request.json();
    }

    if (imageBuffer) {
      const uploadResult = await uploadImageToCloudinary(imageBuffer);
      body.image = uploadResult.secure_url;
    }

    // Insertar producto en Supabase
    const { data, error } = await supabase.from('products').insert([body]).select().single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Error al crear el producto' },
      { status: 500 }
    );
  }
} 