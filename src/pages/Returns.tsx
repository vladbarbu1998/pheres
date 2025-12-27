import { LegalLayout } from "@/components/layout/LegalLayout";

export default function Returns() {
  return (
    <LegalLayout title="Returns and Refunds Policy">
      <div className="space-y-8 text-muted-foreground">
        <p>
          If you are not entirely satisfied with your purchase, we're here to help.
        </p>
        <p>
          Our products can be returned within 30 days of the original purchase of the product. A new product may be exchanged for another product or returned for a credit note than can be used for further shopping on the site.
        </p>

        <section>
          <p className="mb-3">
            To be eligible for an exchange or a credit note, please make sure that:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>The product was purchased in the last 30 days</li>
            <li>The product is in its original packaging</li>
            <li>The product isn't used or damaged</li>
            <li>The product was not purchased on sale or during other promotional periods</li>
            <li>You obtained a Return Merchandise Number (RMN) from us</li>
          </ul>
          <p className="mt-3">
            Products that do not meet these criteria will not be considered for return.
          </p>
        </section>

        <section>
          <p>
            To obtain a Return Merchandise Number (RMN), contact us:
          </p>
          <p className="mt-2">
            By email: <a href="mailto:customercare@pheres.com" className="text-primary hover:underline">customercare@pheres.com</a>
          </p>
        </section>

        <section>
          <p>
            Send the product with its original packing and the RMA number, along with a note indicating whether you want to exchange the product (and if so, what other product you want to order) or a credit towards your next purchase, to:
          </p>
          <p className="mt-2 font-medium text-foreground">
            PHERES HK Ltd, Level 9, Central Building, 1-3 Pedder Street, Central, HK
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-3">Shipping Charges</h2>
          <p>
            Shipping charges incurred in connection with the return of a product are non-refundable.
          </p>
          <p className="mt-3">
            You are responsible for paying the costs of shipping and for the risk of loss of or damage to the product during return to Pheres HK Ltd.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-3">Damaged Items</h2>
          <p>
            If you received a damaged product, please notify us immediately for assistance.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-3">Sale Items</h2>
          <p>
            Unfortunately, sale items cannot be refunded nor can qualify for a credit note.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-3">Contact Us</h2>
          <p>
            If you have any questions about our Returns and Refunds Policy, please contact us:
          </p>
          <p className="mt-2">
            By email: <a href="mailto:customercare@pheres.com" className="text-primary hover:underline">customercare@pheres.com</a>
          </p>
          <p className="mt-3 font-medium text-foreground">
            PHERES HK Ltd, Level 9, Central Building, 1-3 Pedder Street, Central, HK
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}