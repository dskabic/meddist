ALTER TABLE Potrosni_materijal
ADD COLUMN IF NOT EXISTS Zadana_Jedinicna_Cijena DECIMAL(10,2);

ALTER TABLE Narudzba_za_kupnju
ALTER COLUMN ID_Djelatnika DROP NOT NULL;

ALTER TABLE Narudzba_za_kupnju
ALTER COLUMN Status_Isporuke SET DEFAULT 'U obradi';
