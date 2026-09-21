# Vila de Aster — Estado do Projeto

## Versão atual

**v0.6.1 — Local NPC AI**

## Mudança central

A conversa generativa deixou de depender de API externa paga.

Agora existem:

1. diálogo rápido determinístico;
2. conversa livre com um modelo aberto rodando no próprio navegador;
3. fallback determinístico quando WebGPU não estiver disponível.

## Modelos locais

Ordem de tentativa:

1. `Llama-3.2-1B-Instruct-q4f16_1-MLC`;
2. `SmolLM2-360M-Instruct-q4f32_1-MLC`.

Os pesos são baixados apenas na primeira utilização e ficam no cache do navegador.

## Contexto do NPC

O modelo recebe somente:

- identidade e profissão;
- personalidade;
- atividade/decisão atual;
- dia, horário e localização;
- estado familiar;
- fatos que o NPC conhece;
- resumo persistente da conversa;
- últimas falas;
- mensagem atual do jogador.

## Memória

Cada NPC mantém localmente:

- até 8 turnos recentes;
- resumo persistente;
- fatos explícitos extraídos de frases como nome, origem, moradia, gostos e trabalho.

Nenhum servidor de IA é necessário.

## Segurança de arquitetura

- sem `OPENAI_API_KEY`;
- sem backend de IA;
- sem cobrança por token;
- sem envio das conversas para a OpenAI;
- modelo carregado sob demanda com dynamic import;
- estado canônico continua sob controle dos sistemas determinísticos;
- fallback automático se WebGPU ou modelo local falhar.

## Responsabilidades

```text
Life Simulation → o que existe na vida
NPC Brain       → o que o NPC decide fazer
Local NPC AI    → como o NPC conversa sobre o que sabe
```

## Próximo alvo

**v0.7.0 — Economy & Settlement**

- dinheiro por NPC;
- renda e despesas;
- estoque e recursos;
- trabalho afetando produção;
- consumo;
- necessidade de moradia;
- construção de casas;
- expansão orgânica da vila.
