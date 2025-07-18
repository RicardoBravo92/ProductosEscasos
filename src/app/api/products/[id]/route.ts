import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

// GET - Obtener un producto específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: product, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error || !product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Error al obtener el producto' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un producto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body: Record<string, unknown> = {};
    let imageBuffer: Buffer | null = null;
    const { id } = await params;

    if (contentType.includes('multipart/form-data')) {
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

    body.updatedAt = new Date();
    const { data: product, error } = await supabase.from('products').update(body).eq('id', id).select().single();
    if (error || !product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el producto' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un producto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Verificar que el producto existe
    const { data: product, error: errorProduct } = await supabase.from('products').select('name').eq('id', id).single();
    if (errorProduct || !product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      );
    }
    // Eliminar todos los precios de este producto
    const { count: deletedPrices } = await supabase.from('product_prices').delete({ count: 'exact' }).eq('productId', id).select('id');
    // Eliminar el producto
    const { error: errorDelete } = await supabase.from('products').delete().eq('id', id);
    if (errorDelete) throw errorDelete;
    return NextResponse.json({ 
      message: 'Producto eliminado exitosamente',
      deletedPrices,
      productName: product.name
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el producto' },
      { status: 500 }
    );
  }
} 