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
