-- Step 1: Adicionar colunas primeiro_nome e ultimo_nome como anuláveis
ALTER TABLE "usuarios" ADD COLUMN "primeiro_nome" VARCHAR(100);
ALTER TABLE "usuarios" ADD COLUMN "ultimo_nome" VARCHAR(100);

-- Step 2: Migrar dados existentes a partir de nome_completo
UPDATE "usuarios"
SET 
  "primeiro_nome" = TRIM(SPLIT_PART(TRIM("nome_completo"), ' ', 1)),
  "ultimo_nome" = CASE 
    WHEN POSITION(' ' IN TRIM("nome_completo")) > 0 
    THEN TRIM(SUBSTRING(TRIM("nome_completo") FROM POSITION(' ' IN TRIM("nome_completo")) + 1))
    ELSE ''
  END;

-- Step 3: Aplicar restrição NOT NULL nas novas colunas
ALTER TABLE "usuarios" ALTER COLUMN "primeiro_nome" SET NOT NULL;
ALTER TABLE "usuarios" ALTER COLUMN "ultimo_nome" SET NOT NULL;

-- Step 4: Deletar a coluna legada nome_completo
ALTER TABLE "usuarios" DROP COLUMN "nome_completo";
