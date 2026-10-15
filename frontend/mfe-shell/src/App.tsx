import React, { Suspense, useState } from "react";
import { Dashboard } from "./Dashboard";

const BFF_URL = import.meta.env.VITE_BFF_URL ?? "http://localhost:3000";
const USUARIO_ID = "demo"; // autenticação (RF01) fica para a Entrega 3 via API Gateway

// Remotes carregados em runtime (Module Federation). Falha de um remote não derruba o shell.
const AtivosApp = React.lazy(() => import("mfe_ativos/App"));
const CarteiraApp = React.lazy(() => import("mfe_carteira/App"));

type Rota = "dashboard" | "ativos" | "carteira";

class LimiteDeErro extends React.Component<{ children: React.ReactNode; nome: string }, { erro: boolean }> {
  state = { erro: false };
  static getDerivedStateFromError() {
    return { erro: true };
  }
  render() {
    return this.state.erro ? <p className="aviso">O módulo {this.props.nome} está indisponível no momento.</p> : this.props.children;
  }
}

export function App() {
  const [rota, setRota] = useState<Rota>("dashboard");
  return (
    <div className="shell">
      <header>
        <h1>InvestLab</h1>
        <nav>
          {(["dashboard", "ativos", "carteira"] as Rota[]).map((r) => (
            <button key={r} className={rota === r ? "ativo" : ""} onClick={() => setRota(r)}>
              {r}
            </button>
          ))}
        </nav>
      </header>
      <main>
        {rota === "dashboard" && <Dashboard bffUrl={BFF_URL} usuarioId={USUARIO_ID} />}
        {rota === "ativos" && (
          <LimiteDeErro nome="Ativos">
            <Suspense fallback={<p>Carregando módulo de ativos…</p>}>
              <AtivosApp bffUrl={BFF_URL} />
            </Suspense>
          </LimiteDeErro>
        )}
        {rota === "carteira" && (
          <LimiteDeErro nome="Carteira">
            <Suspense fallback={<p>Carregando módulo de carteira…</p>}>
              <CarteiraApp bffUrl={BFF_URL} usuarioId={USUARIO_ID} />
            </Suspense>
          </LimiteDeErro>
        )}
      </main>
      <style>{`
        body{margin:0;font-family:system-ui,sans-serif;background:#f4f6f8;color:#1c2430}
        .shell header{display:flex;align-items:center;gap:24px;padding:12px 24px;background:#0b3d5c;color:#fff}
        .shell h1{margin:0;font-size:20px}
        nav button{background:transparent;border:1px solid #fff5;color:#fff;padding:6px 14px;border-radius:6px;margin-right:8px;cursor:pointer;text-transform:capitalize}
        nav button.ativo{background:#fff;color:#0b3d5c}
        main{padding:24px;max-width:1100px;margin:0 auto}
        table{border-collapse:collapse;width:100%;background:#fff}
        th,td{border-bottom:1px solid #e3e7ea;padding:8px 10px;text-align:left}
        .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px}
        .card{background:#fff;border-radius:8px;padding:16px;box-shadow:0 1px 3px #0002}
        .card small{color:#5b6770}
        .aviso{background:#fff4e5;border:1px solid #f0c27b;padding:12px;border-radius:6px}
        form{display:flex;gap:8px;flex-wrap:wrap;align-items:end;margin:16px 0}
        label{display:flex;flex-direction:column;font-size:12px;color:#5b6770}
        input,select{padding:6px;border:1px solid #c9d0d6;border-radius:4px}
        button.primario{background:#0b3d5c;color:#fff;border:0;padding:8px 14px;border-radius:6px;cursor:pointer}
      `}</style>
    </div>
  );
}
