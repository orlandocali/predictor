import { useForm, UseFormProps, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodType, z } from 'zod';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useFormValidation<TSchema extends ZodType<any, any, any>>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.infer<TSchema>>, 'resolver'>
): UseFormReturn<z.infer<TSchema>> {
  // zodResolver with Zod v4 coerce types doesn't perfectly match RHF generics.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema) as any,
    ...options,
  }) as UseFormReturn<z.infer<TSchema>>;
}
