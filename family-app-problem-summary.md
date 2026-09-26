# Family Routines App: Problem Definition

Written from the Q&A session on 2026-09-26.

## Who it's for
- **The family:** two working parents, with kids aged 5 to 17.
- **Devices:** only the parents have phones. At home there's a smart TV, an Alexa and a printed calendar.
- **Who it serves:** the whole household equally, not just the organizing parent.
- **What they use today:** Google Calendar, WhatsApp, Telegram and paper calendars. Only one parent keeps them up to date.

## Problems to solve
1. **Chaotic daily routines.** Mornings and bedtime are rushed, and people run late.
2. **Poor communication.** Information is scattered across chats and calendars, so family members say "I didn't know I had to do that."
3. **Uneven mental load.** One parent plans and reminds everyone, partly because of cultural gender-role habits.
4. **Forgetting and low follow-through.** Dad and son forget tasks and depend on others to get the essentials done, often because they lack interest or motivation. The app has to supply structure, prompts and motivation rather than rely on memory or willpower.

## How we'll know it works
- Fewer forgotten or delayed tasks.
- Fewer conflicts and arguments.

## Design principles
- **Visible to everyone.** A family board works like a kanban (To do, Doing, Done), so everyone can see who owns what and who carries the load.
- **Neurodivergent-friendly by default.** Show one step at a time, use visual timers and pictures over text, keep routines predictable, and never scold.
- **Plan backwards from deadlines.** For example, "leave at 7:40" produces step times and a visible countdown. Upcoming important events also get reminders.
- **Different views by age.** Picture checklists for the youngest kids, simple lists for the middle ones, and teens who own their own tasks. The data underneath is the same.
- **Flexible setup.** Parents guide the younger kids, and the older kids help define the schedule.
- **Motivation.** Parents can turn on optional rewards for each child. Siblings are never ranked against each other.
- **Works alongside the family's chats.** WhatsApp and Telegram stay. The app is the one place tasks and routines live, and it sends reminders or summaries out to those chats.

## Where family members see it
- **Smart TV:** the shared family board and the morning countdown.
- **Alexa:** spoken reminders ("15 minutes until we leave") and hands-free check-offs.
- **Printed weekly calendar:** a fallback, and for the youngest kids.
- **Parents' phones:** adding tasks and managing everything.

## Scope for the first draft
- **First:** recurring routines (morning, bedtime, chores, activity kits) with owners and due times.
- **Later:** capturing one-off tasks (school forms, appointments, bills).

## Still open
- Which app features go in the first draft, and in what order.
- Which tech stack to use. React + Vite was suggested but not confirmed. Displaying on a TV and integrating with Alexa both affect this choice.
