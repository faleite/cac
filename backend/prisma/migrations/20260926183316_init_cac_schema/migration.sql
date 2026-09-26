/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "usuarios" (
    "id" BIGSERIAL NOT NULL,
    "nome_completo" VARCHAR(150) NOT NULL,
    "numero_sc" VARCHAR(30) NOT NULL,
    "telemovel" VARCHAR(20) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "senha_hash" VARCHAR(255) NOT NULL,
    "perfil" VARCHAR(20) NOT NULL DEFAULT 'operador',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "token_recuperacao" VARCHAR(255),
    "token_expiracao" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "perfis_configuracao" (
    "id" BIGSERIAL NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "matricula_padrao" VARCHAR(20),
    "giro_padrao" VARCHAR(20),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "perfis_configuracao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registos_diarios" (
    "id" BIGSERIAL NOT NULL,
    "usuario_id" BIGINT NOT NULL,
    "data_registo" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'aberto',
    "km_inicial" INTEGER NOT NULL,
    "km_final" INTEGER,
    "matricula_dia" VARCHAR(20) NOT NULL,
    "giro_dia" VARCHAR(20) NOT NULL,
    "qtd_objetos" INTEGER NOT NULL DEFAULT 0,
    "qtd_recolhas" INTEGER NOT NULL DEFAULT 0,
    "qtd_avisados" INTEGER NOT NULL DEFAULT 0,
    "qtd_retornos" INTEGER NOT NULL DEFAULT 0,
    "qtd_end_insuficiente" INTEGER NOT NULL DEFAULT 0,
    "qtd_recusados" INTEGER NOT NULL DEFAULT 0,
    "qtd_desc_morada" INTEGER NOT NULL DEFAULT 0,
    "qtd_entregues" INTEGER NOT NULL DEFAULT 0,
    "taxa_eficiencia" DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    "km_percorridos" INTEGER NOT NULL DEFAULT 0,
    "data_hora_abertura" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_hora_fecho" TIMESTAMPTZ,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registos_diarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditoria_registos" (
    "id" BIGSERIAL NOT NULL,
    "registo_diario_id" BIGINT NOT NULL,
    "usuario_alteracao_id" BIGINT NOT NULL,
    "data_hora_alteracao" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valores_antigos" JSONB NOT NULL,
    "valores_novos" JSONB NOT NULL,
    "motivo" VARCHAR(255),

    CONSTRAINT "auditoria_registos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_seguranca" (
    "id" BIGSERIAL NOT NULL,
    "tipo_evento" VARCHAR(50) NOT NULL,
    "usuario_id" BIGINT,
    "ip_origem" VARCHAR(45),
    "detalhes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_seguranca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_sessoes" (
    "sid" VARCHAR NOT NULL,
    "sess" JSON NOT NULL,
    "expire" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "app_sessoes_pkey" PRIMARY KEY ("sid")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_numero_sc_key" ON "usuarios"("numero_sc");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "perfis_configuracao_usuario_id_key" ON "perfis_configuracao"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_registos_usuario_data" ON "registos_diarios"("usuario_id", "data_registo");

-- CreateIndex
CREATE INDEX "idx_registos_data_status" ON "registos_diarios"("data_registo", "status");

-- CreateIndex
CREATE INDEX "idx_registos_usuario_status" ON "registos_diarios"("usuario_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "registos_diarios_usuario_id_data_registo_key" ON "registos_diarios"("usuario_id", "data_registo");

-- CreateIndex
CREATE INDEX "idx_auditoria_registo" ON "auditoria_registos"("registo_diario_id");

-- CreateIndex
CREATE INDEX "idx_sessoes_expire" ON "app_sessoes"("expire");

-- AddForeignKey
ALTER TABLE "perfis_configuracao" ADD CONSTRAINT "perfis_configuracao_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registos_diarios" ADD CONSTRAINT "registos_diarios_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_registos" ADD CONSTRAINT "auditoria_registos_registo_diario_id_fkey" FOREIGN KEY ("registo_diario_id") REFERENCES "registos_diarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditoria_registos" ADD CONSTRAINT "auditoria_registos_usuario_alteracao_id_fkey" FOREIGN KEY ("usuario_alteracao_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_seguranca" ADD CONSTRAINT "logs_seguranca_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
