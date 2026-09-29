/**
 * Genera una demo autònoma (un sol fitxer HTML) de la web: pantalla de parella + web pública,
 * amb una lliga simulada en memòria i noms inventats.  Ús: node demo/build.mjs <sortida.html>
 */
import { build } from "esbuild";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const web = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const out = process.argv[2] ?? path.join(web, "demo-dist", "lliga-demo.html");

const globals = {
  name: "react-globals",
  setup(b) {
    b.onResolve({ filter: /^react(-dom)?(\/client|\/jsx-runtime)?$/ }, (a) => ({ path: a.path, namespace: "global" }));
    b.onLoad({ filter: /.*/, namespace: "global" }, (a) => ({
      contents:
        a.path === "react/jsx-runtime"
          ? `const R = window.React; const jsx = (t, p, k) => R.createElement(t, k === undefined ? p : { ...p, key: k });
             module.exports = { jsx, jsxs: jsx, Fragment: R.Fragment };`
          : `module.exports = window.${a.path.startsWith("react-dom") ? "ReactDOM" : "React"};`,
      loader: "js",
    }));
  },
};

const result = await build({
  entryPoints: [path.join(web, "demo/main.tsx")],
  bundle: true,
  write: false,
  format: "iife",
  minify: true,
  target: "es2020",
  jsx: "automatic",
  define: { "process.env.NODE_ENV": '"production"', "process.env.API_URL": '""' },
  resolveExtensions: [".tsx", ".ts", ".js"],
  plugins: [globals],
  tsconfig: path.join(web, "tsconfig.json"),
  logLevel: "warning",
});
const js = result.outputFiles[0].text.replace(/<\/script/g, "<\\/script");
const css = readFileSync(path.join(web, "app/globals.css"), "utf8") + readFileSync(path.join(web, "demo/demo.css"), "utf8");

const html = `<title>Lliga Social de Pàdel</title>
<meta name="description" content="Demo navegable de la web de la Lliga Social de Pàdel del CT&P El Masnou.">
<style>${css}</style>
<div id="root"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script>${js}</script>
`;
writeFileSync(out, html);
console.log(`Demo: ${out} (${(html.length / 1024).toFixed(0)} KB)`);
