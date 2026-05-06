# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Cloudflare remote access

This project is set up to work with a Cloudflare quick tunnel so someone outside your local network can open the app.

1. Start the app in the project folder:
	- `npm run dev -- --host 0.0.0.0`
2. In another terminal, create a quick tunnel:
	- `cloudflared tunnel --url http://localhost:5173`
3. Cloudflared will print a public `https://*.trycloudflare.com` URL.
4. Share that URL with your boss so they can open the app remotely.

If you want, you can also use `npm run preview -- --host 0.0.0.0` and tunnel to port `4173` instead.
