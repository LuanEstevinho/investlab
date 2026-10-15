import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { CarteiraNaoEncontrada, ErroDeDominio } from "../domain/erros.js";

export const tratadorDeErros: ErrorRequestHandler = (erro, _req, res, _next) => {
  if (erro instanceof ZodError) {
    res.status(400).json({ erro: "ENTRADA_INVALIDA", detalhes: erro.issues });
    return;
  }
  if (erro instanceof ErroDeDominio) {
    res.status(422).json({ erro: "REGRA_DE_DOMINIO", mensagem: erro.message });
    return;
  }
  if (erro instanceof CarteiraNaoEncontrada) {
    res.status(404).json({ erro: "NAO_ENCONTRADO", mensagem: erro.message });
    return;
  }
  console.error(JSON.stringify({ nivel: "error", operacao: "http", mensagem: (erro as Error).message }));
  res.status(500).json({ erro: "ERRO_INTERNO" });
};
