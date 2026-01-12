-- Create brands, labels, and product carousel states tables
-- These tables store product metadata and configuration

-- Create brands table
CREATE TABLE IF NOT EXISTS public.brands (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT now()
);

-- Create labels table (propiedades)
CREATE TABLE IF NOT EXISTS public.labels (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    color text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Create product_carousel_states table
CREATE TABLE IF NOT EXISTS public.product_carousel_states (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    type text NOT NULL CHECK (type IN ('carousel', 'banner')),
    color text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Create order_statuses table
CREATE TABLE IF NOT EXISTS public.order_statuses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    color text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Insert default brands
INSERT INTO public.brands (name) VALUES
    ('La Roche-Posay'),
    ('Bioderma'),
    ('CeraVe'),
    ('Avène'),
    ('Eucerin'),
    ('Vichy'),
    ('Tocobo'),
    ('Evelyn Cosmetics')
ON CONFLICT (name) DO NOTHING;

-- Insert default labels (propiedades)
INSERT INTO public.labels (name, color) VALUES
    ('Nuevo', '#22c55e'),
    ('Bestseller', '#3b82f6'),
    ('Oferta', '#ef4444'),
    ('Agotado', '#6b7280')
ON CONFLICT (name) DO NOTHING;

-- Insert default product carousel states
INSERT INTO public.product_carousel_states (name, type, color) VALUES
    ('Destacados', 'carousel', '#3b82f6'),
    ('De vuelta en stock', 'carousel', '#22c55e'),
    ('Más vendidos', 'carousel', '#8b5cf6'),
    ('Ofertas', 'banner', '#ef4444')
ON CONFLICT (name) DO NOTHING;

-- Insert default order statuses
INSERT INTO public.order_statuses (name, color) VALUES
    ('Pendiente', '#f59e0b'),
    ('Finalizado', '#22c55e'),
    ('Cancelado', '#ef4444')
ON CONFLICT (name) DO NOTHING;

-- Add comments to document the tables
COMMENT ON TABLE public.brands IS 'Product brands';
COMMENT ON TABLE public.labels IS 'Product labels/properties (Nuevo, Bestseller, etc.)';
COMMENT ON TABLE public.product_carousel_states IS 'States for product carousel display on the website';
COMMENT ON TABLE public.order_statuses IS 'Order status options';

COMMENT ON COLUMN public.labels.color IS 'Hex color code for label display';
COMMENT ON COLUMN public.product_carousel_states.type IS 'Display type: carousel or banner';
COMMENT ON COLUMN public.product_carousel_states.color IS 'Hex color code for state display';
COMMENT ON COLUMN public.order_statuses.color IS 'Hex color code for status display';
