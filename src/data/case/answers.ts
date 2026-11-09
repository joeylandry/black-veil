/**
 * Accepted answers for each week's finding. SERVER-ONLY: imported by /api/finding and the
 * case self-check script, never by a page or a client component.
 *
 * Answers are compared after normalizeAnswer() (lowercase, letters and digits only), so
 * "11:47", "11.47" and "1147" are one answer. List each spelling a reasonable reader
 * might type; keep the questions answerable from the visible text of the exhibit.
 */
export const findingAnswers: Record<number, string[]> = {
  1: ["11:47", "11:47 pm", "11:47 p.m.", "eleven forty seven", "eleven forty-seven", "1147pm"],
  2: ["Thayer", "Ambrose Thayer", "Capt. Thayer", "Captain Thayer", "Capt Ambrose Thayer", "Captain Ambrose Thayer"],
  3: ["Look before you leap"],
  4: ["The Counting Room", "Counting Room", "Counting"],
  5: ["Kessler", "Kit Kessler", "Christopher Kessler", "Mr. Kessler", "Kit", "Christopher J. Kessler", "C. Kessler"],
  6: ["Montreal", "Montréal", "Montreal Quebec", "Montreal, Que", "Montreal QC"],
  7: ["Capt. A.T.", "Capt AT", "Captain A.T.", "Thayer", "Captain Thayer", "Capt. Thayer", "Ambrose Thayer", "Captain Ambrose Thayer"],
  8: ["Cyanide", "Prussic acid", "Hydrogen cyanide", "Potassium cyanide"],
  9: ["60", "060", "Sixty", "No. 60", "Number 60", "#60"],
  10: ["Whitcomb", "Horace Whitcomb", "Horace B. Whitcomb", "Judge Whitcomb", "Justice Whitcomb", "Judge H.W."],
};
