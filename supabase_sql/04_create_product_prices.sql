create table product_prices (
  id uuid primary key default uuid_generate_v4(),
  "productId" uuid not null references products(id) on delete cascade,
  "storeId" uuid not null references stores(id) on delete cascade,
  price numeric not null,
  "isAvailable" boolean default true,
  "lastUpdated" timestamp with time zone default now(),
  notes text
); 