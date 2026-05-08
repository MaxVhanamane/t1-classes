export function StatusThemeScript() {
  const script = `
    (() => {
      const storedTheme =
        localStorage.getItem("theme");

      const systemDark =
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;

      const resolvedTheme =
        storedTheme === "system" ||
        !storedTheme
          ? systemDark
            ? "dark"
            : "light"
          : storedTheme;

      const color =
        resolvedTheme === "dark"
          ? "#0a0a0a"
          : "#ffffff";

      document
        .querySelector(
          'meta[name="theme-color"]'
        )
        ?.setAttribute(
          "content",
          color,
        );
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: script,
      }}
    />
  );
}
