/** Ember error note, same style as the auth screens. */
export function FormError({ message, className }: { message?: string; className?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className={`rounded-2xl border border-ember/20 bg-ember-soft px-4 py-3 text-sm text-ember-deep ${className ?? ""}`}
    >
      {message}
    </p>
  );
}
