import type { EventoAtivos } from "../../domain/eventos.js";

/** Porta de saída para o barramento de eventos (Azure Service Bus em produção). */
export interface EventPublisher {
  publicar(evento: EventoAtivos): Promise<void>;
}
