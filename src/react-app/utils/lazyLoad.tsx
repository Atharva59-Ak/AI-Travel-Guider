import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LazyComponentProps {
  importFunc: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  [key: string]: any;
}

export const LazyComponent = ({ importFunc, fallback, ...props }: LazyComponentProps) => {
  const LazyComp = lazy(importFunc);
  
  return (
    <Suspense 
      fallback={
        fallback || (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center h-64"
          >
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </motion.div>
        )
      } 
    >
      <LazyComp {...props} />
    </Suspense>
  );
};