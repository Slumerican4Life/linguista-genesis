
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const ActivityLogs = () => {
  // Fetch admin activity logs
  const { data: adminLogs } = useQuery({
    queryKey: ['admin-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_logs')
        .select('*, profiles!admin_logs_admin_id_fkey(full_name, email), profiles!admin_logs_target_user_id_fkey(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <Card className="border border-purple-500/30 bg-black/60 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-purple-100">Admin Activity Logs</CardTitle>
        <CardDescription className="text-purple-200">
          Track all admin actions and system events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {adminLogs?.map((log) => (
            <div key={log.id} className="p-4 bg-purple-900/20 rounded-lg border border-purple-500/30">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-white">{log.action.replace('_', ' ').toUpperCase()}</p>
                  <p className="text-sm text-purple-300">
                    by {log.profiles?.full_name || log.profiles?.email || 'System'}
                  </p>
                  {log.details && (
                    <p className="text-xs text-purple-400">
                      {JSON.stringify(log.details)}
                    </p>
                  )}
                </div>
                <p className="text-sm text-purple-300">
                  {new Date(log.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
