type NutritionRow = { label: string; amount: string };

export type LabelFields = {
  ingredients: string;
  servingSize: string | null;
  servingsPerPack: number | null;
  nutritionFacts: string | null;
  directions: string | null;
  warnings: string | null;
  allergens: string | null;
  storage: string | null;
  manufacturer: string | null;
  fssaiLicense: string | null;
  countryOfOrigin: string | null;
  shelfLifeMonths: number | null;
};

/** Tolerates the older rows where the column is absent or not valid JSON. */
function parseNutrition(raw: string | null): NutritionRow[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((r): r is NutritionRow => Boolean(r) && typeof r.label === "string")
      .map((r) => ({ label: r.label, amount: String(r.amount ?? "") }));
  } catch {
    return [];
  }
}

function parseList(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="border-t border-line py-4">
      <dt className="text-xs uppercase tracking-widest text-ink-faint">{label}</dt>
      <dd className={`mt-1 text-sm ${value ? "text-ink" : "text-ink-faint italic"}`}>
        {value || "Not provided"}
      </dd>
    </div>
  );
}

/**
 * The label / compliance block.
 *
 * Rendered for every product whether or not the fields are filled in: a
 * supplement page that silently omits its dosage, warnings and licence details
 * looks complete when it isn't, and the gap is invisible to whoever published
 * it. Empty fields read "Not provided" so the omission is on the page.
 */
export function ProductLabelPanel({ product }: { product: LabelFields }) {
  const nutrition = parseNutrition(product.nutritionFacts);
  const ingredients = parseList(product.ingredients);

  return (
    <section id="label" className="mt-24 scroll-mt-24 border-t border-line pt-12">
      <h2 className="text-display text-3xl font-medium">Supplement facts</h2>
      <p className="mt-2 max-w-2xl text-sm text-ink-soft">
        Everything printed on the label, reproduced here so you can read it before you buy.
      </p>

      <div className="mt-10 grid gap-12 lg:grid-cols-2">
        <div>
          <h3 className="font-heading text-lg font-medium tracking-tight">
            Nutritional information
          </h3>
          {nutrition.length > 0 ? (
            <table className="mt-4 w-full text-sm">
              <caption className="sr-only">Nutritional information per serving</caption>
              <thead>
                <tr className="border-b border-line-strong text-left">
                  <th scope="col" className="py-2 font-medium">
                    Nutrient
                  </th>
                  <th scope="col" className="py-2 text-right font-medium">
                    Per serving
                  </th>
                </tr>
              </thead>
              <tbody>
                {nutrition.map((row) => (
                  <tr key={row.label} className="border-b border-line">
                    <th scope="row" className="py-2 text-left font-normal text-ink-soft">
                      {row.label}
                    </th>
                    <td className="py-2 text-right">{row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="mt-4 text-sm italic text-ink-faint">Not provided</p>
          )}

          <h3 className="font-heading mt-10 text-lg font-medium tracking-tight">
            Full ingredient list
          </h3>
          {ingredients.length > 0 ? (
            <ul className="mt-4 space-y-2 text-sm text-ink-soft">
              {ingredients.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm italic text-ink-faint">Not provided</p>
          )}
        </div>

        <div>
          <dl>
            <Field label="Serving size" value={product.servingSize} />
            <Field
              label="Servings per pack"
              value={product.servingsPerPack ? String(product.servingsPerPack) : null}
            />
            <Field label="Directions for use" value={product.directions} />
            <Field label="Allergen information" value={product.allergens} />
            <Field label="Storage" value={product.storage} />
            <Field
              label="Shelf life"
              value={product.shelfLifeMonths ? `${product.shelfLifeMonths} months` : null}
            />
            <Field label="Manufactured by" value={product.manufacturer} />
            <Field label="Country of origin" value={product.countryOfOrigin} />
            <Field label="FSSAI licence" value={product.fssaiLicense} />
          </dl>
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-line bg-paper-soft p-6">
        <h3 className="font-heading text-base font-medium tracking-tight">
          Warnings &amp; precautions
        </h3>
        <p className={`mt-2 text-sm ${product.warnings ? "text-ink-soft" : "italic text-ink-faint"}`}>
          {product.warnings || "Not provided"}
        </p>
        <p className="mt-4 border-t border-line pt-4 text-xs leading-relaxed text-ink-soft">
          This is a nutritional supplement, not a medicine. It is not intended to diagnose,
          treat, cure or prevent any disease. Not a substitute for a varied, balanced diet and
          a healthy lifestyle. Keep out of reach of children. Consult a registered medical
          practitioner before use if you are pregnant, breastfeeding, taking prescribed
          medication or managing a health condition.
        </p>
      </div>
    </section>
  );
}
