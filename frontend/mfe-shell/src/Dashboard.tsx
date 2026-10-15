import { useEffect, useState } from "react";

interface Agregado {
  geradoEm: string;
  resumo: { quantidadeAtivos: number | null; quantidadeCarteiras: number; patrimonioTotalCentavos: number; investidoTotalCentavos: number };
  simulacao: { cenarios: Array<{ nome: string; taxaAnualPercentual: number; patrimonioFinalCentavos: number; rendimentoCentavos: number }> } | null;
  fontes: Record<string, "fulfilled" | "rejected">;
}

const brl = (c: number) => (c / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Tela do shell: consome exclusivamente o BFF (GET /aggregated-data). */
export function Dashboard({ bffUrl, usuarioId }: { bffUrl: string; usuarioId: string }) {
  const [dados, setDados] = useState<Agregado | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${bffUrl}/aggregated-data?usuarioId=${usuarioId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`BFF respondeu ${r.status}`))))
      .then(setDados)
      .catch((e: Error) => setErro(e.message));
  }, [bffUrl, usuarioId]);

  if (erro) return <p className="aviso">Não foi possível carregar o dashboard: {erro}</p>;
  if (!dados) return <p>Carregando…</p>;

  return (
    <section>
      <div className="cards">
        <div className="card"><small>Patrimônio total</small><h2>{brl(dados.resumo.patrimonioTotalCentavos)}</h2></div>
        <div className="card"><small>Total investido</small><h2>{brl(dados.resumo.investidoTotalCentavos)}</h2></div>
        <div className="card"><small>Carteiras</small><h2>{dados.resumo.quantidadeCarteiras}</h2></div>
        <div className="card"><small>Ativos catalogados</small><h2>{dados.resumo.quantidadeAtivos ?? "—"}</h2></div>
      </div>
      <h3>Projeção em 10 anos (aporte R$ 500/mês)</h3>
      {dados.simulacao ? (
        <table>
          <thead><tr><th>Cenário</th><th>Taxa a.a.</th><th>Patrimônio final</th><th>Rendimento</th></tr></thead>
          <tbody>
            {dados.simulacao.cenarios.map((c) => (
              <tr key={c.nome}><td>{c.nome}</td><td>{c.taxaAnualPercentual.toFixed(2)}%</td><td>{brl(c.patrimonioFinalCentavos)}</td><td>{brl(c.rendimentoCentavos)}</td></tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="aviso">Simulação indisponível (fn-simulacao: {dados.fontes.simulacao}).</p>
      )}
      <p><small>Dados de {new Date(dados.geradoEm).toLocaleString("pt-BR")}. Simulação baseada em premissas; não é recomendação de investimento.</small></p>
    </section>
  );
}
