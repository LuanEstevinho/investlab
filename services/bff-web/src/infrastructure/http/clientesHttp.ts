import type {
  AtivoResumo,
  AtivosClient,
  CarteiraClient,
  CarteiraResumo,
  ParametrosSimulacao,
  ResultadoSimulacao,
  SimulacaoClient,
} from "../../application/ports/clientes.js";

const TIMEOUT_MS = 5000;

async function chamar(url: string, init?: RequestInit): Promise<{ status: number; corpo: unknown }> {
  const resposta = await fetch(url, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const texto = await resposta.text();
  return { status: resposta.status, corpo: texto ? JSON.parse(texto) : null };
}

async function obter<T>(url: string): Promise<T> {
  const r = await chamar(url);
  if (r.status >= 400) throw new Error(`${url} respondeu ${r.status}`);
  return r.corpo as T;
}

/** Adaptadores HTTP (Frameworks & Drivers) para as portas do BFF. */
export class HttpAtivosClient implements AtivosClient {
  constructor(private readonly baseUrl: string) {}
  listar(tipo?: string): Promise<AtivoResumo[]> {
    return obter(`${this.baseUrl}/ativos${tipo ? `?tipo=${encodeURIComponent(tipo)}` : ""}`);
  }
  encaminhar(metodo: string, caminho: string, corpo?: unknown) {
    return chamar(`${this.baseUrl}${caminho}`, { method: metodo, body: corpo && metodo !== "GET" ? JSON.stringify(corpo) : undefined });
  }
}

export class HttpCarteiraClient implements CarteiraClient {
  constructor(private readonly baseUrl: string) {}
  listarPorUsuario(usuarioId: string): Promise<CarteiraResumo[]> {
    return obter(`${this.baseUrl}/carteiras?usuarioId=${encodeURIComponent(usuarioId)}`);
  }
  encaminhar(metodo: string, caminho: string, corpo?: unknown) {
    return chamar(`${this.baseUrl}${caminho}`, { method: metodo, body: corpo && metodo !== "GET" ? JSON.stringify(corpo) : undefined });
  }
}

export class HttpSimulacaoClient implements SimulacaoClient {
  constructor(
    private readonly baseUrl: string,
    private readonly chaveFuncao?: string,
  ) {}
  async simular(parametros: ParametrosSimulacao): Promise<ResultadoSimulacao> {
    const r = await chamar(`${this.baseUrl}/api/simular`, {
      method: "POST",
      body: JSON.stringify(parametros),
      headers: this.chaveFuncao ? { "x-functions-key": this.chaveFuncao } : {},
    });
    if (r.status >= 400) throw new Error(`fn-simulacao respondeu ${r.status}`);
    return r.corpo as ResultadoSimulacao;
  }
}
