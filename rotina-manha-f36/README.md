# Rotina da manhã (Forma 36)

Demo clicável da tela "Rotina da manhã", feita com o design system [Forma 36](https://f36.contentful.com/) para um Surface Pro na horizontal (1368×912).

- Relógio acelerado: 30 minutos (09:00 a 09:30) passam em 2 minutos reais. Use **Iniciar/Pausar** e **Reiniciar** no canto superior direito.
- Tarefas sequenciais: só a tarefa atual (losango azul) pode ser marcada; a última concluída pode ser desmarcada.
- Abaixo de cada tarefa: estimativa e prazo (`5 min · até 09:05`). Passou do prazo sem concluir, aparece o badge laranja **Em atraso**.
- A barra de tempo fica laranja nos últimos 5 minutos. Em 09:30 aparecem "Hora de sair!", "Concluído!" ou "Tempo finalizado!".

Os dados de exemplo ficam em `src/data.ts` e as regras em `src/routine.ts`.

## Rodar

```bash
npm install
npm run dev      # abre em http://localhost:5173
npm test         # testes das regras de tempo
npm run build    # gera a versão estática em dist/
```
