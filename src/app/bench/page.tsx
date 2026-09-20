import { redirect } from "next/navigation";

/** The bench has no index of its own; the tickets are listed with the trials. */
export default function BenchIndexPage() {
  redirect("/black-rose");
}
