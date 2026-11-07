/**
 * The teams a new room starts with: six streets around 245 Summer Street. Ten people a
 * team in a room of sixty. Staff can rename, add or remove teams per room in /admin.
 *
 * These are deliberately neutral. The in-room game will give every person a 1926
 * character in one of six circles (docs/story/04-room-game-draft.md); the circles are a
 * surprise and stay off the site until then.
 */
export const defaultTeamNames = ["Atlantic", "Bedford", "Congress", "Essex", "Kingston", "Purchase"] as const;
