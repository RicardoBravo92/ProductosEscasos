import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Store from '@/lib/models/Store';
import ProductPrice from '@/lib/models/ProductPrice';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

// GET - Obtener una tienda específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const store = await Store.findById(id);
    
    if (!store) {
      return NextResponse.json(
        { error: 'Tienda no encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(store);
  } catch (error) {
    console.error('Error fetching store:', error);
    return NextResponse.json(
      { error: 'Error al obtener la tienda' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar una tienda
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const contentType = request.headers.get('content-type') || '';
    let body: Record<string, unknown> = {};
    let imageBuffer: Buffer | null = null;
    const { id } = await params;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      body.name = formData.get('name')?.toString() || '';
      body.description = formData.get('description')?.toString() || '';
      body.address = formData.get('address')?.toString() || '';
      body.phone = formData.get('phone')?.toString() || '';
      body.website = formData.get('website')?.toString() || '';
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

    body.updatedAt = new Date();
    const store = await Store.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    if (!store) {
      return NextResponse.json(
        { error: 'Tienda no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(store);
  } catch (error) {
    console.error('Error updating store:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la tienda' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar una tienda
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    
    // Verificar que la tienda existe antes de eliminar
    const store = await Store.findById(id);
    if (!store) {
      return NextResponse.json(
        { error: 'Tienda no encontrada' },
        { status: 404 }
      );
    }
    
    // Eliminar todos los precios de productos asociados a esta tienda
    const deletedPrices = await ProductPrice.deleteMany({ storeId: id });
    
    // Eliminar la tienda
    await Store.findByIdAndDelete(id);
    
    return NextResponse.json({ 
      message: 'Tienda eliminada exitosamente',
      deletedPrices: deletedPrices.deletedCount,
      storeName: store.name
    });
  } catch (error) {
    console.error('Error deleting store:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la tienda' },
      { status: 500 }
    );
  }
} 