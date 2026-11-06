const modules = import.meta.glob("./experiments/*.jsx", {
  eager: true
});

export const SANDBOX = {};

for (const [path, module] of Object.entries(modules)) {

  const name = path
    .replace("./experiments/", "")
    .replace(".jsx", "");

  SANDBOX[name] = module.default;
}