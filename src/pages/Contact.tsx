import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Instagram, Send, CheckCircle, Clock } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useRateLimit, RATE_LIMIT_PRESETS } from "@/hooks/useRateLimit";
import { useTurnstile } from "@/hooks/useTurnstile";
import { TurnstileWidget } from "@/components/ui/turnstile-widget";
import { ConsentToggle } from "@/components/ui/consent-toggle";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  subject: z.string().optional(),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message must be less than 2000 characters"),
  consent: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms to continue" }),
  }),
});

type ContactFormData = z.infer<typeof contactSchema>;

const locations = [
  {
    name: "Hong Kong Office",
    address: "Level 29, Infinitus Plaza, 199 Des Voeux Road, Sheung Wan, Hong Kong",
    phone: "+852 3182 7554",
  },
];

const socialLinks = [
  { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/pheresofficial/" },
];

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const {
    checkRateLimit,
    recordAttempt,
    isRateLimited,
    secondsUntilReset
  } = useRateLimit(RATE_LIMIT_PRESETS.contactForm);

  const {
    isTokenReady,
    isVerifying,
    onVerify,
    onExpire,
    onError,
    verifyToken,
  } = useTurnstile();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    // Check rate limit before proceeding
    if (!checkRateLimit()) {
      toast({
        title: "Too many attempts",
        description: `Please wait ${Math.ceil(secondsUntilReset / 60)} minute(s) before sending another message.`,
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    recordAttempt();

    try {
      const verified = await verifyToken();
      if (!verified) {
        toast({
          title: "Verification failed",
          description: "Please try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.from("contact_messages").insert({
        name: data.name,
        email: data.email,
        subject: data.subject || null,
        message: data.message,
      });

      if (error) throw error;

      // Fire-and-forget admin notification
      supabase.functions.invoke("notify-admin-form", {
        body: { type: "contact", name: data.name, email: data.email, subject: data.subject, message: data.message },
      }).catch(() => {});

      setIsSubmitted(true);
      reset();
      toast({
        title: "Message sent",
        description: "Thank you for reaching out. We'll respond within 24-48 hours.",
      });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again or email us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Header */}
      <section className="container py-12 md:py-16">
        <div className="max-w-2xl">
          <p className="mb-3 font-label text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Get in Touch
          </p>
          <h1 className="font-serif text-3xl font-light tracking-wide text-foreground md:text-4xl lg:text-5xl mb-4">
            Contact <span className="brand-word">Pheres</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Whether you have a question about a piece or are interested in a bespoke creation, 
            our team is here to assist you.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="container pb-16 md:pb-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Contact Form */}
          <div className="order-2 lg:order-1">
            {isSubmitted ? (
              <div className="rounded-sm border border-border bg-card p-8 text-center animate-fade-in">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  Message Received
                </h3>
                <p className="text-muted-foreground mb-6">
                  Thank you for contacting Pheres. A member of our team will respond 
                  to your inquiry within 24-48 hours.
                </p>
                <Button onClick={() => setIsSubmitted(false)} variant="outline">
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      {...register("name")}
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      {...register("email")}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Subject of your message"
                    {...register("subject")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us how we can assist you..."
                    rows={6}
                    {...register("message")}
                    className={errors.message ? "border-destructive" : ""}
                  />
                  {errors.message && (
                    <p className="text-sm text-destructive">{errors.message.message}</p>
                  )}
                </div>

                <TurnstileWidget
                  onVerify={onVerify}
                  onExpire={onExpire}
                  onError={onError}
                />

                <ConsentToggle
                  checked={watch("consent") === true}
                  onCheckedChange={(checked) => setValue("consent", checked as any, { shouldValidate: true })}
                  error={errors.consent?.message}
                />

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting || isRateLimited || !isTokenReady || !watch("consent") || isVerifying}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : isRateLimited ? (
                    <>
                      <Clock className="mr-2 h-4 w-4" />
                      Wait {Math.ceil(secondsUntilReset / 60)}m
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Locations & Contact Info */}
          <div className="order-1 lg:order-2 space-y-10">
            {/* Locations */}
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground mb-6">
                Our Locations
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {locations.map((location) => (
                  <div
                    key={location.name}
                    className="rounded-sm border border-border bg-card p-5 transition-colors hover:border-primary/30"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <h3 className="font-display font-medium text-foreground">
                          {location.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{location.address}</p>
                        <a
                          href={`tel:${location.phone.replace(/\s/g, "")}`}
                          className="text-sm text-primary hover:underline mt-2 inline-block"
                        >
                          {location.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                Follow Pheres
              </h2>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-11 items-center justify-center rounded-sm border border-border bg-card text-muted-foreground transition-all hover:border-primary hover:text-primary"
                    aria-label={`Follow Pheres on ${social.name}`}
                  >
                    <social.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
