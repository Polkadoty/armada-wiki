import { useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const components = {
  h1: (props: any) => (
    <h1 className="scroll-m-20 text-4xl font-bold tracking-tight" {...props} />
  ),
  h2: (props: any) => (
    <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight" {...props} />
  ),
  h3: (props: any) => (
    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight" {...props} />
  ),
  a: ({ href, ...props }: any) => (
    <Link href={href} className="font-medium underline underline-offset-4" {...props} />
  ),
  img: ({ src, alt, ...props }: any) => (
    <Image src={src} alt={alt} className="rounded-lg" {...props} />
  ),
  pre: (props: any) => (
    <pre className="overflow-auto rounded-lg bg-muted p-4" {...props} />
  ),
};

export function useMDXComponents() {
  return useMemo(() => components, []);
} 