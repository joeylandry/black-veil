# Future private game boundary

The public application currently contains no attendee roster, assigned aliases, murderer, victim, secrets, relationship graph, evidence ownership, accusation mechanics, or score values.

`models.ts` defines only the shape of future data. Final dossier records should live in authenticated server-side storage so private fields never ship in static JavaScript. Real RSVP identity and fictional character identity remain separate records joined by an internal identifier.

The model deliberately supports two linked investigations—Cassandra Castello and the unresolved 1924 masquerade, plus the future 1926 murder—without choosing their connection. Digital archive records may later reference physical props by stable IDs, and an investigation result may independently record theories for both cases and their connection.
