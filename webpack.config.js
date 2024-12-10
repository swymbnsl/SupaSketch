module.exports = {
  // ... other config
  resolve: {
    alias: {
      "@tldraw/utils": path.resolve("./node_modules/@tldraw/utils"),
      "@tldraw/state": path.resolve("./node_modules/@tldraw/state"),
      "@tldraw/state-react": path.resolve("./node_modules/@tldraw/state-react"),
      "@tldraw/store": path.resolve("./node_modules/@tldraw/store"),
      "@tldraw/validate": path.resolve("./node_modules/@tldraw/validate"),
      "@tldraw/tlschema": path.resolve("./node_modules/@tldraw/tlschema"),
      "@tldraw/editor": path.resolve("./node_modules/@tldraw/editor"),
      tldraw: path.resolve("./node_modules/tldraw"),
    },
  },
};
