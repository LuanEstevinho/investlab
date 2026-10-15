export class ErroDeDominio extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "ErroDeDominio";
  }
}

export class AtivoNaoEncontrado extends Error {
  constructor(readonly ticker: string) {
    super(`Ativo ${ticker} não encontrado`);
    this.name = "AtivoNaoEncontrado";
  }
}

export class AtivoJaCadastrado extends Error {
  constructor(readonly ticker: string) {
    super(`Ativo ${ticker} já cadastrado`);
    this.name = "AtivoJaCadastrado";
  }
}
