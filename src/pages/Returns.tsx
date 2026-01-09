import { Layout } from "@/components/layout/Layout";
import { LegalLayout } from "@/components/layout/LegalLayout";

export default function Returns() {
  return (
    <Layout>
      <LegalLayout title="Returns and Refunds Policy">
      <div className="space-y-8 text-muted-foreground">
        <section className="space-y-4">
          <p className="text-lg font-medium text-foreground">
            At <span className="brand-word">Pheres</span>, our top priority is our customer satisfaction. If you are not entirely satisfied with your purchase, we're here to help.
          </p>
          <p>
            Our products can be exchanged or used as store credit. We do not accept any returns.
          </p>
        </section>

        <section className="space-y-4">
          <p>
            To be eligible for an exchange or credit note, please make sure that:
          </p>
          <ul className="list-none space-y-2 pl-4">
            <li>– The product was purchased in the last 3 days from the time received/delivered</li>
            <li>– The product is in its original packaging</li>
            <li>– The product is unworn, unused, and undamaged</li>
            <li>– The product was not purchased on sale or during promotional periods</li>
            <li>– You have obtained a Return Merchandise Number (RMN) from us. Products that do not meet these criteria will not be considered for return.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <p>
            To obtain a Return Merchandise Number (RMN), contact us at{" "}
            <a href="mailto:customercare@pheres.com" className="text-primary hover:underline">customercare@pheres.com</a>
          </p>
          <p>
            Send the product in its original packaging and the RMA number, along with a note indicating whether you want an exchange (and if so, what other product you want to order) or credit note towards your next purchase to:
          </p>
          <p className="font-medium text-foreground">
            <span className="brand-word">Pheres</span> HK LTD., Level 9 & 10, Central Building, 1-3 Pedder Street, Central, Hong Kong
          </p>
          <p>
            The customer will have to ensure the return of the parcel at their own cost and bare the return fees.
          </p>
          <p>
            Refund will only be processed once the product is checked and made sure of that no changes or alterations have been made to the product.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">Our return policy</h2>
          <p>
            To be eligible for exchange or credit note, items must be in their original purchase condition, including all product documentation, and shipped back to us within 3 days from receiving the package.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">Shipping charges</h2>
          <p>
            Shipping charges incurred in connection with the return of a product are non-refundable. The customer is responsible for paying for the shipping cost and for the risk of loss of or damage to the product during the return to <span className="brand-word">Pheres</span> HK LTD.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">Damaged item</h2>
          <p>
            If you receive a damaged product, please notify us immediately for assistance at{" "}
            <a href="mailto:customercare@pheres.com" className="text-primary hover:underline">customercare@pheres.com</a>{" "}
            with your order number and images of the damaged item.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">After your return is received</h2>
          <p>
            Once our Quality Assurance department has passed your return package, you will receive a confirmation email alerting you that your return has been processed.
          </p>
          <p>
            For refunds, please allow 7-10 working days for your credit card company to refund the amount to your account. Please contact your credit card company to know more. Orders paid through PayPal will be credited back to your PayPal account. Please allow up to 10 days for your amount to be credited.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">Cancel or Change an Order</h2>
          <p>
            If you wish to change or cancel an order please email{" "}
            <a href="mailto:customercare@pheres.com" className="text-primary hover:underline">customercare@pheres.com</a>{" "}
            with your order number. We will attempt to accommodate order changes to the extent possible, prior to shipping confirmation.
          </p>
          <p>
            We are unable to accommodate changes or cancellations on special order requests and/or that have already been shipped. If your order has already been shipped, please contact us to set up a merchandise return once you have received the shipment.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">Sale items</h2>
          <p>
            Sale items cannot be refunded or exchanged, nor can qualify for a credit note.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">Contact us</h2>
          <p>
            If you have any questions about our Returns and Refunds Policy, please contact us at:
          </p>
          <p>
            <a href="mailto:customercare@pheres.com" className="text-primary hover:underline">customercare@pheres.com</a>
          </p>
          <p className="font-medium text-foreground">
            Hong Kong Office: <span className="brand-word">Pheres</span> HK LTD., Level 9 & 10, Central Building, 1-3 Pedder Street, Central, Hong Kong
          </p>
        </section>
      </div>
    </LegalLayout>
    </Layout>
  );
}
