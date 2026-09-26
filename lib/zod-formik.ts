import { z } from "zod";

/**
 * Creates a Formik-compatible validator function from a Zod schema.
 */
export function validateWithZod<T>(schema: z.ZodType<T>) {
  return (values: unknown) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return {};
    }

    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (field !== undefined && !errors[field.toString()]) {
        errors[field.toString()] = issue.message;
      }
    }
    return errors;
  };
}
