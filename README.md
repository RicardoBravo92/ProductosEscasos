# ProductosEscasos - Comparador de Precios

Una aplicación web para encontrar y comparar precios de productos en diferentes tiendas. Los usuarios pueden agregar productos y tiendas, actualizar precios e indicar disponibilidad sin necesidad de registrarse.

## Características

- 🔍 **Búsqueda de productos** - Encuentra productos por nombre, descripción o marca
- 📊 **Comparación de precios** - Ve precios de un producto en todas las tiendas
- 🏪 **Gestión de tiendas** - Agrega y gestiona información de tiendas
- 📦 **Gestión de productos** - Agrega productos con imágenes y detalles
- 💰 **Actualización de precios** - Actualiza precios y disponibilidad en tiempo real
- 📱 **Diseño responsive** - Funciona en dispositivos móviles y desktop
- 🔐 **Sin registro** - No requiere autenticación de usuarios

## Tecnologías

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de datos**: Supabase (PostgreSQL)
- **Deployment**: Vercel (recomendado)

## Configuración

### Prerrequisitos

- Node.js 18+ 
- Cuenta en [Supabase](https://supabase.com/) y un proyecto creado

### Instalación

1. **Clona el repositorio**
   ```bash
   git clone git@github.com:RicardoBravo92/ProductosEscasos.git
   cd productos-escasos
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   
   Crea un archivo `.env.local` en la raíz del proyecto:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
   ```

4. **Crea la base de datos en Supabase**

   Ve al panel de Supabase → SQL Editor y ejecuta los scripts que están en la carpeta `supabase_sql/` en este orden:
   
   1. `01_create_extension.sql`
   2. `02_create_products.sql`
   3. `03_create_stores.sql`
   4. `04_create_product_prices.sql`
   5. `05_unique_index_product_store.sql`

   Esto creará todas las tablas y relaciones necesarias.

5. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

6. **Abre tu navegador**
   
   Ve a [http://localhost:3000](http://localhost:3000)

## Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   │   ├── products/      # CRUD de productos
│   │   ├── stores/        # CRUD de tiendas
│   │   ├── prices/        # Gestión de precios
│   │   └── compare/       # Comparación de precios
│   ├── products/          # Páginas de productos
│   ├── stores/            # Páginas de tiendas
│   ├── add-product/       # Formulario agregar producto
│   └── add-store/         # Formulario agregar tienda
├── components/            # Componentes React
│   ├── Header.tsx         # Navegación principal
│   └── SearchBar.tsx      # Barra de búsqueda
└── lib/                   # Utilidades y configuración
    ├── supabase.ts        # Cliente de Supabase
    └── models/            # (Obsoleto, solo referencia histórica)
```

## API Endpoints

### Productos
- `GET /api/products` - Obtener productos (con filtros opcionales)
- `POST /api/products` - Crear producto
- `GET /api/products/[id]` - Obtener producto específico
- `PUT /api/products/[id]` - Actualizar producto
- `DELETE /api/products/[id]` - Eliminar producto

### Tiendas
- `GET /api/stores` - Obtener tiendas
- `POST /api/stores` - Crear tienda
- `GET /api/stores/[id]` - Obtener tienda específica
- `PUT /api/stores/[id]` - Actualizar tienda
- `DELETE /api/stores/[id]` - Eliminar tienda

### Precios
- `GET /api/prices` - Obtener precios (con filtros)
- `POST /api/prices` - Crear/actualizar precio

### Comparación
- `GET /api/compare/[productId]` - Comparar precios de un producto

## Uso

### Para Usuarios

1. **Buscar productos**: Usa la barra de búsqueda en la página principal
2. **Ver precios**: Haz clic en "Ver precios" en cualquier producto
3. **Comparar**: Ve todos los precios disponibles ordenados de menor a mayor
4. **Filtrar**: Usa los filtros por categoría y marca

### Para Contribuidores

1. **Agregar producto**: Ve a "Agregar Producto" y completa el formulario
2. **Agregar tienda**: Ve a "Agregar Tienda" y completa la información
3. **Actualizar precios**: En la página de comparación, agrega o actualiza precios

## Deployment

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy automático en cada push

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte

Si tienes problemas o preguntas:
1. Revisa los issues existentes
2. Crea un nuevo issue con detalles del problema
3. Incluye información sobre tu entorno (OS, Node.js version, etc.)

# Variables de entorno necesarias para Cloudinary

Agrega estas variables a tu archivo `.env.local` en la raíz del proyecto:

```
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

---
