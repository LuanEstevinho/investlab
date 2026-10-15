-- Esquema do microserviço de Carteira (Azure SQL Database - Free tier / 1 DTU)
-- Database per Service: nenhum outro serviço acessa estas tabelas.
IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'carteira') EXEC('CREATE SCHEMA carteira');
GO

IF OBJECT_ID('carteira.Carteira') IS NULL
CREATE TABLE carteira.Carteira (
  Id            UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
  UsuarioId     NVARCHAR(64)     NOT NULL,
  Nome          NVARCHAR(80)     NOT NULL,
  AtualizadaEm  DATETIME2        NOT NULL
);
CREATE INDEX IX_Carteira_Usuario ON carteira.Carteira (UsuarioId);
GO

IF OBJECT_ID('carteira.Posicao') IS NULL
CREATE TABLE carteira.Posicao (
  CarteiraId          UNIQUEIDENTIFIER NOT NULL REFERENCES carteira.Carteira(Id) ON DELETE CASCADE,
  Ticker              NVARCHAR(12)     NOT NULL,
  Quantidade          DECIMAL(18,6)    NOT NULL,
  PrecoMedioCentavos  BIGINT           NOT NULL,
  PrecoAtualCentavos  BIGINT           NOT NULL,
  CONSTRAINT PK_Posicao PRIMARY KEY (CarteiraId, Ticker)
);
CREATE INDEX IX_Posicao_Ticker ON carteira.Posicao (Ticker);
GO

IF OBJECT_ID('carteira.Transacao') IS NULL
CREATE TABLE carteira.Transacao (
  Id             UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
  CarteiraId     UNIQUEIDENTIFIER NOT NULL REFERENCES carteira.Carteira(Id) ON DELETE CASCADE,
  Ticker         NVARCHAR(12)     NOT NULL,
  Quantidade     DECIMAL(18,6)    NOT NULL,
  PrecoCentavos  BIGINT           NOT NULL,
  Data           DATETIME2        NOT NULL
);
GO
