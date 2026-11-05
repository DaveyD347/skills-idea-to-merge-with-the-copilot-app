# Copilot instructions

Project context Copilot should apply to every session in this repository.

## Stack

- Framework: Astro (static output).
- Language: TypeScript.
- Styling: plain CSS in the base layout.

## Conventions

- Keep components small and focused.
- Prefer semantic HTML and accessible markup.
- Do not close, or add closing keywords for, the exercise walkthrough issue (issue #1) in any pull request. The exercise's GitHub Actions workflows manage that issue. When you open a pull request for app work, link only the specific app work-item issue you are implementing.

## Persistence and hydration rules

- Persist bookmarks in browser `localStorage` under the `mona-bookmarks` key.
- Access `localStorage` only in browser-side code. Do not read or write it during Astro server-side rendering or the static build.
- Use Astro's `client:load` directive to hydrate framework components that need browser APIs. `client:load` applies to framework components, not `.astro` components.
- For browser-only behavior in an Astro component, use a processed client `<script>` so the code runs in the browser and is bundled by Astro.
