# Vila de Aster — Estado do Projeto

## Versão atual

**v0.6.2 — Local NPC AI**

## Mudança central

A IA local agora funciona em duas rotas:

- **GPU/WebGPU**: WebLLM com Llama 3.2 1B e SmolLM2 360M.
- **CPU/WASM**: Transformers.js com SmolLM2 135M Instruct quantizado.

Isso permite conversa generativa também em navegadores que não expõem WebGPU.

## Regras

- sem API paga;
- sem chave;
- sem backend de IA;
- download do modelo apenas quando necessário;
- cache no navegador;
- contexto limitado ao conhecimento do NPC;
- memória curta e resumo persistente;
- Utility AI continua sendo autoridade sobre comportamento;
- fallback determinístico permanece como última camada.

## Fluxo

```text
Life Simulation → estado
NPC Brain → decisão
Local NPC AI → linguagem
              ├─ GPU
              └─ CPU/WASM
```

## Próximo alvo

**v0.7.0 — Economy & Settlement**.
