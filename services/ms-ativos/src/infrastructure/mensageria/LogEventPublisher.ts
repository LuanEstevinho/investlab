import type { EventPublisher } from "../../application/ports/EventPublisher.js";
import type { EventoAtivos } from "../../domain/eventos.js";

/** Adaptador para desenvolvimento local: apenas registra o evento em log estruturado. */
export class LogEventPublisher implements EventPublisher {
  async publicar(evento: EventoAtivos): Promise<void> {
    console.log(JSON.stringify({ nivel: "info", operacao: "evento.publicado", tipo: evento.tipo, ticker: evento.dados.ticker }));
  }
}
