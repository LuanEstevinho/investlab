import { randomUUID } from "node:crypto";
import { Posicao } from "./Posicao.js";
import { ErroDeDominio } from "./erros.js";

export interface Transacao {
  id: string;
  ticker: string;
  quantidade: number;
  precoCentavos: number;
  data: Date;
}

/**
 * Agregado raiz do domínio de Carteira (Clean Architecture - Entities).
 * Carteira virtual: não há custódia nem execução de ordens (ADR-07).
 */
export class Carteira {
  private constructor(
    readonly id: string,
    readonly usuarioId: string,
    readonly nome: string,
    private posicoesPorTicker: Map<string, Posicao>,
    private readonly transacoes: Transacao[],
    private _atualizadaEm: Date,
  ) {}

  static criar(entrada: { usuarioId: string; nome: string }): Carteira {
    if (!entrada.usuarioId.trim()) throw new ErroDeDominio("Carteira precisa de um usuário");
    if (entrada.nome.trim().length < 2) throw new ErroDeDominio("Nome da carteira deve ter ao menos 2 caracteres");
    return new Carteira(randomUUID(), entrada.usuarioId.trim(), entrada.nome.trim(), new Map(), [], new Date());
  }

  static reidratar(props: {
    id: string;
    usuarioId: string;
    nome: string;
    posicoes: Posicao[];
    transacoes: Transacao[];
    atualizadaEm: Date;
  }): Carteira {
    return new Carteira(
      props.id,
      props.usuarioId,
      props.nome,
      new Map(props.posicoes.map((p) => [p.ticker, p])),
      [...props.transacoes],
      props.atualizadaEm,
    );
  }

  get posicoes(): Posicao[] {
    return [...this.posicoesPorTicker.values()];
  }

  get historico(): Transacao[] {
    return [...this.transacoes];
  }

  get atualizadaEm(): Date {
    return this._atualizadaEm;
  }

  /** RF15: registra aporte, cria/atualiza a posição e guarda a transação para rastreabilidade (Q07). */
  registrarAporte(entrada: { ticker: string; quantidade: number; precoCentavos: number; data?: Date }): Transacao {
    const ticker = entrada.ticker.toUpperCase();
    const atual = this.posicoesPorTicker.get(ticker);
    const nova = atual
      ? atual.comAporte(entrada.quantidade, entrada.precoCentavos)
      : Posicao.nova(ticker, entrada.quantidade, entrada.precoCentavos);
    this.posicoesPorTicker.set(ticker, nova);

    const transacao: Transacao = {
      id: randomUUID(),
      ticker,
      quantidade: entrada.quantidade,
      precoCentavos: entrada.precoCentavos,
      data: entrada.data ?? new Date(),
    };
    this.transacoes.push(transacao);
    this._atualizadaEm = new Date();
    return transacao;
  }

  /**
   * Reage ao evento CotacaoAtualizada (EDA). Idempotente: aplicar o mesmo preço
   * duas vezes não altera o estado. Retorna false se a carteira não tem o ativo.
   */
  atualizarPreco(ticker: string, precoCentavos: number): boolean {
    const posicao = this.posicoesPorTicker.get(ticker.toUpperCase());
    if (!posicao) return false;
    if (posicao.precoAtualCentavos === precoCentavos) return true;
    this.posicoesPorTicker.set(posicao.ticker, posicao.comPrecoAtual(precoCentavos));
    this._atualizadaEm = new Date();
    return true;
  }

  get patrimonioCentavos(): number {
    return this.posicoes.reduce((soma, p) => soma + p.valorAtualCentavos, 0);
  }

  get investidoCentavos(): number {
    return this.posicoes.reduce((soma, p) => soma + p.valorInvestidoCentavos, 0);
  }

  paraSnapshot() {
    return {
      id: this.id,
      usuarioId: this.usuarioId,
      nome: this.nome,
      patrimonioCentavos: this.patrimonioCentavos,
      investidoCentavos: this.investidoCentavos,
      atualizadaEm: this._atualizadaEm.toISOString(),
      posicoes: this.posicoes.map((p) => ({
        ticker: p.ticker,
        quantidade: p.quantidade,
        precoMedioCentavos: p.precoMedioCentavos,
        precoAtualCentavos: p.precoAtualCentavos,
        valorAtualCentavos: p.valorAtualCentavos,
      })),
    };
  }
}
