# Vacation planner

This app serves for planning vacations. I have let's say 30 days of vacation per year. I can use them as I want. But in order to choose the dates, I need to see the context in the calendar. Context is:
- How many days I have already used
- When are the public holidays
- When children don't have school
- Which days I already have plans

## Components

### Calendar

Show. the entire year in the same way like in Google Calendar. It's not possible to change the view.
The year is defined in the URL - there is a query parameter `year`.

### Layer selection

There is a sidebar where a user can add layers. Examples of layers:
- Public holidays
- No school days
- Already selected days

Each layer has a color and a name.

## Data model

The data is stored only in the browser in the localStorage in one JSON object.

## Tech stack

- Preact (loaded via `importmap`)
- TailwindCSS
- No bundler needed, just serve the files
- JavaScript
- PNPM

## Development

```bash
pnpm serve
```

## Data

```json
{"layers":[{"id":"vacation","name":"My vacations","color":"#4ade80","active":true,"dates":["2025-12-31","2025-01-01","2025-01-02","2025-01-06"]},{"id":"layer_1745959259240","name":"Festivos","color":"#eaf73b","active":true,"dates":["2025-04-16","2025-04-17","2025-04-30","2025-07-27","2025-08-14","2025-09-14","2025-10-31","2025-12-05","2025-12-07","2025-12-24"]},{"id":"layer_1745959454024","name":"No hay cole","color":"#f73bbb","active":true,"dates":["2025-04-20","2025-04-21","2025-04-22","2025-04-23","2025-04-24"]}],"totalVacationDays":30}
```