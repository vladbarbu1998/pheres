import { LegalLayout } from "@/components/layout/LegalLayout";

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy">
      <div className="space-y-8 text-muted-foreground">
        <section className="space-y-4">
          <p className="text-lg font-medium text-foreground">
            PHERESSENTIALS is committed to protecting your privacy.
          </p>
          <p>
            This policy explains what information we gather from you and how we use that information.
          </p>
          <p>
            By using our website or by purchasing products or services from us, you agree to be bound by this policy. Please check back frequently since this policy may change from time to time.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            What information we collect and how we use it
          </h2>
          <p>
            When you visit our website, Pheres HK Ltd collects your IP address, which we use to improve our products and services. Your IP address is also used to gather broad demographic information that does not personally identify you.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Account information
          </h2>
          <p>
            To receive our website's newsletter and/or periodic emails with special offers, you need to provide your email address. To order from us, you must register on Pheressentials site by providing us with your email address.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Order information
          </h2>
          <p>
            When you place an order with us, we shall collect your name, telephone number, shipping address, billing address, (i.e. your "Order Information"). This information is necessary for us both to process your order and notify you of your order status. Order Information also includes any information that you provide us in connection with an order that you may cancel later or that is not completed successfully for any reason.
          </p>
          <p>
            We may use your Account Information and Order Information to occasionally notify you about important changes to the website, special offers that you may find useful, or offers from companies with whom we have business relationships.
          </p>
          <p>
            If you have purchased from our site or subscribe to our newsletters, you may receive special promotions from us via email. If you don't want to receive newsletters and update from us please click remove from mailing list option.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Cookies
          </h2>
          <p>
            We use cookies in order to improve your shopping experience when you visit our site. Our cookies let us personalize your visits to our site and recognize you when you return. They also enable us both to provide a Shopping Cart and to store your shipping and billing information.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            How we protect your information
          </h2>
          <p>
            Pheres HK LTD strives to protect your privacy.
          </p>
          <p>
            Pheres HK LTD will not sell or disclose any of your information to a third party without your consent with the exception of the following purposes:
          </p>
          <ul className="list-none space-y-2 pl-4">
            <li>– Any person or organization who are bound by confidentiality agreements with us including Pheres HK LTD and Pheres Co LTD</li>
            <li>– Any service provider who provides order processing, administrative, credit reference, payment clearing, debt collecting or other services for the operation of our business; and</li>
            <li>– Any person to whom we are under an obligation to make disclosure as required by any applicable law.</li>
          </ul>
          <p>
            If Pheres HK LTD is acquired by or merges with another company, we may transfer personal information to that company. In such an event we will notify you before your personal data is transferred if this information would become subject to a materially different privacy policy.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Links to other websites
          </h2>
          <p>
            PHERESSENTIALS website may contain links to other sites, operated by third parties that we believe may be of interest to you. While we encourages third parties to follow appropriate privacy standards and policies, we are not responsible for the actions of those parties, the content of their websites or any products or services they may offer.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Further questions
          </h2>
          <p>
            If you have any questions or suggestions, please contact us at{" "}
            <a href="mailto:info@pheres.com" className="text-primary hover:underline">
              info@pheres.com
            </a>{" "}
            or by mail at the address below:
          </p>
          <p className="font-medium text-foreground">
            PHERES HK LTD, Level 9 Central Building, 1-3 Pedder Street, Central, HK
          </p>
        </section>
      </div>
    </LegalLayout>
  );
}
