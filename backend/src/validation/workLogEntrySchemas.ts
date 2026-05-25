import { z } from "zod";

const requiredString = (fieldName: string) =>
  z.string().trim().min(1, `Поле ${fieldName} обязательно`);

const dateString = (fieldName: string) =>
  requiredString(fieldName).transform((value, ctx) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Поле ${fieldName} должно быть валидной датой`
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
          message: `Поле ${fieldName} должно быть валидной датой`
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
    .int("workTypeId должен быть целым числом")
    .positive("Поле workTypeId обязательно"),
  volumeValue: z.coerce.number().positive("volumeValue должен быть больше 0"),
  volumeUnit: requiredString("volumeUnit"),
  performerName: requiredString("performerName"),
  comment: optionalComment
});

const paginationNumber = (defaultValue: number, maxValue?: number) =>
  z.preprocess(
    (value) => (value === undefined || value === "" ? defaultValue : value),
    z.coerce
      .number()
      .int("Значение должно быть целым числом")
      .min(1, "Значение должно быть больше 0")
      .pipe(maxValue ? z.number().max(maxValue, `Значение должно быть не больше ${maxValue}`) : z.number())
  );

export const workLogEntryQuerySchema = z.object({
  dateFrom: optionalDateString("dateFrom"),
  dateTo: optionalDateString("dateTo"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  page: paginationNumber(1),
  pageSize: paginationNumber(10, 100)
});

export const workLogEntryParamsSchema = z.object({
  id: z.coerce.number().int("id должен быть целым числом").positive("id должен быть больше 0")
});
