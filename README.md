# Grandland mileage cockpit

A static HTML/CSS/JavaScript mileage tracker inspired by the 2025 Vauxhall Grandland digital instrument display. No dependencies, build step or backend.

Open `index.html` locally, or publish the repository root with GitHub Pages.

## Agreement

- Start: 10 August 2026 at 10,994 miles
- End: 10 August 2030
- Allowance: 40,000 additional miles
- Final odometer limit: 50,994 miles

Targets use elapsed calendar days / 1,461, with dates interpreted in Europe/London. Targets clamp at the starting reading before the agreement and the final limit after it. Display values round to the nearest mile. The average daily pace is approximately 27.38 miles.

Actual readings are stored only in the current browser's localStorage. They do not sync across devices or get committed to GitHub. Clearing browser data removes the reading. Export creates a CSV backup. Position compares the reading against its recorded date, so older readings are explicitly labelled. Projections extrapolate the average mileage since agreement start; they are estimates rather than contractual advice.

## GitHub Pages

In repository Settings > Pages, choose **Deploy from a branch**, select **main** and **/ (root)**, then save. Private repositories require a GitHub plan supporting Pages; the site may be publicly accessible even if its source repository is private. The agreement details are included in the source and page. No analytics or external assets are loaded.

## Features

Live target odometer, future date planner and slider, current reading, under/over target status, remaining allowance, projected final odometer, Pure mode, CSV export and responsive layout.

## Design reference

Original interface inspired by the wide, minimal digital display described by Vauxhall: https://www.media.stellantis.com/uk-en/vauxhall/press/vauxhall-unveils-next-generation-grandland

Independent project. Not affiliated with Vauxhall.
