export class ErroDeDominio extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = "ErroDeDominio";
  }
}

export class CarteiraNaoEncontrada extends Error {
  constructor(readonly id: string) {
    super(`Carteira ${id} não encontrada`);
    this.name = "CarteiraNaoEncontrada";
  }
}
