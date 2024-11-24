import { SQL } from "drizzle-orm";

type FilterFactory<T> = (value: NonNullable<T>) => SQL | undefined;
export function when<T>(value: T, factory: FilterFactory<T>) {
  return value ? factory(value) : undefined;
}
