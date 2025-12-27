import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, MapPin, Phone, Clock, Instagram, Send, CheckCircle } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  subject: z.string().optional(),
  inquiryType: z.string().optional(),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000, "Message must be less than 2000 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

const locations = [
  {
    name: "Milan",
    country: "Italy",
    address: "Via Monte Napoleone, 8",
    email: "milan@pheres.com",
  },
  {
    name: "Hong Kong",
    country: "China",
    address: "The Landmark, Central",
    email: "hongkong@pheres.com",
  },
  {
    name: "Tokyo",
    country: "Japan",
    address: "Ginza District",
    email: "tokyo@pheres.com",
  },
];

const socialLinks = [
  { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/pheresofficial/" },
];

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);

    try {
      const subjectLine = data.inquiryType 
        ? `[${data.inquiryType}] ${data.subject || "No subject"}`
        : data.subject || null;

      const { error } = await supabase.from("contact_messages").insert({
        name: data.name,
        email: data.email,
        subject: subjectLine,
        message: data.message,
      });

      if (error) throw error;

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
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Get in Touch
          </p>
          <h1 className="font-display text-4xl font-semibold text-foreground md:text-5xl mb-4">
            Contact Pheres
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Whether you have a question about a piece, wish to schedule a private viewing, 
            or are interested in a bespoke creation, our team is here to assist you.
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

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="inquiryType">How can we help?</Label>
                    <Select onValueChange={(value) => setValue("inquiryType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select inquiry type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                        <SelectItem value="Order Question">Order Question</SelectItem>
                        <SelectItem value="Press">Press</SelectItem>
                        <SelectItem value="Private Viewing">Private Viewing</SelectItem>
                        <SelectItem value="Bespoke Creation">Bespoke Creation</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Subject of your message"
                      {...register("subject")}
                    />
                  </div>
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

                <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
                  {isSubmitting ? (
                    "Sending..."
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
                        <p className="text-sm text-muted-foreground">{location.country}</p>
                        <p className="text-sm text-muted-foreground mt-1">{location.address}</p>
                        <a
                          href={`mailto:${location.email}`}
                          className="text-sm text-primary hover:underline mt-2 inline-block"
                        >
                          {location.email}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* General Contact */}
            <div className="rounded-sm border border-border bg-card p-6">
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                General Inquiries
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary shrink-0" />
                  <a
                    href="mailto:contact@pheres.com"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    contact@pheres.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-muted-foreground">+1 (800) PHERES-1</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-muted-foreground">Mon – Fri, 9:00 AM – 6:00 PM CET</span>
                </div>
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
              <p className="mt-3 text-xs text-muted-foreground">
                {/* TODO: Replace with actual social media URLs */}
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
