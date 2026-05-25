import { z } from "zod";

const requiredString = (fieldName: string) =>
  z.string().trim().min(1, `${fieldName} is required`);

const dateString = (fieldName: string) =>
  requiredString(fieldName).transform((value, ctx) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${fieldName} must be a valid date`
      });
      return z.NEVER;
    }

    return date;
  });

const optionalDateString = (fieldName: string) =>
  z
    .string()
    .trim()
    .optional()
    .transform((value, ctx) => {
      if (!value) {
        return undefined;
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${fieldName} must be a valid date`
        });
        return z.NEVER;
      }

      return date;
    });

const optionalComment = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value && value.length > 0 ? value : null));

export const workLogEntrySchema = z.object({
  date: dateString("date"),
  workTypeId: z.coerce
    .number()
    .int("workTypeId must be an integer")
    .positive("workTypeId is required"),
  volumeValue: z.coerce.number().positive("volumeValue must be greater than 0"),
  volumeUnit: requiredString("volumeUnit"),
  performerName: requiredString("performerName"),
  comment: optionalComment
});

export const workLogEntryQuerySchema = z.object({
  dateFrom: optionalDateString("dateFrom"),
  dateTo: optionalDateString("dateTo"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc")
});

export const workLogEntryParamsSchema = z.object({
  id: z.coerce.number().int("id must be an integer").positive("id must be positive")
});
