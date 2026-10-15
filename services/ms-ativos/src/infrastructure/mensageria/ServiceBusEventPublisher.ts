import { ServiceBusClient, type ServiceBusSender } from "@azure/service-bus";
import type { EventPublisher } from "../../application/ports/EventPublisher.js";
import type { EventoAtivos } from "../../domain/eventos.js";

/** Publica eventos de integração em um tópico do Azure Service Bus (EDA / pub-sub). */
export class ServiceBusEventPublisher implements EventPublisher {
  private readonly sender: ServiceBusSender;

  constructor(connectionString: string, topico: string) {
    this.sender = new ServiceBusClient(connectionString).createSender(topico);
  }

  async publicar(evento: EventoAtivos): Promise<void> {
    await this.sender.sendMessages({
      body: evento,
      subject: evento.tipo,
      contentType: "application/json",
      applicationProperties: { versao: evento.versao, ticker: evento.dados.ticker },
    });
  }
}
