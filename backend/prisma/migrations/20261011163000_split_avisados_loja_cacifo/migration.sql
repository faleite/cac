-- Step 1: Adicionar colunas qtd_avisados_loja e qtd_avisados_cacifo com valor padrão 0
ALTER TABLE "registos_diarios" ADD COLUMN "qtd_avisados_loja" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "registos_diarios" ADD COLUMN "qtd_avisados_cacifo" INTEGER NOT NULL DEFAULT 0;

-- Step 2: Migrar com segurança os dados históricos de qtd_avisados para qtd_avisados_loja
UPDATE "registos_diarios"
SET "qtd_avisados_loja" = COALESCE("qtd_avisados", 0);

-- Step 3: Remover a coluna legada qtd_avisados
ALTER TABLE "registos_diarios" DROP COLUMN "qtd_avisados";
