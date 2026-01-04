interface ProductStone {
  id?: string;
  stone_type: string;
  stone_carat?: string | null;
  stone_color?: string | null;
  stone_clarity?: string | null;
  stone_cut?: string | null;
  display_order?: number;
}

interface ProductSpecsProps {
  productCode?: string | null;
  metalType?: string | null;
  metalWeight?: string | null;
  grossWeight?: string | null;
  size?: string | null;
  stones?: ProductStone[];
  certification?: string | null;
  collectionName?: string | null;
}

interface SpecItemProps {
  label: string;
  value: string;
}

function SpecItem({ label, value }: SpecItemProps) {
  return (
    <div className="flex justify-between gap-4 py-3">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-foreground text-right break-words">{value}</span>
    </div>
  );
}

export function ProductSpecs({
  productCode,
  metalType,
  metalWeight,
  grossWeight,
  size,
  stones = [],
  certification,
  collectionName,
}: ProductSpecsProps) {
  const baseSpecs = [
    { label: "Product Code", value: productCode },
    { label: "Metal", value: metalType },
    { label: "Metal Weight", value: metalWeight },
    { label: "Gross Weight", value: grossWeight },
    { label: "Certification", value: certification },
  ].filter((spec) => spec.value);

  // Build stone specs - each stone gets its own lines
  const stoneSpecs: { label: string; value: string }[] = [];
  
  stones.forEach((stone) => {
    if (stone.stone_type) {
      // Main line: "{Stone Type} Weight: {carat}" or just "{Stone Type}"
      if (stone.stone_carat) {
        stoneSpecs.push({
          label: `${stone.stone_type} Weight`,
          value: stone.stone_carat,
        });
      } else {
        stoneSpecs.push({
          label: "Stone",
          value: stone.stone_type,
        });
      }

      // Additional stone properties
      if (stone.stone_color) {
        stoneSpecs.push({
          label: `${stone.stone_type} Color`,
          value: stone.stone_color,
        });
      }
      if (stone.stone_clarity) {
        stoneSpecs.push({
          label: `${stone.stone_type} Clarity`,
          value: stone.stone_clarity,
        });
      }
      if (stone.stone_cut) {
        stoneSpecs.push({
          label: `${stone.stone_type} Cut`,
          value: stone.stone_cut,
        });
      }
    }
  });

  // Size right above collection
  const sizeSpec = size ? [{ label: "Size", value: size }] : [];
  
  // Collection always last
  const collectionSpec = collectionName ? [{ label: "Collection", value: collectionName }] : [];

  const allSpecs = [...baseSpecs, ...stoneSpecs, ...sizeSpec, ...collectionSpec];

  if (allSpecs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground mb-4">
        Specifications
      </h3>
      <div className="divide-y divide-border">
        {allSpecs.map((spec, index) => (
          <SpecItem key={`${spec.label}-${index}`} label={spec.label} value={spec.value!} />
        ))}
      </div>
    </div>
  );
}
