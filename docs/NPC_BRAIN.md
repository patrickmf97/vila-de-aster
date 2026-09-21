# NPC Brain — v0.5

O NPC Brain é a camada de decisão da Vila de Aster.

A agenda continua existindo como plano padrão, mas deixou de ser uma ordem absoluta. A cada ciclo de decisão, o NPC compara ações possíveis e escolhe a de maior utilidade.

## Necessidades dinâmicas

Cada NPC acompanha:

- energia;
- fome;
- necessidade social;
- segurança;
- propósito;
- curiosidade.

Energia e necessidade social vivem no estado de vida. As demais urgências ficam no estado do cérebro.

## Personalidade

Os moradores-base possuem seis traços de 0 a 100:

- curiosidade;
- empatia;
- disciplina;
- sociabilidade;
- orientação familiar;
- coragem.

NPCs gerados recebem traços determinísticos derivados de seus dados de vida, mantendo comportamento estável entre reloads.

## Ações avaliadas

- seguir agenda;
- dormir;
- comer;
- descansar;
- socializar;
- passar tempo com a família;
- trabalhar;
- pescar;
- investigar o rio.

Crianças não recebem ações adultas de trabalho ou investigação nesta versão.

## Utility AI

Cada ação recebe um score a partir de:

- necessidades atuais;
- personalidade;
- hora do dia;
- atividade prevista na agenda;
- conhecimento do NPC;
- situação familiar;
- energia disponível;
- uma pequena variação determinística.

O maior score vence.

Exemplo:

```text
Elena — Dia 3, 18:10

investigar rio   86.4
família           74.2
socializar        68.9
seguir agenda     61.5
descansar         44.0

decisão → investigar rio
```

## Decisões explicáveis

Cada escolha gera um log persistente contendo:

- ação escolhida;
- score;
- motivos;
- horário;
- ranking dos candidatos.

No jogo, pressione **B** para abrir o painel NPC Brain e observar as decisões recentes.

## Relação com a Life Simulation

A ordem de execução é:

1. Life Simulation calcula o estado-base e eventos de vida.
2. NPC Brain atualiza necessidades.
3. Utility AI escolhe uma ação.
4. A decisão sobrescreve atividade/localização da agenda quando necessário.
5. O corpo do NPC executa a intenção.

Isso permite que a agenda continue servindo de fallback seguro.

## Limites atuais

- decisões são avaliadas em blocos de aproximadamente 30–60 minutos de jogo;
- entrar em interiores por decisão ainda é uma transição lógica, não uma caminhada completa até a porta;
- economia e dinheiro ainda não influenciam decisões;
- conflitos emocionais, doenças e clima ainda não existem;
- IA generativa não participa das decisões da v0.5.
