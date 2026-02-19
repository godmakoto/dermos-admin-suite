-- Tabla de configuración de la tienda (fila única)
CREATE TABLE IF NOT EXISTS store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hide_out_of_stock boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insertar fila única de configuración
INSERT INTO store_settings (hide_out_of_stock) VALUES (false);

-- Política RLS: lectura pública, escritura autenticada
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON store_settings FOR SELECT USING (true);
CREATE POLICY "Allow authenticated update" ON store_settings FOR UPDATE USING (true);
