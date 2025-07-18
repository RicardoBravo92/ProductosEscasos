create table stores (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  address text,
  phone text,
  website text,
  image text,
  "createdAt" timestamp with time zone default now(),
  "updatedAt" timestamp with time zone default now()
); 