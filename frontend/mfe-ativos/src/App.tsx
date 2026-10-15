import { useCallback, useEffect, useState, type FormEvent } from "react";

interface Ativo {
  ticker: string;
  tipo: string;
  nome: string;
  precoCentavos: number;
  dataReferencia: string;
}

const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Remote "Ativos": RF03-RF04 (pesquisar e consultar ativos, preços e indicadores). Fala só com o BFF. */
export default function App({ bffUrl }: { bffUrl: string }) {
  const [ativos, setAtivos] = useState<Ativo[]>([]);
  const [tipo, setTipo] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(() => {
    fetch(`${bffUrl}/api/ativos${tipo ? `?tipo=${tipo}` : ""}`)
      .then((r) => r.json())
      .then(setAtivos)
      .catch((e: Error) => setErro(e.message));
  }, [bffUrl, tipo]);

  useEffect(carregar, [carregar]);

  async function cadastrar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const r = await fetch(`${bffUrl}/api/ativos`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ticker: f.get("ticker"),
        tipo: f.get("tipo"),
        nome: f.get("nome"),
        precoCentavos: Math.round(Number(f.get("preco")) * 100),
      }),
    });
    if (!r.ok) {
      const corpo = await r.json().catch(() => ({}));
      setErro(corpo.mensagem ?? `Erro ${r.status}`);
      return;
    }
    setErro(null);
    e.currentTarget.reset();
    carregar();
  }

  return (
    <section>
      <h2>Ativos</h2>
      <form onSubmit={cadastrar}>
        <label>Ticker<input name="ticker" required placeholder="HGLG11" /></label>
        <label>Tipo
          <select name="tipo">{["FII", "ACAO", "TESOURO", "CDB", "LCI", "LCA"].map((t) => <option key={t}>{t}</option>)}</select>
        </label>
        <label>Nome<input name="nome" required /></label>
        <label>Preço (R$)<input name="preco" type="number" step="0.01" min="0.01" required /></label>
        <button className="primario">Cadastrar</button>
      </form>
      {erro && <p className="aviso">{erro}</p>}
      <label>Filtrar por tipo
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="">Todos</option>
          {["FII", "ACAO", "TESOURO", "CDB", "LCI", "LCA"].map((t) => <option key={t}>{t}</option>)}
        </select>
      </label>
      <table>
        <thead><tr><th>Ticker</th><th>Tipo</th><th>Nome</th><th>Preço</th><th>Referência</th></tr></thead>
        <tbody>
          {ativos.map((a) => (
            <tr key={a.ticker}><td>{a.ticker}</td><td>{a.tipo}</td><td>{a.nome}</td><td>{brl(a.precoCentavos)}</td><td>{new Date(a.dataReferencia).toLocaleDateString("pt-BR")}</td></tr>
          ))}
          {ativos.length === 0 && <tr><td colSpan={5}>Nenhum ativo cadastrado.</td></tr>}
        </tbody>
      </table>
    </section>
  );
}
