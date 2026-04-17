"use client";

import { ExternalLink } from "lucide-react";

interface CoutureProvenanceProps {
  imageUrl?: string | null;
  eventText?: string | null;
  pressLink?: string | null;
}

export function CoutureProvenance({
  imageUrl,
  eventText,
  pressLink,
}: CoutureProvenanceProps) {
  // Don't render if no provenance data
  if (!eventText && !imageUrl) {
    return null;
  }

  return (
    <section className="py-16 md:py-20 border-t border-border/30">
      <div className="container max-w-7xl mx-auto px-4">
        <h2 className="text-xs uppercase tracking-[0.25em] text-primary mb-8 text-center">
          Seen On
        </h2>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-2xl mx-auto">
          {/* Event Image */}
          {imageUrl && (
            <div className="w-32 h-32 flex-shrink-0 overflow-hidden rounded-sm bg-stone-100">
              <img
                src={imageUrl}
                alt="Event"
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Event Details */}
          <div className="text-center md:text-left">
            {eventText && (
              <p className="text-lg text-foreground font-display mb-2">
                {eventText}
              </p>
            )}
            {pressLink && (
              <a
                href={pressLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                View Press Coverage
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}