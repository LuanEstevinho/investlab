import { useCallback, useEffect, useState, type FormEvent } from "react";

interface Carteira {
  id: string;
  nome: string;
  patrimonioCentavos: number;
  investidoCentavos: number;
  posicoes: Array<{ ticker: string; quantidade: number; precoMedioCentavos: number; precoAtualCentavos: number; valorAtualCentavos: number }>;
}
interface Simulacao {
  cenarios: Array<{ nome: string; taxaAnualPercentual: number; patrimonioFinalCentavos: number; totalAportadoCentavos: number; rendimentoCentavos: number }>;
}

const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Remote "Carteira": RF15-RF16 (carteira virtual) e RF07-RF08 (simulação via Function). */
export default function App({ bffUrl, usuarioId }: { bffUrl: string; usuarioId: string }) {
  const [carteiras, setCarteiras] = useState<Carteira[]>([]);
  const [simulacao, setSimulacao] = useState<Simulacao | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(() => {
    fetch(`${bffUrl}/api/carteiras?usuarioId=${usuarioId}`)
      .then((r) => r.json())
      .then(setCarteiras)
      .catch((e: Error) => setErro(e.message));
  }, [bffUrl, usuarioId]);
  useEffect(carregar, [carregar]);

  async function post(caminho: string, corpo: unknown) {
    const r = await fetch(`${bffUrl}${caminho}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(corpo) });
    if (!r.ok) {
      const c = await r.json().catch(() => ({}));
      throw new Error(c.mensagem ?? `Erro ${r.status}`);
    }
    return r.json();
  }

  async function criarCarteira(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nome = new FormData(e.currentTarget).get("nome");
    try {
      await post("/api/carteiras", { usuarioId, nome });
      e.currentTarget.reset();
      carregar();
    } catch (err) {
      setErro((err as Error).message);
    }
  }

  async function aportar(e: FormEvent<HTMLFormElement>, carteiraId: string) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    try {
      await post(`/api/carteiras/${carteiraId}/aportes`, {
        ticker: f.get("ticker"),
        quantidade: Number(f.get("quantidade")),
        precoCentavos: Math.round(Number(f.get("preco")) * 100),
      });
      e.currentTarget.reset();
      carregar();
    } catch (err) {
      setErro((err as Error).message);
    }
  }

  async function simular(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    try {
      setSimulacao(
        await post("/api/simulacoes", {
          capitalInicialCentavos: Math.round(Number(f.get("capital")) * 100),
          aporteMensalCentavos: Math.round(Number(f.get("aporte")) * 100),
          meses: Number(f.get("anos")) * 12,
          taxaAnualPercentual: Number(f.get("taxa")),
        }),
      );
    } catch (err) {
      setErro((err as Error).message);
    }
  }

  return (
    <section>
      <h2>Carteira virtual</h2>
      {erro && <p className="aviso">{erro}</p>}
      <form onSubmit={criarCarteira}>
        <label>Nova carteira<input name="nome" required placeholder="Aposentadoria" /></label>
        <button className="primario">Criar</button>
      </form>
      {carteiras.map((c) => (
        <div className="card" key={c.id} style={{ marginBottom: 16 }}>
          <h3>{c.nome} — {brl(c.patrimonioCentavos)} <small>(investido {brl(c.investidoCentavos)})</small></h3>
          <table>
            <thead><tr><th>Ticker</th><th>Qtd</th><th>Preço médio</th><th>Preço atual</th><th>Valor</th></tr></thead>
            <tbody>
              {c.posicoes.map((p) => (
                <tr key={p.ticker}><td>{p.ticker}</td><td>{p.quantidade}</td><td>{brl(p.precoMedioCentavos)}</td><td>{brl(p.precoAtualCentavos)}</td><td>{brl(p.valorAtualCentavos)}</td></tr>
              ))}
            </tbody>
          </table>
          <form onSubmit={(e) => aportar(e, c.id)}>
            <label>Ticker<input name="ticker" required /></label>
            <label>Quantidade<input name="quantidade" type="number" step="0.000001" min="0.000001" required /></label>
            <label>Preço (R$)<input name="preco" type="number" step="0.01" min="0.01" required /></label>
            <button className="primario">Registrar aporte</button>
          </form>
        </div>
      ))}

      <h2>Simulador (Azure Function)</h2>
      <form onSubmit={simular}>
        <label>Capital inicial (R$)<input name="capital" type="number" step="0.01" defaultValue="1000" /></label>
        <label>Aporte mensal (R$)<input name="aporte" type="number" step="0.01" defaultValue="500" /></label>
        <label>Anos<input name="anos" type="number" min="1" max="50" defaultValue="10" /></label>
        <label>Taxa a.a. (%)<input name="taxa" type="number" step="0.01" defaultValue="10" /></label>
        <button className="primario">Simular</button>
      </form>
      {simulacao && (
        <table>
          <thead><tr><th>Cenário</th><th>Taxa</th><th>Aportado</th><th>Patrimônio final</th><th>Rendimento</th></tr></thead>
          <tbody>
            {simulacao.cenarios.map((s) => (
              <tr key={s.nome}><td>{s.nome}</td><td>{s.taxaAnualPercentual.toFixed(2)}%</td><td>{brl(s.totalAportadoCentavos)}</td><td>{brl(s.patrimonioFinalCentavos)}</td><td>{brl(s.rendimentoCentavos)}</td></tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
