declare module "mfe_ativos/App" {
  const App: React.ComponentType<{ bffUrl: string }>;
  export default App;
}
declare module "mfe_carteira/App" {
  const App: React.ComponentType<{ bffUrl: string; usuarioId: string }>;
  export default App;
}
