import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;

  return (
    <div className="flex min-h-screen justify-center items-center bg-background">
      {/* Hauptcontainer für Formular und Bild */}
      <div className="w-full max-w-screen-xl flex justify-between items-center px-5">

        {/* Linkes Formular */}
        <form className="w-full md:w-1/2 max-w-md flex flex-col gap-6 px-6 py-8 border border-border rounded-lg shadow-md bg-white h-[50vh]">
          <h1 className="text-2xl font-medium text-center">Anmelden</h1>
          <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
            <Label htmlFor="email">E-Mail</Label>
            <Input name="email" placeholder="schiedsrichter@bfv.de" required />
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Passwort</Label>
              <Link
                className="text-xs text-foreground underline"
                href="/forgot-password"
              >
                Passwort vergessen?
              </Link>
            </div>
            <Input
              type="password"
              name="password"
              placeholder="Dein Passwort"
              required
            />
            <SubmitButton pendingText="Wird angemeldet..." formAction={signInAction}>
              Anmelden
            </SubmitButton>
            <FormMessage message={searchParams} />
          </div>
        </form>

        {/* Rechter Bereich mit Bild */}
        <div className="w-full md:w-1/2 h-[50vh] flex justify-center items-center mb-8 md:mb-0">
          <Image
            src="/bfv-kampage.jpg"  // Dein Bild-Link hier
            alt="Login Illustration"
            width={800}
            height={450}
            className="rounded-lg shadow-md object-cover"
          />
        </div>

      </div>
    </div>
  );
}
