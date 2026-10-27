/**
 * The story world every LEAP simulation is set in.
 *
 * Every name a simulation uses comes from here, so a location can rename the firm, the
 * platform or the cast in one file and every lab follows. The firm and its people are
 * fictional; the trading concepts are real.
 */

export const story = {
  program: "LEAP",
  firm: "Harborview Investments",
  platform: "ATLAS",
  platformLong: "ATLAS — the Integrated Trading Platform",
  team: "Squad Lighthouse",
  assistant: "Copilot",
  cast: {
    po: "Priya Raman",
    poRole: "Product Owner",
    trader: "Marcus Bell",
    traderRole: "Equity trader",
    lead: "Dana Okafor",
    leadRole: "Engineering lead",
    ops: "Sofia Reyes",
    opsRole: "Trade operations analyst",
    risk: "Leo Fischer",
    riskRole: "Compliance & risk",
    sre: "Jamal Carter",
    sreRole: "Site reliability engineer",
  },
} as const;

/** The life of a trade, in order. Several labs come back to it. */
export const lifeOfATrade = [
  "Order entry — the client or trader fills in the order ticket",
  "Validation & pre-trade risk checks — buying power, limits, restricted list",
  "Routing — the order is sent to an exchange or venue",
  "Execution — the order fills (all at once or in parts)",
  "Confirmation — the client is told what was bought or sold, at what price",
  "Clearing — the trade is matched and obligations are calculated",
  "Settlement — cash and securities change hands (T+1 for US equities)",
  "Positions & reporting — books, statements, and regulatory reports update",
];

/**
 * The ATLAS sample database. Seeded verbatim into a throwaway in-memory Postgres for every
 * SQL task (see src/app/api/leap/sql/route.ts). It is printed on the page, so it holds no
 * secrets. Two data defects are planted on purpose for the testing labs.
 */
export const tradingSchemaSql = `create table accounts (
  id             integer primary key,
  account_number text    not null unique,
  owner_name     text    not null,
  account_type   text    not null,  -- INDIVIDUAL, IRA, INSTITUTIONAL
  branch         text    not null
);

create table securities (
  symbol      text primary key,
  name        text not null,
  asset_class text not null,        -- EQUITY, ETF
  exchange    text not null
);

create table orders (
  id          integer primary key,
  account_id  integer   not null references accounts(id),
  symbol      text      not null references securities(symbol),
  side        text      not null,   -- BUY, SELL
  order_type  text      not null,   -- MARKET, LIMIT
  quantity    integer   not null,
  limit_price numeric(10,2),        -- only for LIMIT orders
  status      text      not null,   -- NEW, PARTIALLY_FILLED, FILLED, CANCELLED, REJECTED
  created_at  timestamp not null
);

create table executions (
  id          integer primary key,
  order_id    integer       not null references orders(id),
  quantity    integer       not null,
  price       numeric(10,2) not null,
  executed_at timestamp     not null
);

insert into accounts values
  (1, 'A-1001', 'Rosa Delgado',         'INDIVIDUAL',    'Boston'),
  (2, 'A-1002', 'Kenji Watanabe',       'IRA',           'Boston'),
  (3, 'A-1003', 'Harbor Pension Fund',  'INSTITUTIONAL', 'Westlake'),
  (4, 'A-1004', 'Amara Nwosu',          'INDIVIDUAL',    'Merrimack'),
  (5, 'A-1005', 'Owen Pratt',           'IRA',           'Raleigh');

insert into securities values
  ('ORCA', 'Orca Robotics',             'EQUITY', 'NYSE'),
  ('KITE', 'Kite Logistics',            'EQUITY', 'NASDAQ'),
  ('MAPL', 'Maple Grid Energy',         'EQUITY', 'NYSE'),
  ('QUIL', 'Quill Health',              'EQUITY', 'NASDAQ'),
  ('ZEPH', 'Zephyr Total Market ETF',   'ETF',    'NYSE');

insert into orders values
  (1,  1, 'ORCA', 'BUY',  'MARKET', 100,  null,   'FILLED',           '2026-10-26 09:31'),
  (2,  2, 'KITE', 'BUY',  'LIMIT',  200,  41.50,  'PARTIALLY_FILLED', '2026-10-26 09:35'),
  (3,  3, 'ZEPH', 'BUY',  'LIMIT',  5000, 112.00, 'FILLED',           '2026-10-26 09:40'),
  (4,  2, 'MAPL', 'SELL', 'LIMIT',  150,  78.25,  'NEW',              '2026-10-26 09:52'),
  (5,  4, 'QUIL', 'BUY',  'MARKET', 50,   null,   'FILLED',           '2026-10-26 10:05'),
  (6,  1, 'KITE', 'SELL', 'LIMIT',  80,   43.00,  'CANCELLED',        '2026-10-26 10:11'),
  (7,  3, 'ORCA', 'SELL', 'LIMIT',  100,  64.00,  'FILLED',           '2026-10-26 10:20'),
  (8,  5, 'ZEPH', 'BUY',  'MARKET', 30,   null,   'REJECTED',         '2026-10-26 10:26'),
  (9,  2, 'ORCA', 'BUY',  'LIMIT',  120,  63.00,  'PARTIALLY_FILLED', '2026-10-26 10:44'),
  (10, 4, 'MAPL', 'BUY',  'LIMIT',  60,   77.50,  'FILLED',           '2026-10-26 11:02'),
  (11, 3, 'KITE', 'BUY',  'MARKET', 1000, null,   'FILLED',           '2026-10-26 11:15'),
  (12, 5, 'QUIL', 'SELL', 'LIMIT',  40,   55.00,  'NEW',              '2026-10-26 11:30'),
  (13, 2, 'ZEPH', 'BUY',  'LIMIT',  25,   111.00, 'NEW',              '2026-10-26 11:48');

insert into executions values
  (1,  1,  100,  63.80,  '2026-10-26 09:31:02'),
  (2,  2,  120,  41.48,  '2026-10-26 09:36:10'),
  (3,  3,  3000, 111.95, '2026-10-26 09:41:00'),
  (4,  3,  2000, 111.98, '2026-10-26 09:43:30'),
  (5,  5,  50,   54.10,  '2026-10-26 10:05:01'),
  (6,  7,  60,   64.00,  '2026-10-26 10:21:00'),
  (7,  7,  60,   64.05,  '2026-10-26 10:22:15'),
  (8,  9,  50,   62.95,  '2026-10-26 10:46:40'),
  (9,  11, 600,  42.10,  '2026-10-26 11:15:01'),
  (10, 11, 400,  42.12,  '2026-10-26 11:15:03');`;
