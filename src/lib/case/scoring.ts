/**
 * Team standings. Pure, so the board, /admin and the tests all agree.
 *
 * A team's score is the average of its members' points, rounded, plus any points staff
 * awarded the team directly (the in-room game). Averaging keeps a team of eight level with
 * a team of eleven: what counts is how much of the work each person did, not headcount.
 */
export type ScoringTeam = { id: string; name: string; locationId: string; locationName: string };
export type ScoringMember = { id: string; teamId: string | null; points: number };
export type ScoringAward = { teamId: string; points: number };

export type TeamStanding = {
  teamId: string;
  name: string;
  locationId: string;
  locationName: string;
  members: number;
  memberPoints: number;
  average: number;
  awarded: number;
  score: number;
  rank: number;
};

export function teamStandings(teams: ScoringTeam[], members: ScoringMember[], awards: ScoringAward[]): TeamStanding[] {
  const rows = teams.map((team) => {
    const roster = members.filter((member) => member.teamId === team.id);
    const memberPoints = roster.reduce((total, member) => total + member.points, 0);
    const average = roster.length ? Math.round(memberPoints / roster.length) : 0;
    const awarded = awards.filter((award) => award.teamId === team.id).reduce((total, award) => total + award.points, 0);
    return {
      teamId: team.id,
      name: team.name,
      locationId: team.locationId,
      locationName: team.locationName,
      members: roster.length,
      memberPoints,
      average,
      awarded,
      score: average + awarded,
      rank: 0,
    };
  });

  rows.sort((a, b) => b.score - a.score || b.memberPoints - a.memberPoints || a.name.localeCompare(b.name));
  // Ties share a rank (1, 2, 2, 4).
  rows.forEach((row, index) => {
    const previous = rows[index - 1];
    row.rank = previous && previous.score === row.score ? previous.rank : index + 1;
  });
  return rows;
}

/** Deal members without a team across a location's teams, smallest team first, so sizes stay within one. */
export function dealIntoTeams<T extends { id: string; teamId: string | null }>(members: T[], teamIds: string[], random: () => number = Math.random) {
  if (!teamIds.length) return new Map<string, string>();
  const sizes = new Map(teamIds.map((id) => [id, members.filter((member) => member.teamId === id).length]));
  const unassigned = members.filter((member) => !member.teamId || !sizes.has(member.teamId));
  // Shuffle so who arrives first doesn't decide who sits with whom.
  for (let i = unassigned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [unassigned[i], unassigned[j]] = [unassigned[j], unassigned[i]];
  }
  const assignments = new Map<string, string>();
  for (const member of unassigned) {
    const [smallest] = [...sizes.entries()].sort((a, b) => a[1] - b[1] || teamIds.indexOf(a[0]) - teamIds.indexOf(b[0]));
    assignments.set(member.id, smallest[0]);
    sizes.set(smallest[0], smallest[1] + 1);
  }
  return assignments;
}
