# Characters & Animation — v0.8.1

## Objetivo

Evoluir o visual dos personagens sem substituir o estilo original por sprites genéricos.

Aster mantém personagens desenhados com primitivas do Phaser, mas passa a usar composição modular.

## Estrutura visual

Cada NPC é composto por:

```text
shadow
visualRoot
├── feet
├── arms
├── body
├── clothing trim
├── hair back
├── head
├── hair top
├── hair highlight
├── eyes
├── mouth
├── accessory
└── activity prop
```

A animação trabalha principalmente sobre `visualRoot`, permitindo movimento sem reposicionar o NPC lógico.

## CharacterVisualStyle

Cada estilo define:

- skin;
- hair;
- hairLight;
- outfit;
- trim;
- shoes;
- bodyScaleX;
- bodyScaleY;
- headScale;
- hairStyle;
- accessory;
- workProp;
- idleProp.

## Perfis principais

### Elena
- silhueta leve;
- cabelo ondulado;
- detalhe floral;
- planta como prop de trabalho.

### Bram
- corpo mais largo;
- cabelo curto;
- paleta terrosa/metálica;
- martelo.

### Mira
- paleta verde/dourada;
- coque;
- caixa de mercadorias.

### Theo
- azul/bege;
- cabelo solto;
- vara de pesca.

### Luma
- vinho/dourado;
- visual acolhedor;
- utensílio de taverna.

## NPCs gerados

Quando não existe perfil nomeado:

```text
id
  ↓
hash determinístico
  ↓
tom de pele + cabelo + cor
  ↓
fallback de profissão
```

Isso preserva consistência entre reloads.

## Animações

### Walk
- pés alternados;
- braços alternados;
- bob;
- pequena rotação;
- sombra comprimida no passo.

### Work
- objeto profissional;
- braço dominante;
- balanço do corpo.

### Fish
- vara;
- movimento de puxada.

### Socialize
- gestos de braços;
- leve inclinação.

### Sleep
- olhos fechados;
- corpo inclinado;
- ZZZ.

### Eat / Investigate / Play
Cada atividade possui prop e pose específica.

## Interiores

O visual interno agora usa:

- madeira/tábuas;
- tapete;
- janelas;
- sombra;
- highlights;
- porta mais acolhedora.

## Performance

Não foram adicionados spritesheets, imagens externas ou bibliotecas.

O sistema continua baseado em Phaser Graphics/Text, com custo pequeno por NPC.
