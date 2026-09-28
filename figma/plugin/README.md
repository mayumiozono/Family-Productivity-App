# Plugin: Rotina em Família – Telas do celular

Gera no Figma as telas do celular dos pais, com os tokens e componentes do Keep Design System e os fluxos de cada cenário.

## Como rodar

1. Abra o **app desktop do Figma**. Plugins de desenvolvimento não rodam no navegador.
2. Abra o arquivo **Rotina em família**.
3. Vá em **Menu › Plugins › Development › Import plugin from manifest…** e escolha o `manifest.json` desta pasta.
4. Vá em **Menu › Plugins › Development › Rotina em Família – Telas do celular**.

O plugin leva alguns segundos e mostra uma mensagem no final. Se você rodar de novo, ele apaga o que criou antes e recria tudo.

## O que ele cria

**Tokens do Keep, com os mesmos nomes do sistema:**
- Coleção de variáveis **Keep · Colors** (`Colors/Primary/main-color`, `Colors/Warning/surface` etc.).
- Estilos de texto (`Headline: 6/Bold`, `Paragraph: 5/Regular` etc.), todos em Inter.
- Estilos de efeito (`Shadow/sm`, `Shadow/xl` e `Focus/md/primary/50`).

**Página “Keep · Componentes locais”**, com componentes e variantes:
- **Da biblioteca de Navegação do Keep:** Button, com os tipos Primary, Secondary, Secondary Gray, Tertiary, Dash Border e Link Color, os tamanhos xsm e sm, e a variante só com ícone.
- **Criados com os tokens do Keep**, porque o Keep não tem esses componentes: Badge, Avatar, Status bar, Top bar, Tab bar, Alert, Routine today, Person card, Step line, Editable step, Owner header, Input, Day chip, Picture option, Routine card e Person bar.

**Página “Fluxos APP”**, com uma seção por cenário:

| Cenário | Telas |
|---|---|
| 1 · Acompanhar a manhã (P1) | 1.1 Hoje – Téo atrasado → 1.2 Passos do Téo → 1.3 Banho marcado como feito |
| 2 · Editar a rotina da manhã (P1) | 2.1 Rotinas → 2.2 Editar rotina → 2.3 Adicionar passo → 2.4 Passo adicionado → 2.5 Rotina salva |
| 3 · Ver o resumo da semana | 3.1 Hoje → 3.2 Resumo da semana |

Cada seção começa com um cartão **“Início do fluxo”**, que diz qual cenário ela representa, quem usa e quais telas fazem parte dele. Também tem:
- **Setas no estilo do Autoflow:** um ponto no elemento tocado, uma linha com cantos arredondados e uma ponta de seta na próxima tela, com a ação escrita (“Toca no Téo”, “Salvar”…).
- **Interações de protótipo** nos mesmos elementos, e um ponto de início de fluxo por cenário. Você pode apresentar cada cenário no modo Present.

## Observações

- **Autoflow:** o plugin não controla outros plugins. Se preferir as setas do próprio Autoflow, apague as camadas “Seta – …” e “Origem”, selecione o elemento e a tela de destino e rode o Autoflow.
- **Keep como biblioteca:** se você publicar o Keep e adicioná-lo ao arquivo, dá para trocar as variáveis locais pelas da biblioteca, porque os nomes são os mesmos. Use **Swap library** no painel de Assets.
- **Controles da demonstração:** acelerar e pausar o relógio não aparecem nas telas. Eles só existem no demo e não fazem parte do produto.
