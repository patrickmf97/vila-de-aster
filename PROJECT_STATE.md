# Vila de Aster — Estado do Projeto

## Versão atual

**v0.6.4 — Choice Dialogue**

## Conversa

O motor de diálogo continua determinístico e contextual, mas agora a interface é totalmente baseada em escolhas.

### Estrutura

```text
Assuntos
├── Como você está?
├── O que está fazendo?
├── Quero saber mais sobre você
│   ├── história
│   ├── sonhos
│   ├── preocupações
│   ├── valores
│   ├── lazer
│   ├── lugar favorito
│   ├── profissão
│   ├── relação com o trabalho
│   └── família
├── Quero falar sobre Aster
├── Quero falar sobre as pessoas
├── Memórias
├── O que você lembra sobre mim?
└── Confidências [afinidade >= 55]
```

Após cada resposta, o jogador recebe follow-ups apropriados ao assunto.

## Perfis pessoais

Há um perfil narrativo próprio para:

- Elena;
- Bram;
- Mira;
- Theo;
- Luma.

NPCs gerados recebem fallback narrativo apropriado.

## Consequências

- cada escolha entra no histórico;
- afinidade muda conforme o tipo de assunto;
- memória continua persistente;
- opiniões sobre moradores usam relações reais;
- conhecimento permanece individual;
- confidências dependem de confiança.

## Próximo alvo

**v0.7.0 — Economy & Settlement**

- dinheiro individual;
- renda;
- despesas;
- produção;
- consumo;
- recursos;
- mercado;
- famílias compartilhando custos;
- necessidade de moradia;
- construção;
- expansão física da vila.
