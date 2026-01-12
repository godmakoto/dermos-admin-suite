-- Create categories and subcategories tables
-- These tables store product classification data

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT now()
);

-- Create subcategories table with foreign key to categories
CREATE TABLE IF NOT EXISTS public.subcategories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(name, category_id)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON public.subcategories(category_id);

-- Insert categories
INSERT INTO public.categories (name) VALUES
    ('Limpiadores'),
    ('Hidratantes Faciales'),
    ('Hidratantes Corporales'),
    ('Protectores Solares'),
    ('Serums'),
    ('Exfoliantes faciales'),
    ('Exfoliantes Corporales'),
    ('Desmaquillantes'),
    ('Tónicos y Esencias'),
    ('Agua Termal y Mist'),
    ('Capilar'),
    ('Maquillaje'),
    ('Kits'),
    ('Labios'),
    ('Mascarillas')
ON CONFLICT (name) DO NOTHING;

-- Insert subcategories for Limpiadores
INSERT INTO public.subcategories (name, category_id)
SELECT 'Piel Mixta a Grasa', id FROM public.categories WHERE name = 'Limpiadores'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO public.subcategories (name, category_id)
SELECT 'Piel normal a seca', id FROM public.categories WHERE name = 'Limpiadores'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO public.subcategories (name, category_id)
SELECT 'Piel sensible', id FROM public.categories WHERE name = 'Limpiadores'
ON CONFLICT (name, category_id) DO NOTHING;

-- Insert subcategories for Hidratantes Faciales
INSERT INTO public.subcategories (name, category_id)
SELECT 'Piel Mixta a Grasa', id FROM public.categories WHERE name = 'Hidratantes Faciales'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO public.subcategories (name, category_id)
SELECT 'Piel normal a seca', id FROM public.categories WHERE name = 'Hidratantes Faciales'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO public.subcategories (name, category_id)
SELECT 'Piel sensible', id FROM public.categories WHERE name = 'Hidratantes Faciales'
ON CONFLICT (name, category_id) DO NOTHING;

-- Insert subcategories for Hidratantes Corporales
INSERT INTO public.subcategories (name, category_id)
SELECT 'Loción', id FROM public.categories WHERE name = 'Hidratantes Corporales'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO public.subcategories (name, category_id)
SELECT 'Crema', id FROM public.categories WHERE name = 'Hidratantes Corporales'
ON CONFLICT (name, category_id) DO NOTHING;

-- Insert subcategories for Protectores Solares
INSERT INTO public.subcategories (name, category_id)
SELECT 'Piel Mixta a Grasa', id FROM public.categories WHERE name = 'Protectores Solares'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO public.subcategories (name, category_id)
SELECT 'Piel normal a seca', id FROM public.categories WHERE name = 'Protectores Solares'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO public.subcategories (name, category_id)
SELECT 'Piel sensible', id FROM public.categories WHERE name = 'Protectores Solares'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO public.subcategories (name, category_id)
SELECT 'Corporales', id FROM public.categories WHERE name = 'Protectores Solares'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO public.subcategories (name, category_id)
SELECT 'Para Niños', id FROM public.categories WHERE name = 'Protectores Solares'
ON CONFLICT (name, category_id) DO NOTHING;

-- Insert subcategories for Serums
INSERT INTO public.subcategories (name, category_id)
SELECT 'Niacinamida', id FROM public.categories WHERE name = 'Serums'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO public.subcategories (name, category_id)
SELECT 'Retinol', id FROM public.categories WHERE name = 'Serums'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO public.subcategories (name, category_id)
SELECT 'Vitamina C', id FROM public.categories WHERE name = 'Serums'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO public.subcategories (name, category_id)
SELECT 'Ácido Hialurónico', id FROM public.categories WHERE name = 'Serums'
ON CONFLICT (name, category_id) DO NOTHING;

-- Insert subcategories for Exfoliantes faciales
INSERT INTO public.subcategories (name, category_id)
SELECT 'Químicos', id FROM public.categories WHERE name = 'Exfoliantes faciales'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO public.subcategories (name, category_id)
SELECT 'Físicos (Gránulos)', id FROM public.categories WHERE name = 'Exfoliantes faciales'
ON CONFLICT (name, category_id) DO NOTHING;

-- Insert subcategories for Desmaquillantes
INSERT INTO public.subcategories (name, category_id)
SELECT 'Agua Micelar', id FROM public.categories WHERE name = 'Desmaquillantes'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO public.subcategories (name, category_id)
SELECT 'Aceite Limpiador', id FROM public.categories WHERE name = 'Desmaquillantes'
ON CONFLICT (name, category_id) DO NOTHING;

-- Insert subcategories for Maquillaje
INSERT INTO public.subcategories (name, category_id)
SELECT 'Base', id FROM public.categories WHERE name = 'Maquillaje'
ON CONFLICT (name, category_id) DO NOTHING;

INSERT INTO public.subcategories (name, category_id)
SELECT 'Labial', id FROM public.categories WHERE name = 'Maquillaje'
ON CONFLICT (name, category_id) DO NOTHING;

-- Add comments
COMMENT ON TABLE public.categories IS 'Product categories';
COMMENT ON TABLE public.subcategories IS 'Product subcategories, linked to their parent category';
COMMENT ON COLUMN public.subcategories.category_id IS 'Foreign key to categories table';
