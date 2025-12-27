interface ProductSpecsProps {
  metalType?: string | null;
  metalWeight?: string | null;
  stoneCarat?: string | null;
  stoneClarity?: string | null;
  stoneColor?: string | null;
  stoneCut?: string | null;
  stoneType?: string | null;
  certification?: string | null;
  collectionName?: string | null;
}

interface SpecItemProps {
  label: string;
  value: string;
}

function SpecItem({ label, value }: SpecItemProps) {
  return (
    <div className="flex justify-between py-3 border-b border-border last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export function ProductSpecs({
  metalType,
  metalWeight,
  stoneCarat,
  stoneClarity,
  stoneColor,
  stoneCut,
  stoneType,
  certification,
  collectionName,
}: ProductSpecsProps) {
  const specs = [
    { label: "Metal", value: metalType },
    { label: "Metal Weight", value: metalWeight },
    { label: "Stone", value: stoneType },
    { label: "Carat", value: stoneCarat },
    { label: "Clarity", value: stoneClarity },
    { label: "Color Grade", value: stoneColor },
    { label: "Cut", value: stoneCut },
    { label: "Certification", value: certification },
    { label: "Collection", value: collectionName },
  ].filter((spec) => spec.value);

  if (specs.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground mb-4">
        Specifications
      </h3>
      <div className="divide-y divide-border">
        {specs.map((spec) => (
          <SpecItem key={spec.label} label={spec.label} value={spec.value!} />
        ))}
      </div>
    </div>
  );
}
