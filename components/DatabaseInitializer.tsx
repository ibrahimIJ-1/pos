"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { initializeDatabase } from '@/lib/db-initializer';
import { toast } from 'sonner';

export function DatabaseInitializer() {
  const [isInitializing, setIsInitializing] = React.useState(false);

  const handleInitialize = async () => {
    if (isInitializing) return;
    
    try {
      setIsInitializing(true);
      toast.loading('Initializing database...');
      await initializeDatabase();
    } catch (error) {
      // Error is already handled in initializeDatabase
      console.error('Initialization error:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <Button 
      onClick={handleInitialize} 
      disabled={isInitializing}
      variant="outline"
      className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300"
    >
      {isInitializing ? 'Initializing...' : 'Initialize Database'}
    </Button>
  );
}
