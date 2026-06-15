# HiTZordu product brief

## Problem

HiTZ taldeko bilerak antolatzean, parte-hartzaileek ez dute beti aukera binarioa
eman nahi: batzuetan ordu bat posible da, baina ez lehentasunezkoa. Gainera,
behin tartea aukeratuta, egutegira eramatea erraza izan behar da.

## Scope for the first prototype

- Multiple meeting definitions.
- Meeting setup before availability collection:
  - title
  - dated or weekly meeting mode
  - possible dates through a clickable calendar
  - weekdays for general meetings without specific dates
  - start and end time
  - duration
- Three availability states per participant:
  - unavailable
  - if-need-be
  - available
- Cell click cycle: available, if-need-be, clear.
- Local summary of group fit.
- Calendar export through an `.ics` download.
- Lightweight Node backend with JSON-file persistence.

## Not in scope yet

- Authentication.
- Email invitations.
- External calendar two-way sync.
- Time zone collaboration across regions.
- Public share URLs per meeting.

## Product decisions to revisit

- Whether `if-need-be` should count as half weight or as a separate rank.
- Whether the final chosen meeting time should be a single slot or a continuous
  range.
- Whether event owners can lock or hide responses.
- Whether the app should be bilingual from the start.
