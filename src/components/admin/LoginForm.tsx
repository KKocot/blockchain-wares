import { cn } from "../../lib/utils";
import { FIELD_CLASS, LABEL_CLASS } from "./styles";

const LOGIN_ENDPOINT = "/api/auth/login";
const FIELD_ID = "admin-password";
const ERROR_ID = "admin-login-error";

const SUBMIT_CLASS =
  "w-full rounded-md border border-secondary/40 bg-secondary/10 px-3 py-2 text-sm font-semibold text-secondary transition-colors duration-150 hover:border-secondary/60 hover:bg-secondary/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary";

type LoginFormProps = {
  /** Sciezka zwalidowana przez `safe_target` — jedziemy z nia dalej bez zmian. */
  redirect: string;
  error: string | null;
};

/** Renderowany wylacznie na serwerze: bez hydracji strona logowania nie wysyla zadnego zadania z JS-a. */
export function LoginForm({ redirect, error }: LoginFormProps) {
  return (
    // method="post" bez wyjatku i bez formmethod na przycisku: przy GET haslo
    // wyladowaloby w URL-u, logach serwera i historii przegladarki.
    <form
      method="post"
      action={LOGIN_ENDPOINT}
      aria-label="Logowanie do panelu"
      className="space-y-4 rounded-md border border-base-300 bg-base-100 p-5"
    >
      <input type="hidden" name="redirect" value={redirect} />

      <div>
        <label htmlFor={FIELD_ID} className={LABEL_CLASS}>
          Hasło
        </label>
        <input
          id={FIELD_ID}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          aria-invalid={error !== null}
          aria-describedby={error === null ? undefined : ERROR_ID}
          className={cn(
            FIELD_CLASS,
            error !== null &&
              "border-error/60 focus-visible:border-error focus-visible:outline-error",
          )}
        />
      </div>

      {error !== null && (
        <p id={ERROR_ID} role="alert" className="text-sm text-error">
          {error}
        </p>
      )}

      <button type="submit" className={SUBMIT_CLASS}>
        Zaloguj
      </button>

      <p className="text-xs text-base-content/60">
        Sesja jest zapisywana w ciasteczku i wygasa po jej zakończeniu.
      </p>
    </form>
  );
}
