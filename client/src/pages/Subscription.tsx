import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Star, Zap, Trophy, TrendingUp, Shield, Users } from "lucide-react";

// Temporarily disable Stripe for testing
const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_dummy_key_for_testing';
const stripePromise = STRIPE_KEY.startsWith('pk_') ? loadStripe(STRIPE_KEY) : null;

const CheckoutForm = ({ tier, onSuccess }: { tier: string; onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/subscription-success`,
      },
      redirect: "if_required"
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsProcessing(false);
    } else {
      toast({
        title: "Subscription Activated!",
        description: `Welcome to ${tier.toUpperCase()} tier! Your account has been upgraded.`,
      });
      onSuccess();
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || !elements || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? "Processing..." : `Subscribe to ${tier.toUpperCase()}`}
      </Button>
    </form>
  );
};

export default function Subscription() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const { toast } = useToast();

  const createSubscriptionMutation = useMutation({
    mutationFn: async ({ tier, email }: { tier: string; email: string }) => {
      const response = await apiRequest("POST", "/api/create-subscription", { tier, email });
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
    },
  });

  const handleSelectTier = (tier: string) => {
    setSelectedTier(tier);
    const email = prompt("Enter your email address:");
    if (email) {
      createSubscriptionMutation.mutate({ tier, email });
    }
  };

  const tiers = [
    {
      name: "Free",
      price: "$0",
      description: "Get started with basic features",
      features: [
        "View today's slate",
        "Basic edge scores",
        "Limited to 5 props per day",
        "Standard refresh (2 hours)",
      ],
      icon: <Star className="w-6 h-6" />,
      color: "border-gray-600",
      buttonText: "Current Plan",
      disabled: true,
    },
    {
      name: "Standard",
      price: "$24.99",
      period: "/month",
      description: "Full access to all sports intelligence",
      features: [
        "All MLB, NFL, NBA games",
        "Unlimited prop analysis",
        "Elite player identification",
        "Attack board access",
        "Team intelligence reports",
        "1-hour refresh rate",
      ],
      icon: <Zap className="w-6 h-6" />,
      color: "border-blue-500",
      buttonText: "Upgrade to Standard",
      value: "standard",
    },
    {
      name: "VIP",
      price: "$99.99",
      period: "/month",
      description: "Professional betting intelligence suite",
      features: [
        "Everything in Standard",
        "Real-time data updates",
        "Automated Parlay Builder",
        "Advanced analytics dashboard",
        "Weather & injury alerts",
        "Priority API access",
        "Slack integration",
        "Revenue sharing portal (15%)",
      ],
      icon: <Trophy className="w-6 h-6" />,
      color: "border-purple-500",
      popular: true,
      buttonText: "Go VIP",
      value: "vip",
    },
  ];

  if (clientSecret && selectedTier) {
    return (
      <div className="container mx-auto max-w-2xl py-8">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Complete Your {selectedTier.toUpperCase()} Subscription</CardTitle>
            <CardDescription>
              Enter your payment details to activate your subscription
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm 
                tier={selectedTier} 
                onSuccess={() => {
                  setClientSecret("");
                  setSelectedTier(null);
                }}
              />
            </Elements>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Choose Your Edge
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Professional betting intelligence powered by real-time data analysis and advanced algorithms
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
        {tiers.map((tier) => (
          <Card 
            key={tier.name} 
            className={`relative border-2 ${tier.color} ${tier.popular ? 'scale-105 shadow-2xl' : ''}`}
            data-testid={`card-tier-${tier.name.toLowerCase()}`}
          >
            {tier.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  MOST POPULAR
                </span>
              </div>
            )}
            <CardHeader className="text-center pb-8 pt-6">
              <div className="mx-auto mb-4 p-3 rounded-full bg-gradient-to-br from-gray-900 to-gray-800 w-fit">
                {tier.icon}
              </div>
              <CardTitle className="text-2xl mb-2">{tier.name}</CardTitle>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold">{tier.price}</span>
                {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
              </div>
              <CardDescription className="mt-2">{tier.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                size="lg"
                variant={tier.disabled ? "secondary" : tier.popular ? "default" : "outline"}
                disabled={tier.disabled || createSubscriptionMutation.isPending}
                onClick={() => tier.value && handleSelectTier(tier.value)}
                data-testid={`button-select-${tier.name.toLowerCase()}`}
              >
                {tier.buttonText}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-950/20 to-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-yellow-500" />
              Why Professionals Choose Our Platform
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Data-Driven Edge Scores</h3>
                    <p className="text-sm text-muted-foreground">
                      Mathematical models analyzing pitch matchups, usage rates, and environmental factors
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Revenue Sharing Program</h3>
                    <p className="text-sm text-muted-foreground">
                      VIP members earn 15% commission through our capper portal system
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-purple-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Real-Time Updates</h3>
                    <p className="text-sm text-muted-foreground">
                      Live odds movement, weather changes, and injury reports as they happen
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Trophy className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">Proven Results</h3>
                    <p className="text-sm text-muted-foreground">
                      Join thousands making millions with our intelligence platform
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}