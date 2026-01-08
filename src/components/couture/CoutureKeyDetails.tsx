import { Gem, CircleDot, Scale, Ruler, Layers, Award } from "lucide-react";

interface Metal {
  id: string;
  metal_type: string;
  metal_weight: string | null;
}

interface Stone {
  id: string;
  stone_type: string;
  stone_carat: string | null;
  stone_clarity: string | null;
  stone_color: string | null;
  stone_cut: string | null;
}

interface CoutureKeyDetailsProps {
  metals?: Metal[];
  stones?: Stone[];
  grossWeight?: string | null;
  size?: string | null;
  collectionName?: string | null;
  certification?: string | null;
}

export function CoutureKeyDetails({
  metals = [],
  stones = [],
  grossWeight,
  size,
  collectionName,
  certification,
}: CoutureKeyDetailsProps) {
  const details: { icon: React.ReactNode; label: string; value: string }[] = [];

  // Metals
  if (metals.length > 0) {
    const metalText = metals
      .map((m) => `${m.metal_type}${m.metal_weight ? ` (${m.metal_weight})` : ""}`)
      .join(", ");
    details.push({
      icon: <CircleDot className="h-4 w-4" />,
      label: "Metal",
      value: metalText,
    });
  }

  // Main gemstone
  if (stones.length > 0) {
    const mainStone = stones[0];
    details.push({
      icon: <Gem className="h-4 w-4" />,
      label: "Main Gemstone",
      value: mainStone.stone_type,
    });

    // Total carat weight if available
    const totalCarat = stones
      .filter((s) => s.stone_carat)
      .map((s) => parseFloat(s.stone_carat || "0"))
      .reduce((a, b) => a + b, 0);
    
    if (totalCarat > 0) {
      details.push({
        icon: <Scale className="h-4 w-4" />,
        label: "Total Carat Weight",
        value: `${totalCarat.toFixed(2)} ct`,
      });
    }
  }

  // Gross weight
  if (grossWeight) {
    details.push({
      icon: <Scale className="h-4 w-4" />,
      label: "Gross Weight",
      value: grossWeight,
    });
  }

  // Size
  if (size) {
    details.push({
      icon: <Ruler className="h-4 w-4" />,
      label: "Size",
      value: size,
    });
  }

  // Collection
  if (collectionName) {
    details.push({
      icon: <Layers className="h-4 w-4" />,
      label: "Collection",
      value: collectionName,
    });
  }

  // Certification
  if (certification) {
    details.push({
      icon: <Award className="h-4 w-4" />,
      label: "Certification",
      value: certification,
    });
  }

  if (details.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-border/50 pt-6 mt-6">
      <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
        Key Details
      </h3>
      <ul className="space-y-3">
        {details.map((detail, index) => (
          <li key={index} className="flex items-start gap-3 text-sm">
            <span className="text-primary mt-0.5">{detail.icon}</span>
            <span className="text-muted-foreground">{detail.label}:</span>
            <span className="text-foreground">{detail.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
