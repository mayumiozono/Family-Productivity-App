# Rotina em Família

A clickable demo of a family routines app for two working parents and kids aged 5 to 17. It shows the morning and bedtime routines on the living-room TV and lets parents manage them from their phone. The problem it addresses is described in [family-app-problem-summary.md](family-app-problem-summary.md).

The UI is in Portuguese and uses the Keep Design System's color tokens, the Inter font and Keep-style buttons.

## What's in the demo

**TV (📺)**
- One column per person with a photo or emoji and a name. Kids come first, youngest on the left.
- A big countdown to the deadline ("Sair às 07:40").
- Each person's steps are planned backwards from that deadline.
- Three views of the same data:
  - **Picture view** (age 5): one step at a time, with a large picture and a visual timer ring.
  - **Checklist** (age 10, and the parents): the whole list, with the current step highlighted.
  - **Teen view** (age 16): step times shown, and "Editar meus passos" to reorder steps or change their minutes.
- A late step turns amber with the label "Atrasado" and a gentle message. Red is never used.
- A banner appears when 15 and 5 minutes are left. If "Ligar som" is on, a chime also plays, standing in for Alexa.
- The TV remote works: the arrow keys move between buttons and OK (Enter) checks off a step.

**Parents' phone (📱)**
- **Hoje:** demo controls, and each person's current step with a button to check it off for them. Tap a person to see their full list and undo a step.
- **Rotinas:** edit a routine's name, deadline and days. Add a step with an owner, a picture and its minutes, or reorder or remove steps. The start times are recalculated live.
- **Resumo:** a weekly summary of late steps. It uses sample numbers, marked "Exemplo". It also lists today's late or skipped steps from the demo.

**Demo controls** (phone only)
- Play or pause the clock.
- Choose real time or fast-forward, where 1 minute passes every 2 seconds.
- "Família de exemplo marca os passos sozinha" makes the sample family check off steps on their own. Téo's shower and Lia's bath run a few minutes late, so the late state can be seen.
- Jump straight to the morning or the bedtime routine.

The data is saved only in the browser. "Restaurar dados de exemplo" resets it.

## Not in this demo yet

The chores kanban board, activity-kit reminders, rewards, Alexa, WhatsApp and Telegram, the printed weekly sheet, one-off tasks, accounts, and syncing between devices.

## Run it

```bash
npm install
npm run dev              # http://localhost:5173
npm test                 # scheduling unit tests
npm run build:artifact   # builds a single self-contained HTML file in artifact/
```

## Where things are

| Path | What |
|---|---|
| `src/lib/schedule.ts` | Backwards planning, step status, and which routine is active |
| `src/state/store.tsx` | App state, the simulated clock, autopilot and late logging |
| `src/data/sample.ts` | The sample family, routines and weekly numbers |
| `src/i18n/pt-BR.ts` | All UI text in one file |
| `src/styles/keep.css` | Keep Design System tokens, text styles, buttons, badges and inputs |
| `src/tv/`, `src/phone/` | The two screens |
