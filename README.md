# React + Vite

> **Branch `pree-dev` — paper submission snapshot.**
> This branch freezes the web dashboard frontend (React + Vite) as described in the MDPI *Sensors* paper
> "Multi-Camera Smart Parking on Orange Pi and Jetson" (Thiengburanathum et al.).
> It was branched from `dev` on 2026-10-08, matching the deployed images
> `time5013/spl-frontend:v14`. Changes made for the paper are merged back to `dev` by pull request.
> Ongoing development continues on `dev`.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

urrently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
