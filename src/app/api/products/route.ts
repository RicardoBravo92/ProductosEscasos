import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

// GET - Obtener todos los productos con filtros opcionales
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    
    const query: Record<string, unknown> = {};
    
    // Filtros opcionales
    if (searchParams.get('search')) {
      query.$or = [
        { name: { $regex: searchParams.get('search'), $options: 'i' } },
        { description: { $regex: searchParams.get('search'), $options: 'i' } }
      ];
    }
    
    // Paginado y ordenamiento
    const skip = parseInt(searchParams.get('skip') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') === 'asc' ? 1 : -1;

    // Validar sortBy
    const validSortFields = ['createdAt', 'name'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const products = await Product.find(query)
      .sort({ [sortField]: order })
      .skip(skip)
      .limit(limit);
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
    await connectDB();
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

    const product = new Product(body);
    await product.save();
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Error al crear el producto' },
      { status: 500 }
    );
  }
} 