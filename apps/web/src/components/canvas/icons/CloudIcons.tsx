'use client';

import React from 'react';
import {
  Server,
  Database,
  Cloud,
  Layers,
  Cpu,
  Shield,
  HardDrive,
  Network,
  Globe,
  Radio,
  FileCode2,
  Box,
  Key,
  Lock,
  Workflow,
  Sparkles,
  Zap,
  Activity,
  Laptop,
} from 'lucide-react';

interface IconProps {
  name?: string;
  className?: string;
}

export const CloudIconRenderer: React.FC<IconProps> = ({ name = 'server', className = 'h-5 w-5' }) => {
  const n = (name || '').toLowerCase();

  // AWS Specific
  if (n === 'lambda' || n === 'serverless') {
    return <Zap className={`${className} text-amber-500`} />;
  }
  if (n === 's3' || n === 'storage' || n === 'blob') {
    return <HardDrive className={`${className} text-emerald-500`} />;
  }
  if (n === 'dynamodb' || n === 'nosql') {
    return <Database className={`${className} text-blue-500`} />;
  }
  if (n === 'route53' || n === 'dns') {
    return <Globe className={`${className} text-orange-500`} />;
  }
  if (n === 'cloudfront' || n === 'cdn') {
    return <Radio className={`${className} text-purple-500`} />;
  }
  if (n === 'cognito' || n === 'auth' || n === 'iam') {
    return <Key className={`${className} text-rose-500`} />;
  }
  if (n === 'api-gateway' || n === 'gateway' || n === 'envoy') {
    return <Network className={`${className} text-indigo-500`} />;
  }

  // Messaging & Event streaming
  if (n === 'kafka' || n === 'queue' || n === 'sqs' || n === 'rabbitmq') {
    return <Workflow className={`${className} text-red-500`} />;
  }

  // Caching & Databases
  if (n === 'redis' || n === 'cache') {
    return <Zap className={`${className} text-rose-600`} />;
  }
  if (n === 'postgres' || n === 'postgresql' || n === 'sql') {
    return <Database className={`${className} text-sky-500`} />;
  }
  if (n === 'mongo' || n === 'mongodb') {
    return <Database className={`${className} text-emerald-600`} />;
  }

  // Containers & Orchestration
  if (n === 'k8s' || n === 'kubernetes') {
    return <Box className={`${className} text-blue-600`} />;
  }
  if (n === 'docker') {
    return <Box className={`${className} text-cyan-500`} />;
  }

  // General Categories
  if (n === 'client' || n === 'web' || n === 'browser') {
    return <Laptop className={`${className} text-slate-400`} />;
  }
  if (n === 'server' || n === 'ec2' || n === 'vm' || n === 'compute-server' || n === 'host' || n === 'instance') {
    return <Server className={`${className} text-indigo-400`} />;
  }
  if (n === 'compute') {
    return <Cpu className={`${className} text-amber-400`} />;
  }
  if (n === 'security') {
    return <Shield className={`${className} text-teal-500`} />;
  }
  if (n === 'ai' || n === 'ml') {
    return <Sparkles className={`${className} text-fuchsia-500`} />;
  }
  if (n === 'activity' || n === 'monitoring') {
    return <Activity className={`${className} text-green-400`} />;
  }

  return <Server className={`${className} text-indigo-400`} />;
};
