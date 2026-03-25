import { LandingHome } from "@/components/landing/landing-home";
import { getAuthSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getAuthSession();

  return <LandingHome signedIn={Boolean(session)} />;
}
