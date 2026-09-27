-- Rebutjar una proposta d'horari de la rival també compta com a cancel·lació (decisió del coordinador).
ALTER TABLE cancellation
  ADD COLUMN kind text NOT NULL DEFAULT 'CANCEL' CHECK (kind IN ('CANCEL', 'REJECT'));
