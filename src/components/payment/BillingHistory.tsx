
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Download, Eye, Calendar, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BillingHistoryProps {
  userId?: string;
}

export const BillingHistory: React.FC<BillingHistoryProps> = ({ userId }) => {
  const { data: billingHistory, isLoading } = useQuery({
    queryKey: ['billing-history', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('billing_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'subscription': return <CreditCard className="w-4 h-4 text-green-500" />;
      case 'one_time': return <DollarSign className="w-4 h-4 text-blue-500" />;
      case 'refund': return <Download className="w-4 h-4 text-red-500" />;
      default: return <CreditCard className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (amount: number) => {
    return amount > 0 ? 'bg-green-600' : 'bg-red-600';
  };

  if (isLoading) {
    return (
      <Card className="border border-purple-500/30 bg-black/60 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="text-center text-purple-200">Loading billing history...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-purple-500/30 bg-gradient-to-br from-black/95 via-purple-900/10 to-blue-900/10 backdrop-blur-xl shadow-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-purple-100">
          <CreditCard className="w-6 h-6 text-purple-400" />
          <span>Billing History</span>
        </CardTitle>
        <CardDescription className="text-purple-200">
          Your payment history and transaction records
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!billingHistory || billingHistory.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-purple-400 mx-auto mb-4 opacity-50" />
            <p className="text-purple-200 mb-2 text-lg font-semibold">No billing history</p>
            <p className="text-sm text-purple-300">Your transactions will appear here</p>
          </div>
        ) : (
          <div className="rounded-lg border border-purple-500/30 overflow-hidden">
            <Table>
              <TableHeader className="bg-purple-900/40">
                <TableRow className="border-purple-500/30">
                  <TableHead className="text-purple-100">Type</TableHead>
                  <TableHead className="text-purple-100">Date</TableHead>
                  <TableHead className="text-purple-100">Amount</TableHead>
                  <TableHead className="text-purple-100">Status</TableHead>
                  <TableHead className="text-purple-100">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingHistory.map((transaction) => (
                  <TableRow key={transaction.id} className="border-purple-500/30 bg-black/40">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {getTransactionIcon(transaction.transaction_type)}
                        <div>
                          <p className="font-medium text-white capitalize">
                            {transaction.transaction_type.replace('_', ' ')}
                          </p>
                          {transaction.stripe_invoice_id && (
                            <p className="text-xs text-purple-300">
                              Invoice: {transaction.stripe_invoice_id}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 text-purple-300">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(transaction.created_at).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-white">
                        ${transaction.amount} {transaction.currency}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(transaction.amount)} text-white`}>
                        {transaction.amount > 0 ? 'Completed' : 'Refunded'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-purple-400 text-purple-300 hover:bg-purple-900/20"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-blue-400 text-blue-300 hover:bg-blue-900/20"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Receipt
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
