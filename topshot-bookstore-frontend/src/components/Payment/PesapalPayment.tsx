import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/utils/api';
import { toast } from '@/hooks/use-toast';

interface PesapalPaymentProps {
  orderId: string;
  amount: number;
  currency?: string; // Added currency option
}

export const PesapalPayment: React.FC<PesapalPaymentProps> = ({ 
  orderId, 
  amount,
  currency = 'KES' // Default to Kenyan Shillings
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);

  const handlePayment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to proceed with payment",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await api.initiatePesapalPayment(orderId);
      
      // Ensure we have a redirect URL
      if (!response.data?.redirectUrl) {
        throw new Error('No redirect URL received from server');
      }
      
      window.location.href = response.data.redirectUrl;
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Failed to initiate payment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="border rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Pay with Pesapal</h3>
        <img 
          src="/pesapal-logo.png" 
          alt="Pesapal" 
          className="h-8 object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Order Total:</span>
          <span className="font-medium">{formatCurrency(amount)}</span>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400">
          You will be redirected to Pesapal's secure payment page to complete your transaction.
        </p>
        
        <div className="pt-2">
          <Button
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Pay with Pesapal'
            )}
          </Button>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          By proceeding, you agree to Pesapal's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};