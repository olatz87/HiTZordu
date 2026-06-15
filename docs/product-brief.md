# HiTZordu product brief

## Problem

HiTZ taldeko bilerak antolatzean, parte-hartzaileek ez dute beti aukera binarioa
eman nahi: batzuetan ordu bat posible da, baina ez lehentasunezkoa. Gainera,
behin tartea aukeratuta, egutegira eramatea erraza izan behar da.

## Scope for the first prototype

- One shared event grid.
- Three availability states per participant:
  - unavailable
  - if-need-be
  - available
- Local summary of group fit.
- Calendar export through an `.ics` download.
- Lightweight Node backend with JSON-file persistence.

## Not in scope yet

- Authentication.
- Email invitations.
- External calendar two-way sync.
- Time zone collaboration across regions.
- Multiple event URLs.

## Product decisions to revisit

- Whether `if-need-be` should count as half weight or as a separate rank.
- Whether the final chosen meeting time should be a single slot or a continuous
  range.
- Whether event owners can lock or hide responses.
- Whether the app should be bilingual from the start.
