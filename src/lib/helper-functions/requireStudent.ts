
import { getCurrentStudent } from "./getCurrentStudent";

export async function requireStudent(): Promise<void> {
    await getCurrentStudent();
}
