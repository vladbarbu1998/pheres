import { Layout } from "@/components/layout/Layout";
import { LegalLayout } from "@/components/layout/LegalLayout";

export default function PrivacyPolicy() {
  return (
    <Layout>
      <LegalLayout title="Privacy Policy">
      <div className="space-y-8 text-muted-foreground">
        <section className="space-y-4">
          <p className="text-lg font-medium text-foreground">
            <span className="brand-word">Pheres</span> Co., Ltd is committed to protecting your privacy.
          </p>
          <p>
            Our customers are at the heart of everything we do, and we strive to ensure your experience with <span className="brand-word">Pheres</span> is one that you will want to repeat and share with loved ones. Part of our commitment to you is to respect and protect the privacy of the personal information you provide to us.
          </p>
          <p>
            By using our website or by purchasing products or services from us, you agree to be bound by this policy. Please check occasionally as this policy may change from time-to-time.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Order Information
          </h2>
          <p>
            When you place an order with us, we shall collect your name, telephone number, shipping address, billing address (i.e. "Order Information"). This information is necessary for us to process your order and notify you of your order status. Order information also includes any information that you provide us in connection with an order that you may cancel later or that is not completed successfully for any reason.
          </p>
          <p>
            We may use your Account Information and Order Information to occasionally notify you about important changes to the website, special offers that you may find useful, or offers from companies with whom we have business relationships.
          </p>
          <p>
            If you have purchased from our site or subscribed to our newsletters, you may receive special promotions from us via email. If you do not wish to receive newsletters and updates from us, please click "unsubscribe" from mailing list option.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Cookies
          </h2>
          <p>
            We use cookies in order to improve your shopping experience when you visit our site. Our cookies let us personalize your visits to our site and recognize you when you return. They also enable us to provide a Shopping Cart and to store your shipping and billing information.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            How we Protect Your Information
          </h2>
          <p>
            <span className="brand-word">Pheres</span> Co., Ltd strives to protect your privacy.
          </p>
          <p>
            <span className="brand-word">Pheres</span> Co., Ltd will not sell or disclose any of your information to a third party without your consent with the exception of the following purposes:
          </p>
          <ul className="list-none space-y-2 pl-4">
            <li>– Any person or organization who are bound by confidentiality agreements with us including <span className="brand-word">Pheres</span> HK LTD and <span className="brand-word">Pheres</span> Co., LTD</li>
            <li>– Any service provider who provides order processing, administrative, credit reference, payment clearing, debt collecting or other services for the operation of our business; and</li>
            <li>– Any person to whom we are under an obligation to make disclosure as required by any applicable law.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Use of Your Personal Information
          </h2>
          <p>
            Information received from you (unless otherwise restricted by law) may be used to:
          </p>
          <ul className="list-none space-y-2 pl-4">
            <li>– Facilitate your purchase and provide the service you request.</li>
            <li>– Confirm and track your order,</li>
            <li>– Respond to your comments, inquiries and or requests,</li>
            <li>– Compare and review your information for errors, omissions and accuracy,</li>
            <li>– Prevent and detect fraud or abuse,</li>
            <li>– Provide and improve our services and product offerings and develop new ones,</li>
            <li>– Improve marketing and promotional efforts, and overall customer experience,</li>
            <li>– Identify your product and service preferences,</li>
            <li>– Offer personalized content, by providing customized content and advertising,</li>
            <li>– Understand our customer demographics, preferences, interests and behavior,</li>
            <li>– Administer and fulfill our contests and other promotions,</li>
            <li>– Contact you regarding products and services that we believe may be of interest to you</li>
            <li>– Comply with applicable legal requirements and <span className="brand-word">Pheres</span>' policies and procedures, and</li>
            <li>– Other uses with your consent.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Links to Other Websites
          </h2>
          <p>
            Our site may contain links to other sites, operated by third parties that we believe may be of interest to you. While we encourage third parties to follow appropriate privacy standards and policies, we are not responsible for the actions of those parties, the content of their websites or any products or services they may offer.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Accessing and Updating Your Information
          </h2>
          <p>
            To receive our website's newsletter and/or periodic emails with special offers, you need to provide your email address. To order from us, you must register on pheres.com by providing us with you email address.
          </p>
          <p>
            If you have created a <span className="brand-word">Pheres</span> account, you can review and change certain personal information relating to your <span className="brand-word">Pheres</span> account at any time by logging on to your account. Otherwise, to learn more, please contact us as set forth below.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Contact us
          </h2>
          <p>
            If you have any questions about our Privacy Policy, please contact us at:
          </p>
          <p>
            <a href="mailto:customercare@pheres.com" className="text-primary hover:underline">
              customercare@pheres.com
            </a>
          </p>
          <p className="font-medium text-foreground">
            <span className="brand-word">Pheres</span> HK LTD., Level 9 & 10, Central Building, 1-3 Pedder Street, Central, Hong Kong
          </p>
        </section>
      </div>
    </LegalLayout>
    </Layout>
  );
}
