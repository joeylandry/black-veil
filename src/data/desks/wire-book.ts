/**
 * The Lantern Room wire book, as the archive normalised it during digitisation.
 *
 * From 1923 the club kept a private wire to a Boston brokerage: a patron wrote an order slip at
 * the Lantern Room desk, the steward wired it to Boston, and the fills came back down the same
 * wire. The slips and fills are fictional; the companies are real firms of the period, used as
 * context in the same way the archive uses Elm Street and the Amoskeag mills.
 *
 * Seeded verbatim into a throwaway in-memory Postgres for every SQL ticket. Published on the
 * page, so it holds no answers — two transcription defects are planted in it on purpose.
 */
export const wireBookSchemaSql = `create table patrons (
  id          integer primary key,
  account_no  text    not null unique,
  full_name   text    not null,
  standing    text    not null   -- MEMBER, GUEST, SOCIETY
);

create table securities (
  symbol    text primary key,
  name      text not null,
  exchange  text not null        -- BOSTON, NEW YORK
);

create table slips (
  id           integer   primary key,
  patron_id    integer   not null references patrons(id),
  symbol       text      not null references securities(symbol),
  side         text      not null,   -- BUY, SELL
  order_type   text      not null,   -- MARKET, LIMIT
  shares       integer   not null,
  limit_price  numeric(10,2),        -- LIMIT slips only
  status       text      not null,   -- NEW, PARTIALLY_FILLED, FILLED, CANCELLED, REJECTED
  wired_at     timestamp not null
);

create table fills (
  id         integer       primary key,
  slip_id    integer       not null references slips(id),
  shares     integer       not null,
  price      numeric(10,2) not null,
  filled_at  timestamp     not null
);

insert into patrons values
  (1, 'W-1001', 'Eleanor Downes',            'MEMBER'),
  (2, 'W-1002', 'Joseph Ruel',               'MEMBER'),
  (3, 'W-1003', 'Merrimack Mutual Society',  'SOCIETY'),
  (4, 'W-1004', 'Alice Thayer',              'GUEST'),
  (5, 'W-1005', 'Henry Pike',                'GUEST');

insert into securities values
  ('AMOS', 'Amoskeag Manufacturing Co.',    'BOSTON'),
  ('RCA',  'Radio Corporation of America',  'NEW YORK'),
  ('BMR',  'Boston & Maine Railroad',       'BOSTON'),
  ('GM',   'General Motors Corp.',          'NEW YORK'),
  ('USS',  'United States Steel Corp.',     'NEW YORK');

insert into slips values
  (1,  1, 'AMOS', 'BUY',  'MARKET', 100,  null,   'FILLED',           '1924-10-27 09:31'),
  (2,  2, 'RCA',  'BUY',  'LIMIT',  200,  41.50,  'PARTIALLY_FILLED', '1924-10-27 09:35'),
  (3,  3, 'USS',  'BUY',  'LIMIT',  5000, 112.00, 'FILLED',           '1924-10-27 09:40'),
  (4,  2, 'BMR',  'SELL', 'LIMIT',  150,  78.25,  'NEW',              '1924-10-27 09:52'),
  (5,  4, 'GM',   'BUY',  'MARKET', 50,   null,   'FILLED',           '1924-10-27 10:05'),
  (6,  1, 'RCA',  'SELL', 'LIMIT',  80,   43.00,  'CANCELLED',        '1924-10-27 10:11'),
  (7,  3, 'AMOS', 'SELL', 'LIMIT',  100,  64.00,  'FILLED',           '1924-10-27 10:20'),
  (8,  5, 'USS',  'BUY',  'MARKET', 30,   null,   'REJECTED',         '1924-10-27 10:26'),
  (9,  2, 'AMOS', 'BUY',  'LIMIT',  120,  63.00,  'PARTIALLY_FILLED', '1924-10-27 10:44'),
  (10, 4, 'BMR',  'BUY',  'LIMIT',  60,   77.50,  'FILLED',           '1924-10-27 11:02'),
  (11, 3, 'RCA',  'BUY',  'MARKET', 1000, null,   'FILLED',           '1924-10-27 11:15'),
  (12, 5, 'GM',   'SELL', 'LIMIT',  40,   55.00,  'NEW',              '1924-10-27 11:30'),
  (13, 2, 'USS',  'BUY',  'LIMIT',  25,   111.00, 'NEW',              '1924-10-27 11:48');

insert into fills values
  (1,  1,  100,  63.80,  '1924-10-27 09:33'),
  (2,  2,  120,  41.48,  '1924-10-27 09:41'),
  (3,  3,  3000, 111.95, '1924-10-27 09:47'),
  (4,  3,  2000, 111.98, '1924-10-27 09:52'),
  (5,  5,  50,   54.10,  '1924-10-27 10:09'),
  (6,  7,  60,   64.00,  '1924-10-27 10:26'),
  (7,  7,  60,   64.05,  '1924-10-27 10:31'),
  (8,  9,  50,   62.95,  '1924-10-27 10:52'),
  (9,  11, 600,  42.10,  '1924-10-27 11:19'),
  (10, 11, 400,  42.12,  '1924-10-27 11:24');`;

