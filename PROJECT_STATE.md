# Vila de Aster — Estado do Projeto

## Visão

RPG 2D top-down browser-first em que a Vila de Aster funciona como uma pequena sociedade persistente. NPCs possuem memória, relações, residência, ciclo diário e agora podem formar famílias que alteram a população.

## Versão atual

**v0.4.0 — Life Simulation**

### Concluído

- residência persistente por NPC;
- Theo ganhou uma casa própria próxima ao rio;
- taverna, forja e empório também funcionam como residência de seus proprietários;
- sono e despertar ligados ao relógio do jogo;
- NPCs entram em casa e deixam de ser renderizados no exterior;
- moradores aparecem dentro da residência durante o período em que estão nela;
- residência dinâmica permite mudança após casamento;
- progressão de relacionamentos;
- namoro;
- casamento;
- formação de família;
- expectativa de filho como evento de vida;
- nascimento gera um novo NPC persistente;
- crianças possuem pais, residência e rotina própria;
- população dinâmica no HUD;
- histórico persistente de eventos de vida;
- memória v2 e propagação de conhecimento preservadas.

## Regras atuais da simulação

- 28 dias de jogo equivalem a 1 ano de envelhecimento na simulação experimental;
- somente jovens adultos/adultos entram no sistema romântico;
- namoro depende de convivência, score de relacionamento e compatibilidade determinística;
- casamento exige relação mais madura e tempo mínimo de namoro;
- crescimento de família depende de casamento, desejo de família e tempo;
- o sistema não simula conteúdo sexual: nascimento é tratado como evento familiar de alto nível;
- no máximo 2 filhos por casal nesta primeira versão para limitar crescimento exponencial;
- crianças geradas entram no mesmo save e passam a compor a população da vila.

## Próximo alvo

**v0.5.0 — NPC Brain**

- necessidades;
- traços de personalidade;
- valores;
- objetivos;
- Utility AI;
- decisões explicáveis;
- agenda dinâmica;
- decisões familiares influenciadas por personalidade e condições materiais;
- logs de decisão para depuração.
